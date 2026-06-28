import type { AxiosResponse } from "axios";
import axiosClient from "../axiosClient";
import type { ApiResponse, Report } from "@/type";

export const mapApi = {
    getLocationDetail: (
        id: string,
    ): Promise<AxiosResponse<ApiResponse<Report.Location>>> => {
        return axiosClient.get(`/map/locations/${id}`);
    },

    searchLocation: (
        keyword: string,
    ): Promise<AxiosResponse<ApiResponse<Report.SearchLocation[]>>> => {
        return axiosClient.get(`/map/locations/search`, {
            params: {
                keyword,
            },
        });
    },
};