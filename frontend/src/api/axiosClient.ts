import axios from "axios";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: any[] = [];
// todo: kiểm tra trường hợp nếu cookie không hợp lệ thì làm như thế nào (isRevoked)
const processQueue = (error: any, token: String | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axiosClient.interceptors.request.use(
    (config) => {
        const accessToken = sessionStorage.getItem("access_token");
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        console.error("Error in request interceptor:", error);
        return Promise.reject(error);
    },
);

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // 1. Intercepting the Error
        // Check if it's a 401 error and this specific request hasn't tried to refresh yet
        if (
            error.response &&
            error.response.status === 401 &&
            error.response.data.code !== "INVALID_USER_OR_PASSWORD" &&
            !originalRequest._retry
        ) {
            // 2. Handling Concurrent Requests
            // If a token refresh is already in progress, queue the request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    // Suspend the request by pushing its control (resolve/reject) into the failedQueue
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            // 3. Preventing Infinite Loops
            originalRequest._retry = true;

            // 4. Locking the State
            // Lock the door, so that no other request can enter the refresh logic until we're done
            isRefreshing = true;

            try {
                // 5. Requesting a New Token
                const refreshResponse = await axiosClient.post(
                    "/auth/refresh",
                    {},
                    { withCredentials: true },
                );

                const newAccessToken = refreshResponse.data.details.accessToken;

                // 6. Updating the Token on success
                sessionStorage.setItem("access_token", newAccessToken);

                // Update token for Axios instance in RAM to apply for feature requests
                axiosClient.defaults.headers.common["Authorization"] =
                    `Bearer ${newAccessToken}`;
                // Update token for the current request
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // 7. Releasing the Queue
                // Wake up all suspended requests and provide them with the new token
                processQueue(null, newAccessToken);

                // 8. Retrying the Original Request
                // Retry the original request with the new token
                return axiosClient(originalRequest);
            } catch (refreshError) {
                // 9. Handling Refresh Failure
                // If refresh fails (e.g., refresh token expired), throw errors to all queued requests
                processQueue(refreshError, null);
                console.error(
                    "Refresh token expired or invalid. Logging out...",
                );
                sessionStorage.removeItem("access_token");

                // Throw the error back to the component that initiated the pioneer request
                return Promise.reject(refreshError);
            } finally {
                // 10. Unlocking the State
                // Open the system again for future token refresh cycles
                isRefreshing = false;
            }
        }
        // Catch-all for any other errors (404, 500, or a failed retried request)
        return Promise.reject(error);
    },
);

export default axiosClient;
