import { create } from "zustand";
import { type ReportFilterParams, reportApi } from "@/api";
import type { Report } from "@/type";

interface LocationReportState {
    reports: Report.LocationList[];
    currentReport: Report.Location | null;
    pagination: Report.SpringPage<any>["page"] | null;

    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;

    fetchUserReports: (params: ReportFilterParams) => Promise<boolean>;
    fetchUserReportById: (id: string) => Promise<boolean>;
    createReport: (payload: FormData) => Promise<boolean>;
    updateReport: (payload: FormData) => Promise<boolean>;
    clearCurrentReport: () => void;
    clearError: () => void;
}

export const useLocationReportStore = create<LocationReportState>(
    (set, get) => ({
        reports: [],
        currentReport: null,
        pagination: null,
        isLoading: false,
        isSubmitting: false,
        error: null,

        fetchUserReports: async (params = {}) => {
            set({ isLoading: true, error: null });
            try {
                const response = await reportApi.getLocationReportsByUserId(params);

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
                        "Failed to fetch location reports",
                    isLoading: false,
                });
                return false;
            }
        },

        fetchUserReportById: async (id: string) => {
            set({ isLoading: true, error: null, currentReport: null });
            try {
                const response =
                    await reportApi.getLocationReportByIdAndUserId(id);
                set({
                    currentReport: response.data.details,
                    isLoading: false,
                });
                return true;
            } catch (error: any) {
                set({
                    error:
                        error.response?.data?.message ||
                        "Failed to fetch location report details",
                    isLoading: false,
                });
                return false;
            }
        },

        createReport: async (payload: FormData) => {
            set({ isSubmitting: true, error: null });
            try {
                await reportApi.createLocationReport(payload);

                set({ isSubmitting: false });

                return true;
            } catch (error: any) {
                set({
                    error:
                        error.response?.data?.message ||
                        "Failed to create location report",
                    isSubmitting: false,
                });
                return false;
            }
        },

        updateReport: async (payload: FormData) => {
            set({ isSubmitting: true, error: null });
            try {
                await reportApi.updateLocationReport(payload);

                set({ isSubmitting: false });

                return true;
            } catch (error: any) {
                set({
                    error:
                        error.response?.data?.message ||
                        "Failed to update location report",
                    isSubmitting: false,
                });
                return false;
            }
        },

        clearCurrentReport: () => set({ currentReport: null }),
        clearError: () => set({ error: null }),
    }),
);
