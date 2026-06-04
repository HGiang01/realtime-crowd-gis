import { create } from "zustand";
import { authApi } from "@/api";
import type {
    LoginRequest,
    RegisterRequest,
    VerifyEmailRequest,
    ResetPasswordRequest,
    User,
} from "@/type";
import { userApi } from "@/api/endpoint/user.api.ts";

interface AuthState {
    user: User | null;
    pendingEmail: string | null;
    resetPasswordEmail: string | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    register: (payload: RegisterRequest) => Promise<boolean>;
    login: (payload: LoginRequest) => Promise<boolean>;
    loginWithOAuth2: () => Promise<boolean>;
    logout: () => Promise<void>;
    verifyEmail: (payload: VerifyEmailRequest) => Promise<boolean>;
    resendOtp: (email: string) => Promise<boolean>;
    forgotPassword: (email: string) => Promise<boolean>;
    resetPassword: (payload: ResetPasswordRequest) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    pendingEmail: null,
    resetPasswordEmail: null,
    accessToken: sessionStorage.getItem("access_token"),
    isAuthenticated: !!sessionStorage.getItem("access_token"),
    isLoading: false,
    error: null,

    register: async (payload: RegisterRequest) => {
        set({ isLoading: true, error: null });
        try {
            const registerResponse = await authApi.register(payload);

            if (
                registerResponse.status == 201 ||
                registerResponse.data.code == "SUCCESS"
            ) {
                set({ pendingEmail: payload.email, isLoading: false });
                return true;
            }

            set({ isLoading: false });
            return false;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || "Registration failed",
                isLoading: false,
            });
        }
        return false;
    },

    login: async (payload: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
            await authApi.login(payload);
        } catch (error: any) {
            set({
                error: error.response?.data?.message || "Login failed",
                isLoading: false,
            });
            return false;
        }

        try {
            const refreshAccessTokenResponse =
                await authApi.refreshAccessToken();
            if (!refreshAccessTokenResponse.data.details?.accessToken) {
                await authApi.logout();
                set({
                    isLoading: false,
                    error: "Failed to retrieve access token",
                });
                return false;
            }

            const accessToken =
                refreshAccessTokenResponse.data.details.accessToken;
            sessionStorage.setItem("access_token", accessToken);

            const getProfileResponse = await userApi.getProfile();
            if (!getProfileResponse.data.details) {
                await authApi.logout();
                sessionStorage.removeItem("access_token");
                set({
                    isLoading: false,
                    error: "Failed to retrieve user profile",
                });
            }

            set({
                user: getProfileResponse.data.details,
                accessToken: accessToken,
                isAuthenticated: true,
                isLoading: false,
            });

            return true;
        } catch (error: any) {
            await authApi.logout();
            sessionStorage.removeItem("access_token");
            set({
                isLoading: false,
                error:
                    error.response?.data?.message ||
                    error.message ||
                    "Initialization of login session failed",
            });
            return false;
        }
    },
    loginWithOAuth2: async () => {
        try {
            const refreshAccessTokenResponse =
                await authApi.refreshAccessToken();
            if (!refreshAccessTokenResponse.data.details?.accessToken) {
                await authApi.logout();
                set({
                    isLoading: false,
                    error: "Failed to retrieve access token",
                });
                return false;
            }

            const accessToken =
                refreshAccessTokenResponse.data.details.accessToken;
            sessionStorage.setItem("access_token", accessToken);

            const getProfileResponse = await userApi.getProfile();
            if (!getProfileResponse.data.details) {
                await authApi.logout();
                sessionStorage.removeItem("access_token");
                set({
                    isLoading: false,
                    error: "Failed to retrieve user profile",
                });
            }

            set({
                user: getProfileResponse.data.details,
                accessToken: accessToken,
                isAuthenticated: true,
                isLoading: false,
            });

            return true;
        } catch (error: any) {
            await authApi.logout();
            sessionStorage.removeItem("access_token");
            set({
                isLoading: false,
                error:
                    error.response?.data?.message ||
                    error.message ||
                    "Initialization of login session failed",
            });
            return false;
        }
    },
    logout: async () => {
        sessionStorage.removeItem("access_token");
        set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
        });
        await authApi.logout();
    },

    verifyEmail: async (payload: VerifyEmailRequest) => {
        set({ isLoading: true, error: null });
        try {
            const verifyEmailResponse = await authApi.verifyEmail(payload);
            if (verifyEmailResponse.status === 200) {
                set({ pendingEmail: null, isLoading: false });
                return true;
            }
            set({ isLoading: false });
            return false;
        } catch (error: any) {
            set({
                error:
                    error.response?.data?.message ||
                    "Email verification failed",
                isLoading: false,
            });
            return false;
        }
    },

    resendOtp: async (email: string) => {
        set({ error: null });
        try {
            const sendOtpResponse = await authApi.resendOtp(email);
            return sendOtpResponse.status === 200;
        } catch (error: any) {
            set({
                error: error.response?.data?.message || "Failed to resend OTP",
            });
            return false;
        }
    },

    forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
            const forgotPasswordResponse = await authApi.forgotPassword(email);
            if (forgotPasswordResponse.status === 200) {
                set({ resetPasswordEmail: email, isLoading: false });
                return true;
            }
            set({ isLoading: false });
            return false;
        } catch (error: any) {
            set({
                error:
                    error.response?.data?.message ||
                    "Failed to send password reset OTP",
                isLoading: false,
            });
            return false;
        }
    },

    resetPassword: async (payload: ResetPasswordRequest) => {
        set({ isLoading: true, error: null });
        try {
            const resetPasswordResponse = await authApi.resetPassword(payload);
            if (resetPasswordResponse.status === 200) {
                set({ resetPasswordEmail: null, isLoading: false });
                return true;
            }
            set({ isLoading: false });
            return false;
        } catch (error: any) {
            set({
                error:
                    error.response?.data?.message || "Failed to reset password",
                isLoading: false,
            });
            return false;
        }
    },
}));
