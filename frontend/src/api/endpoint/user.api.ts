import type { AxiosResponse } from "axios";
import axiosClient from "../axiosClient";
import type { ApiResponse, User } from "@/type";

export const userApi = {
    getProfile: (): Promise<AxiosResponse<ApiResponse<User>>> => {
        return axiosClient.get("/users/me");
    },
};
