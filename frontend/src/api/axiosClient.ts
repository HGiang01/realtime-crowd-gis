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
        const isRefreshUrl = config.url?.includes("/auth/refresh");
        if (accessToken && !isRefreshUrl) {
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

        const isRefreshUrl = originalRequest.url?.includes("/auth/refresh");

        if (
            error.response &&
            error.response.status === 401 &&
            error.response.data.code !== "INVALID_USER_OR_PASSWORD" &&
            !originalRequest._retry &&
            !isRefreshUrl
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
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

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshResponse = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true },
                );

                const newAccessToken = refreshResponse.data.details.accessToken;

                sessionStorage.setItem("access_token", newAccessToken);

                axiosClient.defaults.headers.common["Authorization"] =
                    `Bearer ${newAccessToken}`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                processQueue(null, newAccessToken);

                return axiosClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                console.error(
                    "Refresh token expired or invalid. Logging out...",
                );
                sessionStorage.removeItem("access_token");

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    },
);

export default axiosClient;
