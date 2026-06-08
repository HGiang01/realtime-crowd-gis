import React, { useState } from "react";
import Header from "../../../component/Header.tsx";
import Navigate from "../component/Navigate.tsx";
import { useUserStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, RefreshCcw } from "lucide-react";

export default function UpdatePassword() {
    const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
    const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const {updatePassword, isLoading, error} = useUserStore();
    const navigate = useNavigate();

    const handleUpdatePassword = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const isSuccess = await updatePassword({currentPassword, newPassword, confirmNewPassword});
        if (isSuccess) {
            navigate("/auth/login");
        }
    };
    return (
        <div className="flex flex-col relative min-h-screen overflow-hidden bg-wg-background text-on-wg-background">
            <style>{ `
                @keyframes fade-up {
                    0% { opacity: 0; transform: translateY(16px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .fade-up { animation: fade-up 600ms ease-out both; }
            ` }</style>

            <div
                className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-wg-primary-soft blur-3xl"/>
            <div
                className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-wg-primary-container/30 blur-3xl"/>

            <Header/>

            <main className="flex-1 relative z-10 w-full max-w-3/4 mx-auto grid grid-cols-10 gap-6 p-6">
                <Navigate/>

                <section
                    className="col-span-8 fade-up flex flex-col rounded-3xl border border-wg-outline-variant bg-wg-surface-container-lowest p-8 shadow-(--shadow-wg-ambient)"
                    style={ {animationDelay: "480ms"} }
                >
                    <h3 className="text-xl">Edit Profile</h3>
                    <div className="h-full flex items-center justify-center">
                        <form onSubmit={ handleUpdatePassword }
                              className="space-y-5 min-w-80">
                            <label className="block text-sm font-medium text-on-wg-surface">
                                Current Password
                                <div className="relative mt-2">
                                    <input
                                        tabIndex={ 2 }
                                        className="w-full rounded-xl border border-wg-outline bg-wg-surface-container-lowest px-4 py-3 pr-11 text-sm text-on-wg-surface outline-none transition focus:border-wg-primary"
                                        placeholder="••••••••"
                                        type={
                                            isCurrentPasswordVisible ? "text" : "password"
                                        }
                                        name="currentPassword"
                                        value={ currentPassword }
                                        onChange={ (e) =>
                                            setCurrentPassword(e.target.value)
                                        }
                                    />
                                    <button
                                        aria-label={
                                            isCurrentPasswordVisible
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        aria-pressed={ isConfirmNewPasswordVisible }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-wg-surface-variant hover:text-on-wg-surface cursor-pointer"
                                        onClick={ () =>
                                            setIsCurrentPasswordVisible((prev) => !prev)
                                        }
                                        type="button"
                                    >
                                        { isCurrentPasswordVisible ? (
                                            <EyeOff className="h-4 w-4"/>
                                        ) : (
                                            <Eye className="h-4 w-4"/>
                                        ) }
                                    </button>
                                </div>
                            </label>

                            <label className="block text-sm font-medium text-on-wg-surface">
                                New Password
                                <div className="relative mt-2">
                                    <input
                                        tabIndex={ 2 }
                                        className="w-full rounded-xl border border-wg-outline bg-wg-surface-container-lowest px-4 py-3 pr-11 text-sm text-on-wg-surface outline-none transition focus:border-wg-primary"
                                        placeholder="••••••••"
                                        type={
                                            isNewPasswordVisible ? "text" : "password"
                                        }
                                        name="newPassword"
                                        value={ newPassword }
                                        onChange={ (e) =>
                                            setNewPassword(e.target.value)
                                        }
                                    />
                                    <button
                                        aria-label={
                                            isNewPasswordVisible
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        aria-pressed={ isNewPasswordVisible }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-wg-surface-variant hover:text-on-wg-surface cursor-pointer"
                                        onClick={ () =>
                                            setIsNewPasswordVisible((prev) => !prev)
                                        }
                                        type="button"
                                    >
                                        { isNewPasswordVisible ? (
                                            <EyeOff className="h-4 w-4"/>
                                        ) : (
                                            <Eye className="h-4 w-4"/>
                                        ) }
                                    </button>
                                </div>
                            </label>

                            <label className="block text-sm font-medium text-on-wg-surface">
                                Confirm New Password
                                <div className="relative mt-2">
                                    <input
                                        tabIndex={ 3 }
                                        className="w-full rounded-xl border border-wg-outline bg-wg-surface-container-lowest px-4 py-3 pr-11 text-sm text-on-wg-surface outline-none transition focus:border-wg-primary"
                                        placeholder="••••••••"
                                        type={
                                            isConfirmNewPasswordVisible ? "text" : "password"
                                        }
                                        name="confirmNewPassword"
                                        value={ confirmNewPassword }
                                        onChange={ (e) =>
                                            setConfirmNewPassword(e.target.value)
                                        }
                                    />
                                    <button
                                        aria-label={
                                            isConfirmNewPasswordVisible
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        aria-pressed={ isConfirmNewPasswordVisible }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-wg-surface-variant hover:text-on-wg-surface cursor-pointer"
                                        onClick={ () =>
                                            setIsConfirmNewPasswordVisible((prev) => !prev)
                                        }
                                        type="button"
                                    >
                                        { isConfirmNewPasswordVisible ? (
                                            <EyeOff className="h-4 w-4"/>
                                        ) : (
                                            <Eye className="h-4 w-4"/>
                                        ) }
                                    </button>
                                </div>
                            </label>

                            { error && <div className="text-red-500">{ error }</div> }

                            <button
                                tabIndex={ 4 }
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-wg-primary px-4 py-3 text-sm font-semibold text-on-wg-primary transition hover:bg-wg-primary-container cursor-pointer disabled:cursor-not-allowed disabled:bg-wg-primary/70"
                                type="submit"
                                disabled={ isLoading }
                            >
                                { isLoading ? (
                                    "Updating..."
                                ) : (
                                    <>
                                        Update <RefreshCcw className="h-4 w-4"/>
                                    </>
                                ) }
                            </button>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    )
}