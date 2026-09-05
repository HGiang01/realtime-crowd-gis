import { create } from "zustand";
import { reportApi, type ReportFilterParams } from "@/api";
import type { Report } from "@/type";

interface IncidentReportState {
    reports: Report.IncidentList[];
    currentReport: Report.Incident | null;
    currentReportResult: Report.IncidentReportResult | null;
    pagination: Report.SpringPage<any>["page"] | null;

    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;

    fetchUserReports: (params: ReportFilterParams) => Promise<boolean>;
    fetchUserReportById: (id: string) => Promise<boolean>;
    fetchReportResultById: (id: string) => Promise<boolean>;
    createReport: (payload: FormData) => Promise<boolean>;
    ratingReport: (id: string, data: FormData) => Promise<boolean>;
    clearCurrentReport: () => void;
    clearError: () => void;
}

export const useIncidentReportStore = create<IncidentReportState>((set, get) => ({
    reports: [],
    currentReport: null,
    currentReportResult: null,
    pagination: null,
    isLoading: false,
    isSubmitting: false,
    error: null,

    fetchUserReports: async (params: ReportFilterParams) => {
        set({ isLoading: true, error: null });
        try {
            const response = await reportApi.getIncidentReportsByUserId(params);

            const responseData = response.data.details;
            if (!responseData) throw new Error("No data received");

            const { content, page: pageInfo } = responseData;
            set({
                reports: content,
                pagination: pageInfo,
                isLoading: false,
            });
            return true;
        } catch (error: any) {
            set({
                error:
                    error.response?.data?.message ||
                    "Failed to fetch incident reports",
                isLoading: false,
            });
            return false;
        }
    },

    fetchUserReportById: async (id: string) => {
        set({ isLoading: true, error: null, currentReport: null });
        try {
            const response = await reportApi.getIncidentReportByIdAndUserId(id);
            set({
                currentReport: response.data.details,
                isLoading: false,
            });
            return true;
        } catch (error: any) {
            set({
                error:
                    error.response?.data?.message ||
                    "Failed to fetch incident report",
                isLoading: false,
            });
            return false;
        }
    },
    fetchReportResultById: async (id: string) => {
        set({ isLoading: true, error: null, currentReportResult: null });
        try {
            const response = await reportApi.getIncidentReportResultById(id);
            set({
                currentReportResult: response.data.details,
                isLoading: false,
            });
            return true;
        } catch (error: any) {
            console.error(
                "Failed to fetch incident report result:",
                error.response?.data?.message || error.message,
            );
            set({
                isLoading: false,
            });
            return false;
        }
    },
    createReport: async (payload: FormData) => {
        set({ isSubmitting: true, error: null });
        try {
            await reportApi.createIncidentReport(payload);
            set({ isSubmitting: false });
            return true;
        } catch (error: any) {
            set({
                error:
                    error.response?.data?.message ||
                    "Failed to create incident report",
                isSubmitting: false,
            });
            return false;
        }
    },

    ratingReport: async (id: string, data: FormData) => {
        set({ isSubmitting: true, error: null });
        try {
            await reportApi.ratingIncidentReportResult(id, data);
            set({ isSubmitting: false });
            return true;
        } catch (error: any) {
            set({
                error:
                    error.response?.data?.message ||
                    "Failed to submit rating for incident report",
                isSubmitting: false,
            });
            return false;
        }
    },

    clearCurrentReport: () => {
        set({ currentReport: null });
    },

    clearError: () => {
        set({ error: null });
    },
}));
