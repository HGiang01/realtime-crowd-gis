import { create } from "zustand";
import { reportApi, type ReportFilterParams } from "@/api";
import type { Report } from "@/type";

interface IncidentReportAdminState {
    reports: Report.IncidentList[];
    currentReport: Report.Incident | null;
    currentReportResult: Report.IncidentReportResult | null;
    pagination: Report.SpringPage<any>["page"] | null;

    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;

    fetchAdminReports: (params: ReportFilterParams) => Promise<boolean>;
    fetchAdminReportById: (id: string) => Promise<boolean>;
    fetchReportResultById: (id: string) => Promise<boolean>;
    assignReport: (id: string) => Promise<boolean>;
    createReportResult: (id: string, data: FormData) => Promise<boolean>;
    updateReportResult: (id: string, data: FormData) => Promise<boolean>;
    clearCurrentReport: () => void;
    clearError: () => void;
}

export const useIncidentReportAdminStore = create<IncidentReportAdminState>(
    (set, get) => ({
        reports: [],
        currentReport: null,
        currentReportResult: null,
        pagination: null,
        isLoading: false,
        isSubmitting: false,
        error: null,

        fetchAdminReports: async (params: ReportFilterParams) => {
            set({ isLoading: true, error: null });
            try {
                const response =
                    await reportApi.getIncidentReportsByAdminId(params);

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

        fetchAdminReportById: async (id: string) => {
            set({ isLoading: true, error: null, currentReport: null });
            try {
                const response =
                    await reportApi.getIncidentReportByIdAndAdminId(id);
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

        assignReport: async (id: string) => {
            try {
                await reportApi.assignIncidentReport(id);
                return true;
            } catch (error: any) {
                console.error(
                    "Failed to assign incident report:",
                    error.response?.data?.message || error.message,
                );
                return false;
            }
        },

        createReportResult: async (id: string, data: FormData) => {
            set({ isSubmitting: true, error: null });
            try {
                await reportApi.createIncidentReportResult(id, data);
                set({ isSubmitting: false });
                return true;
            } catch (error: any) {
                set({
                    error:
                        error.response?.data?.message ||
                        "Failed to create incident report result",
                    isSubmitting: false,
                });
                return false;
            }
        },

        updateReportResult: async (id: string, data: FormData) => {
            set({ isSubmitting: true, error: null });
            try {
                await reportApi.updateIncidentReportResult(id, data);
                set({ isSubmitting: false });
                return true;
            } catch (error: any) {
                set({
                    error:
                        error.response?.data?.message ||
                        "Failed to update incident report result",
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
    }),
);
