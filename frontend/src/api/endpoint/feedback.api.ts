import type { AxiosResponse } from "axios";
import axiosClient from "../axiosClient";
import type { ApiResponse } from "@/type";

export const feedbackApi = {
    createFeedback: (
        payload: FormData,
    ): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.post("/feedback", payload);
    },
};
