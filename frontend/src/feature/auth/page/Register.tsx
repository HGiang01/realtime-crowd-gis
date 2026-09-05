import { ArrowRight, Eye, EyeOff, PenLine } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../component/Header";
import { useAuthStore } from "@/store";
import { formatDateToDMY } from "@/util/formatDate";

export default function Register() {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    // refactor: use react-hook-form
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [dob, setDob] = useState("");

    const {register, isLoading, error} = useAuthStore();
    const navigate = useNavigate();

    const handleRegister = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const isSuccess = await register({
            username,
            password,
            confirmPassword,
            email,
            phone,
            dob: formatDateToDMY(dob),
        });
        if (isSuccess) {
            navigate("/auth/verify-email");
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

            <main
                className="flex-1 relative z-10 w-full max-w-6xl mx-auto flex items-center justify-center gap-12 px-8 pb-14 pt-10">
                <section
                    className="w-lg fade-up rounded-3xl border border-wg-outline-variant bg-wg-surface-container-lowest px-9 py-6 shadow-(--shadow-wg-ambient)"
                    style={ {animationDelay: "360ms"} }
                >
                    <div className="mb-4 flex items-center justify-center gap-4">
                        <div
                            className="flex h-14 w-14 mr-1 items-center justify-center rounded-2xl bg-wg-primary-soft text-wg-primary">
                            <PenLine className="h-6 w-6"/>
                        </div>
                        <div>
                            <h2 className="font-headline text-xl text-on-wg-surface">
                                Register an account
                            </h2>
                            <p className="text-sm text-on-wg-surface-variant">
                                Manage spatial data, connect the community
                            </p>
                        </div>
                    </div>

                    <form className="space-y-3" onSubmit={ handleRegister }>
                        <label className="block text-sm font-medium text-on-wg-surface">
                            Username
                            <input
                                tabIndex={ 1 }
                                className="mt-2 w-full rounded-xl border border-wg-outline bg-wg-surface-container-lowest px-4 py-3 text-sm text-on-wg-surface outline-none transition focus:border-wg-primary"
                                placeholder="nguyenvana"
                                type="text"
                                name="username"
                                value={ username }
                                onChange={ (e) => setUsername(e.target.value) }
                            />
                        </label>

                        <label className="block text-sm font-medium text-on-wg-surface">
                            Password
                            <div className="relative mt-2">
                                <input
                                    tabIndex={ 2 }
                                    className="w-full rounded-xl border border-wg-outline bg-wg-surface-container-lowest px-4 py-3 pr-11 text-sm text-on-wg-surface outline-none transition focus:border-wg-primary"
                                    placeholder="••••••••"
                                    type={
                                        isPasswordVisible ? "text" : "password"
                                    }
                                    name="password"
                                    value={ password }
                                    onChange={ (e) =>
                                        setPassword(e.target.value)
                                    }
                                />
                                <button
                                    aria-label={
                                        isPasswordVisible
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    aria-pressed={ isPasswordVisible }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-wg-surface-variant hover:text-on-wg-surface cursor-pointer"
                                    onClick={ () =>
                                        setIsPasswordVisible((prev) => !prev)
                                    }
                                    type="button"
                                >
                                    { isPasswordVisible ? (
                                        <EyeOff className="h-4 w-4"/>
                                    ) : (
                                        <Eye className="h-4 w-4"/>
                                    ) }
                                </button>
                            </div>
                        </label>

                        <label className="block text-sm font-medium text-on-wg-surface">
                            Confirm Password
                            <div className="relative mt-2">
                                <input
                                    tabIndex={ 3 }
                                    className="w-full rounded-xl border border-wg-outline bg-wg-surface-container-lowest px-4 py-3 pr-11 text-sm text-on-wg-surface outline-none transition focus:border-wg-primary"
                                    placeholder="••••••••"
                                    type={
                                        isPasswordVisible ? "text" : "password"
                                    }
                                    name="confirmPassword"
                                    value={ confirmPassword }
                                    onChange={ (e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                />
                                <button
                                    aria-label={
                                        isPasswordVisible
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    aria-pressed={ isPasswordVisible }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-wg-surface-variant hover:text-on-wg-surface cursor-pointer"
                                    onClick={ () =>
                                        setIsPasswordVisible((prev) => !prev)
                                    }
                                    type="button"
                                >
                                    { isPasswordVisible ? (
                                        <EyeOff className="h-4 w-4"/>
                                    ) : (
                                        <Eye className="h-4 w-4"/>
                                    ) }
                                </button>
                            </div>
                        </label>

                        <label className="block text-sm font-medium text-on-wg-surface">
                            Email
                            <input
                                tabIndex={ 4 }
                                className="mt-2 w-full rounded-xl border border-wg-outline bg-wg-surface-container-lowest px-4 py-3 text-sm text-on-wg-surface outline-none transition focus:border-wg-primary"
                                placeholder="example@email.com"
                                type="email"
                                name="email"
                                value={ email }
                                onChange={ (e) => setEmail(e.target.value) }
                            />
                        </label>

                        <label className="block text-sm font-medium text-on-wg-surface">
                            Phone
                            <input
                                tabIndex={ 5 }
                                className="mt-2 w-full rounded-xl border border-wg-outline bg-wg-surface-container-lowest px-4 py-3 text-sm text-on-wg-surface outline-none transition focus:border-wg-primary"
                                placeholder="0123456789"
                                type="text"
                                name="phone"
                                value={ phone }
                                onChange={ (e) => setPhone(e.target.value) }
                            />
                        </label>

                        <label className="block text-sm font-medium text-on-wg-surface">
                            Date of Birth
                            <input
                                tabIndex={ 6 }
                                className="mt-2 w-full rounded-xl border border-wg-outline bg-wg-surface-container-lowest px-4 py-3 text-sm text-on-wg-surface outline-none transition focus:border-wg-primary"
                                placeholder="dd/mm/yyyy"
                                type="date"
                                name="dob"
                                value={ dob }
                                onChange={ (e) => setDob(e.target.value) }
                            />
                        </label>

                        { error && <div className="text-red-500">{ error }</div> }

                        <button
                            tabIndex={ 7 }
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-wg-primary px-4 py-3 text-sm font-semibold text-on-wg-primary transition hover:bg-wg-primary-container cursor-pointer disabled:cursor-not-allowed disabled:bg-wg-primary/70"
                            type="submit"
                            disabled={ isLoading }
                        >
                            { isLoading ? (
                                "Registering..."
                            ) : (
                                <>
                                    Register <ArrowRight className="h-4 w-4"/>
                                </>
                            ) }
                        </button>

                        <div className="text-center text-xs text-on-wg-surface-variant">
                            Do you have an account?{ " " }
                            <Link to="/auth/login">
                                <button
                                    className="font-semibold text-wg-primary hover:underline"
                                    type="button"
                                >
                                    Sign in now
                                </button>
                            </Link>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
}
