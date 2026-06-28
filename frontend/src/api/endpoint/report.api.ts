import type { AxiosResponse } from "axios";
import axiosClient from "../axiosClient";
import type { ApiResponse, Report } from "@/type";
export interface ReportFilterParams {
    page?: number;
    size?: number;
    keyword?: string;
    status?: string;
    level?: string;
    category?: string;
    sort?: string;
}
export const reportApi = {
    getLocationReportsByUserId: (
        params: ReportFilterParams,
    ): Promise<
        AxiosResponse<ApiResponse<Report.SpringPage<Report.LocationList>>>
    > => {
        return axiosClient.get("/reports/me/locations", {
            params: {
                page: params.page ?? 0,
                size: params.size ?? 20,
                ...(params.sort && { sort: params.sort }),
                ...(params.keyword && { keyword: params.keyword }),
                ...(params.status && { status: params.status }),
                ...(params.category && { category: params.category }),
            },
        });
    },

    getLocationReportsByAdminId: (
        params: ReportFilterParams,
    ): Promise<
        AxiosResponse<ApiResponse<Report.SpringPage<Report.LocationList>>>
    > => {
        return axiosClient.get("/admin/reports/locations/my-tasks", {
            params: {
                page: params.page ?? 0,
                size: params.size ?? 20,
                ...(params.sort && { sort: params.sort }),
                ...(params.keyword && { keyword: params.keyword }),
                ...(params.status && { status: params.status }),
                ...(params.category && { category: params.category }),
            },
        });
    },

    getIncidentReportsByUserId: (
        params: ReportFilterParams,
    ): Promise<
        AxiosResponse<ApiResponse<Report.SpringPage<Report.IncidentList>>>
    > => {
        return axiosClient.get("/reports/me/incidents", {
            params: {
                page: params.page ?? 0,
                size: params.size ?? 20,
                ...(params.sort && { sort: params.sort }),
                ...(params.keyword && { keyword: params.keyword }),
                ...(params.status && { status: params.status }),
                ...(params.level && { level: params.level }),
                ...(params.category && { category: params.category }),
            },
        });
    },

    getIncidentReportsByAdminId: (
        params: ReportFilterParams,
    ): Promise<
        AxiosResponse<ApiResponse<Report.SpringPage<Report.IncidentList>>>
    > => {
        return axiosClient.get("/admin/reports/incidents/my-tasks", {
            params: {
                page: params.page ?? 0,
                size: params.size ?? 20,
                ...(params.sort && { sort: params.sort }),
                ...(params.keyword && { keyword: params.keyword }),
                ...(params.status && { status: params.status }),
                ...(params.level && { level: params.level }),
                ...(params.category && { category: params.category }),
            },
        });
    },

    getLocationReportByIdAndUserId: (
        id: string,
    ): Promise<AxiosResponse<ApiResponse<Report.Location>>> => {
        return axiosClient.get(`/reports/locations/${id}`);
    },

    getLocationReportByIdAndAdminId: (
        id: string,
    ): Promise<AxiosResponse<ApiResponse<Report.Location>>> => {
        return axiosClient.get(`/admin/reports/locations/${id}`);
    },

    getIncidentReportByIdAndUserId: (
        id: string,
    ): Promise<AxiosResponse<ApiResponse<Report.Incident>>> => {
        return axiosClient.get(`/reports/incidents/${id}`);
    },

    getIncidentReportByIdAndAdminId: (
        id: string,
    ): Promise<AxiosResponse<ApiResponse<Report.Incident>>> => {
        return axiosClient.get(`/admin/reports/incidents/${id}`);
    },
    createLocationReport: (
        payload: FormData,
    ): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.post("/reports/locations", payload, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    updateLocationReport: (
        payload: FormData,
    ): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.post("/reports/locations/update", payload, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    createIncidentReport: (
        payload: FormData,
    ): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.post("/reports/incidents", payload, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },

    assignIncidentReport: (
        id: string,
    ): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.patch(`/admin/reports/incidents/${id}/assign`);
    },

    createIncidentReportResult: (
        id: string,
        payload: FormData,
    ): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.post(
            `/admin/reports/incidents/${id}/result`,
            payload,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );
    },

    updateIncidentReportResult: (
        id: string,
        payload: FormData,
    ): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.patch(
            `/admin/reports/incidents/${id}/result`,
            payload,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );
    },

    getIncidentReportResultById: (
        id: string,
    ): Promise<AxiosResponse<ApiResponse<Report.IncidentReportResult>>> => {
        return axiosClient.get(`/reports/incidents/${id}/result`);
    },

    ratingIncidentReportResult: (
        id: string,
        payload: FormData,
    ): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.patch(
            `/reports/incidents/${id}/result/rating`,
            payload,
        );
    },

    assignLocationReport: (
        id: string,
    ): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.patch(`/admin/reports/locations/${id}/assign`);
    },
    getPendingLocationReports: (
        params: ReportFilterParams,
    ): Promise<
        AxiosResponse<ApiResponse<Report.SpringPage<Report.LocationList>>>
    > => {
        return axiosClient.get("/admin/reports/locations/pending", {
            params: {
                page: params.page ?? 0,
                size: params.size ?? 20,
                ...(params.sort && { sort: params.sort }),
                ...(params.keyword && { keyword: params.keyword }),
                ...(params.category && { category: params.category }),
            },
        });
    },

    approveLocationReport: (
        id: string,
    ): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.patch(`/admin/reports/locations/${id}/approve`);
    },

    rejectLocationReport: (
        id: string,
    ): Promise<AxiosResponse<ApiResponse<void>>> => {
        return axiosClient.patch(`/admin/reports/locations/${id}/reject`);
    },

    getLocationRevisions: (
        id: string,
    ): Promise<AxiosResponse<ApiResponse<Report.LocationRevision[]>>> => {
        return axiosClient.get(`/admin/reports/locations/${id}/revisions`);
    },
};
