import React, { useState } from "react";
import Header from "../../../component/Header.tsx";
import Navigate from "../component/Navigate.tsx";
import { useUserStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, RefreshCcw } from "lucide-react";

export default function UpdatePassword() {
    const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
        useState(false);
    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
    const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] =
        useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const { updatePassword, isLoading, error } = useUserStore();
    const navigate = useNavigate();

    const handleUpdatePassword = async (
        e: React.SubmitEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();

        const isSuccess = await updatePassword({
            currentPassword,
            newPassword,
            confirmNewPassword,
        });
        if (isSuccess) {
            navigate("/auth/login");
        }
    };
    return (
        // 🌟 Mở khóa cuộn dọc trên Mobile (overflow-y-auto)
        <div className="flex flex-col relative min-h-screen overflow-y-auto lg:overflow-hidden bg-wg-background text-on-wg-background">
            <style>{`
                @keyframes fade-up {
                    0% { opacity: 0; transform: translateY(16px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .fade-up { animation: fade-up 600ms ease-out both; }
            `}</style>

            {/* 🌟 Ẩn blur trang trí trên màn hình nhỏ để tăng hiệu năng */}
            <div className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-wg-primary-soft blur-3xl hidden lg:block" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-wg-primary-container/30 blur-3xl hidden lg:block" />

            <Header />

            {/* 🌟 Đổi sang flex-col trên Mobile và flex-row trên Desktop, nới lỏng max-width */}
            <main className="flex-1 relative z-10 w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-6 p-4 sm:p-6 lg:p-8">
                {/* 🌟 Gói thanh Navigate lại và thiết lập độ rộng */}
                <div className="w-full lg:w-[280px] shrink-0">
                    <Navigate />
                </div>

                <section
                    className="flex-1 min-w-0 fade-up flex flex-col rounded-3xl border border-wg-outline-variant bg-wg-surface-container-lowest p-5 md:p-8 shadow-sm"
                    style={{ animationDelay: "480ms" }}
                >
                    <h3 className="text-xl font-bold text-gray-800 border-b border-wg-outline-variant/50 pb-3 mb-6">
                        Edit Profile
                    </h3>

                    <div className="flex-1 flex items-center justify-center py-4 lg:py-0">
                        {/* 🌟 Bỏ min-w-80, thay bằng w-full max-w-md để co giãn vừa khít điện thoại */}
                        <form
                            onSubmit={handleUpdatePassword}
                            className="w-full max-w-md space-y-5"
                        >
                            <label className="block text-sm font-medium text-on-wg-surface">
                                Current Password
                                <div className="relative mt-2">
                                    <input
                                        tabIndex={2}
                                        className="w-full rounded-xl border border-wg-outline bg-wg-surface-container-lowest px-4 py-3 pr-11 text-sm text-on-wg-surface outline-none transition focus:border-wg-primary"
                                        placeholder="••••••••"
                                        type={
                                            isCurrentPasswordVisible
                                                ? "text"
                                                : "password"
                                        }
                                        name="currentPassword"
                                        value={currentPassword}
                                        onChange={(e) =>
                                            setCurrentPassword(e.target.value)
                                        }
                                    />
                                    <button
                                        aria-label={
                                            isCurrentPasswordVisible
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        aria-pressed={
                                            isConfirmNewPasswordVisible
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-wg-surface-variant hover:text-on-wg-surface cursor-pointer"
                                        onClick={() =>
                                            setIsCurrentPasswordVisible(
                                                (prev) => !prev,
                                            )
                                        }
                                        type="button"
                                    >
                                        {isCurrentPasswordVisible ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </label>

                            <label className="block text-sm font-medium text-on-wg-surface">
                                New Password
                                <div className="relative mt-2">
                                    <input
                                        tabIndex={2}
                                        className="w-full rounded-xl border border-wg-outline bg-wg-surface-container-lowest px-4 py-3 pr-11 text-sm text-on-wg-surface outline-none transition focus:border-wg-primary"
                                        placeholder="••••••••"
                                        type={
                                            isNewPasswordVisible
                                                ? "text"
                                                : "password"
                                        }
                                        name="newPassword"
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                    />
                                    <button
                                        aria-label={
                                            isNewPasswordVisible
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        aria-pressed={isNewPasswordVisible}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-wg-surface-variant hover:text-on-wg-surface cursor-pointer"
                                        onClick={() =>
                                            setIsNewPasswordVisible(
                                                (prev) => !prev,
                                            )
                                        }
                                        type="button"
                                    >
                                        {isNewPasswordVisible ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </label>

                            <label className="block text-sm font-medium text-on-wg-surface">
                                Confirm New Password
                                <div className="relative mt-2">
                                    <input
                                        tabIndex={3}
                                        className="w-full rounded-xl border border-wg-outline bg-wg-surface-container-lowest px-4 py-3 pr-11 text-sm text-on-wg-surface outline-none transition focus:border-wg-primary"
                                        placeholder="••••••••"
                                        type={
                                            isConfirmNewPasswordVisible
                                                ? "text"
                                                : "password"
                                        }
                                        name="confirmNewPassword"
                                        value={confirmNewPassword}
                                        onChange={(e) =>
                                            setConfirmNewPassword(
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <button
                                        aria-label={
                                            isConfirmNewPasswordVisible
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        aria-pressed={
                                            isConfirmNewPasswordVisible
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-wg-surface-variant hover:text-on-wg-surface cursor-pointer"
                                        onClick={() =>
                                            setIsConfirmNewPasswordVisible(
                                                (prev) => !prev,
                                            )
                                        }
                                        type="button"
                                    >
                                        {isConfirmNewPasswordVisible ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </label>

                            {error && (
                                <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}

                            <button
                                tabIndex={4}
                                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-wg-primary px-4 py-3.5 text-sm font-semibold text-on-wg-primary transition hover:bg-wg-primary-container cursor-pointer disabled:cursor-not-allowed disabled:bg-wg-primary/70 shadow-sm"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    "Updating..."
                                ) : (
                                    <>
                                        Update{" "}
                                        <RefreshCcw className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
}
