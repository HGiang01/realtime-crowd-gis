import type { AxiosResponse } from "axios";
import axiosClient from "../axiosClient";
import type {
    ApiResponse,
    AccessToken,
    LoginRequest,
    RegisterRequest,
    VerifyEmailRequest,
    ResetPasswordRequest
} from "@/type";

export const authApi = {
    register: (
        payload: RegisterRequest,
    ): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.post("/auth/register", payload);
    },
    login: (
        payload: LoginRequest,
    ): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.post("/auth/login", payload);
    },
    logout: (
        allDevices: boolean = false,
    ): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.post("/auth/logout", null, {
            params: {
                "all-devices": allDevices,
            },
        });
    },
    refreshAccessToken: (): Promise<
        AxiosResponse<ApiResponse<AccessToken>>
    > => {
        return axiosClient.post("/auth/refresh", null, {
            withCredentials: true,
        });
    },
    resendOtp: (email: string): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.post("/auth/resend-otp", {email});
    },
    verifyEmail: (
        payload: VerifyEmailRequest,
    ): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.post("/auth/verify-email", payload);
    },
    forgotPassword: (email: string): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.post("/auth/forgot-password", {email});
    },
    resetPassword: (payload: ResetPasswordRequest): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.post("/auth/reset-password", payload);
    }
};
