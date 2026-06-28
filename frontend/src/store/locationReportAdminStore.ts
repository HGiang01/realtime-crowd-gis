import { create } from "zustand";
import { reportApi, type ReportFilterParams } from "@/api";
import type { Report } from "@/type";

interface LocationReportAdminState {
    reports: Report.LocationList[];
    revisions: Report.LocationRevision[];
    pendingReports: Report.LocationList[];
    currentReport: Report.Location | null;
    pagination: Report.SpringPage<any>["page"] | null;

    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;

    fetchPendingReports: (params: ReportFilterParams) => Promise<boolean>;
    fetchAdminReports: (params: ReportFilterParams) => Promise<boolean>;
    fetchAdminLocationRevisions: (id: string) => Promise<boolean>;
    fetchAdminReportById: (id: string) => Promise<boolean>;
    assignReport: (id: string) => Promise<boolean>;
    approveReport: (id: string) => Promise<boolean>;
    rejectReport: (id: string) => Promise<boolean>;
    clearCurrentReport: () => void;
    clearError: () => void;
}

export const useLocationReportAdminStore = create<LocationReportAdminState>(
    (set, get) => ({
        reports: [],
        revisions: [],
        pendingReports: [],
        currentReport: null,
        pagination: null,
        isLoading: false,
        isSubmitting: false,
        error: null,

        fetchPendingReports: async (params: ReportFilterParams) => {
            set({ isLoading: true, error: null });
            try {
                const response =
                    await reportApi.getPendingLocationReports(params);
                const responseData = response.data.details;
                if (!responseData) throw new Error("No data received");

                const { content, page: pageInfo } = responseData;
                set({
                    pendingReports: content,
                    pagination: pageInfo,
                    isLoading: false,
                });

                return true;
            } catch (error: any) {
                console.error(
                    "Failed to fetch pending location reports:",
                    error.response?.data?.message || error.message,
                );
                set({
                    error:
                        error.response?.data?.message ||
                        "Failed to fetch pending location reports",
                    isLoading: false,
                });
                return false;
            }
        },

        fetchAdminReports: async (params: ReportFilterParams) => {
            set({ isLoading: true, error: null });
            try {
                const response =
                    await reportApi.getLocationReportsByAdminId(params);

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
                console.error(
                    "Failed to fetch location reports:",
                    error.response?.data?.message || error.message,
                );
                set({
                    error:
                        error.response?.data?.message ||
                        "Failed to fetch location reports",
                    isLoading: false,
                });
                return false;
            }
        },
        fetchAdminLocationRevisions: async (id: string) => {
            set({ isLoading: true, error: null, revisions: [] });
            try {
                const response =
                    await reportApi.getLocationRevisions(id);
                const responseData = response.data.details;
                // if (!responseData) throw new Error("No data received");

                set({
                    revisions: responseData,
                    isLoading: false,
                });
                return true;
            } catch (error: any) {
                console.error(
                    "Failed to fetch location report revisions:",
                    error.response?.data?.message || error.message,
                );
                set({
                    error:
                        error.response?.data?.message ||
                        "Failed to fetch location report revisions",
                    isLoading: false,
                });
                return false;
            }
        },
        fetchAdminReportById: async (id: string) => {
            set({ isLoading: true, error: null, currentReport: null });
            try {
                const response =
                    await reportApi.getLocationReportByIdAndAdminId(id);
                set({
                    currentReport: response.data.details,
                    isLoading: false,
                });
                return true;
            } catch (error: any) {
                console.error(
                    "Failed to fetch location report:",
                    error.response?.data?.message || error.message,
                );
                set({
                    error:
                        error.response?.data?.message ||
                        "Failed to fetch location report",
                    isLoading: false,
                });
                return false;
            }
        },

        assignReport: async (id: string) => {
            try {
                await reportApi.assignLocationReport(id);
                return true;
            } catch (error: any) {
                console.error(
                    "Failed to assign location report:",
                    error.response?.data?.message || error.message,
                );
                return false;
            }
        },

        approveReport: async (id: string) => {
            try {
                await reportApi.approveLocationReport(id);
                return true;
            } catch (error: any) {
                console.error(
                    "Failed to approve location report:",
                    error.response?.data?.message || error.message,
                );
                return false;
            }
        },

        rejectReport: async (id: string) => {
            try {
                await reportApi.rejectLocationReport(id);
                return true;
            } catch (error: any) {
                console.error(
                    "Failed to reject location report:",
                    error.response?.data?.message || error.message,
                );
                return false;
            }
        },

        clearCurrentReport: () => {
            set({ currentReport: null });
        },

        clearError: () => {
            set({ error: null });
        },
    }),
);
