import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LogIn } from "lucide-react";
import Header from "../component/Header";
import { useAuthStore } from "@/store";

export default function Login() {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");

    const { login, isLoading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const isSuccess = await login({ usernameOrEmail, password });
        if (isSuccess) {
            navigate("/home");
        }
    };

    return (
        <div className="flex flex-col relative min-h-screen overflow-hidden bg-wg-background text-on-wg-background">
            <style>{`
                @keyframes fade-up {
                    0% { opacity: 0; transform: translateY(16px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .fade-up { animation: fade-up 600ms ease-out both; }
            `}</style>

            <div className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-wg-primary-soft blur-3xl" />
            <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-wg-primary-container/30 blur-3xl" />

            <Header />

            <main className="flex-1 relative z-10 w-full max-w-6xl mx-auto flex items-center justify-center gap-12 px-8 pb-14 pt-10">
                <section
                    className="w-lg fade-up rounded-3xl border border-wg-outline-variant bg-wg-surface-container-lowest p-8 shadow-(--shadow-wg-ambient)"
                    style={{ animationDelay: "360ms" }}
                >
                    <div className="mb-6 flex flex-col items-center justify-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-wg-primary-soft text-wg-primary">
                            <LogIn className="h-6 w-6" />
                        </div>
                        <div className="text-center">
                            <h2 className="font-headline text-xl text-on-wg-surface">
                                Welcome Back
                            </h2>
                            <p className="text-sm text-on-wg-surface-variant">
                                Manage spatial data, connect the community
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <label className="block text-sm font-medium text-on-wg-surface">
                            Email or Username
                            <input
                                className="mt-2 w-full rounded-xl border border-wg-outline bg-wg-surface-container-lowest px-4 py-3 text-sm text-on-wg-surface outline-none transition focus:border-wg-primary"
                                value={usernameOrEmail}
                                onChange={(e) =>
                                    setUsernameOrEmail(e.target.value)
                                }
                                placeholder="example@email.com"
                                type="text"
                                name="usernameOrEmail"
                                disabled={isLoading}
                            />
                        </label>

                        <label className="block text-sm font-medium text-on-wg-surface">
                            Password
                            <div className="relative mt-2">
                                <input
                                    className="w-full rounded-xl border border-wg-outline bg-wg-surface-container-lowest px-4 py-3 pr-11 text-sm text-on-wg-surface outline-none transition focus:border-wg-primary"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="••••••••"
                                    type={
                                        isPasswordVisible ? "text" : "password"
                                    }
                                    name="password"
                                    disabled={isLoading}
                                />
                                <button
                                    aria-label={
                                        isPasswordVisible
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    aria-pressed={isPasswordVisible}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-wg-surface-variant hover:text-on-wg-surface cursor-pointer"
                                    onClick={() =>
                                        setIsPasswordVisible((prev) => !prev)
                                    }
                                    type="button"
                                >
                                    {isPasswordVisible ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </label>

                        <div className="flex items-center justify-end text-xs text-on-wg-surface-variant">
                            <Link to="/auth/forgot-password">
                                <button
                                    className="text-wg-primary hover:underline cursor-pointer"
                                    type="button"
                                >
                                    Forgot password?
                                </button>
                            </Link>
                        </div>

                        {error && <div className="text-red-500">{error}</div>}

                        <button
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-wg-primary px-4 py-3 text-sm font-semibold text-on-wg-primary transition hover:bg-wg-primary-container"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                "Signing in..."
                            ) : (
                                <>
                                    Sign in <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>

                        <div className="flex items-center gap-3 text-xs text-on-wg-surface-variant">
                            <span className="h-px flex-1 bg-wg-outline-variant" />
                            Or
                            <span className="h-px flex-1 bg-wg-outline-variant" />
                        </div>

                        <button
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-wg-outline-variant px-4 py-3 text-sm font-medium text-on-wg-surface hover:border-wg-outline"
                            type="button"
                            onClick={() => window.location.href = import.meta.env.VITE_API_OAUTH_URL}
                        >
                            Continue with Google
                        </button>

                        <div className="text-center text-xs text-on-wg-surface-variant">
                            Don't have an account?{" "}
                            <Link to="/auth/register">
                                <button
                                    className="font-semibold text-wg-primary hover:underline"
                                    type="button"
                                >
                                    Sign up now
                                </button>
                            </Link>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
}
