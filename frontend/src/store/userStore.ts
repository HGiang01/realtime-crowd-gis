import { create } from "zustand";
import { userApi } from "@/api/endpoint/user.api.ts";
import type { UpdatePasswordRequest, UpdateProfileRequest } from "@/type";
import { useAuthStore } from "@/store/authStore.ts";

interface UserState {
    isLoading: boolean;
    error: string | null;

    updateProfile: (payload: UpdateProfileRequest) => Promise<boolean>;
    updatePassword: (payload: UpdatePasswordRequest) => Promise<boolean>;
}

export const useUserStore = create<UserState>((set) => ({
    isLoading: false,
    error: null,

    updateProfile: async (payload: UpdateProfileRequest) => {
        set({isLoading: true, error: null});
        try {
            await userApi.updateProfile(payload);

            const getProfileResponse = await userApi.getMe();

            if (getProfileResponse.data.details) {
                useAuthStore.getState().setUser(getProfileResponse.data.details);
            }

            set({isLoading: false});
            return true;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || "Profile update failed",
                isLoading: false,
            });
            return false;
        }
    },

    updatePassword: async (payload: UpdatePasswordRequest) => {
        set({isLoading: true, error: null});
        try {
            await userApi.updatePassword(payload);
            set({isLoading: false});
            return true;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || "Password update failed",
                isLoading: false,
            });
            return false;
        }
    }
}));