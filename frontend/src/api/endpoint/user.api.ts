import type { AxiosResponse } from "axios";
import axiosClient from "../axiosClient";
import type {
    ApiResponse,
    BasicUser,
    FullUser,
    UpdateProfileRequest,
    UpdatePasswordRequest,
    UpdateStatusRequest,
    NotifyRequest
} from "@/type";

export const userApi = {
    getMe: (): Promise<AxiosResponse<ApiResponse<BasicUser>>> => {
        return axiosClient.get("/users/me");
    },
    getUser: (userId: string): Promise<AxiosResponse<ApiResponse<FullUser>>> => {
        return axiosClient.get(`/users/${ userId }`);
    },
    updateProfile: (payload: UpdateProfileRequest): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.patch("/users/me", payload);
    },
    updatePassword: (payload: UpdatePasswordRequest): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.put("/users/me/password", payload);
    },
    updateUserStatus: (userId: string, payload: UpdateStatusRequest): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.patch(`/users/${ userId }/status`, payload);
    },
    sendNotification: (userId: string, payload: NotifyRequest): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.post(`/users/${ userId }/notify`, payload);
    },
    deleteUser: (userId: string): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.delete(`/users/${ userId }`);
    }
};
