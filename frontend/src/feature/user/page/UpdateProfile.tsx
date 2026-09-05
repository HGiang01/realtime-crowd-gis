import React, { useState } from "react";
import Header from "../../../component/Header.tsx";
import Navigate from "../component/Navigate.tsx";
import { useUserStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { RefreshCcw } from "lucide-react";
import { formatDateToLocaleVI } from "@/util/formatDate";

export default function UpdateProfile() {
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [dob, setDob] = useState("");

    const { updateProfile, isLoading, error } = useUserStore();
    const navigate = useNavigate();

    const handleUpdateProfile = async (
        e: React.SubmitEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();

        const payload = {
            username: username.trim() !== "" ? username.trim() : undefined,
            phone: phone.trim() !== "" ? phone.trim() : undefined,
            dob:
                dob.trim() !== ""
                    ? formatDateToLocaleVI(dob.trim())
                    : undefined,
        };

        const isSuccess = await updateProfile(payload);
        if (isSuccess) {
            navigate("/user");
        }
    };

    return (
        // 🌟 Mở khóa cuộn dọc trên Mobile
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
                        {/* 🌟 Form co giãn vừa khít điện thoại */}
                        <form
                            onSubmit={handleUpdateProfile}
                            className="w-full max-w-md space-y-5"
                        >
                            <label className="block text-sm font-medium text-on-wg-surface">
                                Username
                                <input
                                    tabIndex={1}
                                    className="mt-2 w-full rounded-xl border border-wg-outline bg-wg-surface-container-lowest px-4 py-3 text-sm text-on-wg-surface outline-none transition focus:border-wg-primary"
                                    placeholder="nguyenvana"
                                    type="text"
                                    name="username"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                />
                            </label>

                            <label className="block text-sm font-medium text-on-wg-surface">
                                Date of Birth
                                <input
                                    tabIndex={2}
                                    className="mt-2 w-full rounded-xl border border-wg-outline bg-wg-surface-container-lowest px-4 py-3 text-sm text-on-wg-surface outline-none transition focus:border-wg-primary"
                                    placeholder="dd/mm/yyyy"
                                    type="date"
                                    name="dob"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                />
                            </label>

                            <label className="block text-sm font-medium text-on-wg-surface">
                                Phone
                                <input
                                    tabIndex={3}
                                    className="mt-2 w-full rounded-xl border border-wg-outline bg-wg-surface-container-lowest px-4 py-3 text-sm text-on-wg-surface outline-none transition focus:border-wg-primary"
                                    placeholder="0123456789"
                                    type="text"
                                    name="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
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
