import React, { useState } from "react";
import Header from "../../../component/Header.tsx";
import Navigate from "../component/Navigate.tsx";
import { useUserStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { RefreshCcw } from "lucide-react";
import formatDate from "@/util/formatDate";

export default function UpdateProfile() {

    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [dob, setDob] = useState("");

    const {updateProfile, isLoading, error} = useUserStore();
    const navigate = useNavigate();

    const handleUpdateProfile = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload = {
            username: username.trim() !== "" ? username.trim() : undefined,
            phone: phone.trim() !== "" ? phone.trim() : undefined,
            dob: dob.trim() !== "" ? formatDate(dob.trim()) : undefined,
        }

        const isSuccess = await updateProfile(payload);
        if (isSuccess) {
            navigate("/user");
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
                        <form onSubmit={ handleUpdateProfile }
                              className="space-y-5 min-w-80">
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
                                Date of Birth
                                <input
                                    tabIndex={ 2 }
                                    className="mt-2 w-full rounded-xl border border-wg-outline bg-wg-surface-container-lowest px-4 py-3 text-sm text-on-wg-surface outline-none transition focus:border-wg-primary"
                                    placeholder="dd/mm/yyyy"
                                    type="date"
                                    name="dob"
                                    value={ dob }
                                    onChange={ (e) => setDob(e.target.value) }
                                />
                            </label>

                            <label className="block text-sm font-medium text-on-wg-surface">
                                Phone
                                <input
                                    tabIndex={ 3 }
                                    className="mt-2 w-full rounded-xl border border-wg-outline bg-wg-surface-container-lowest px-4 py-3 text-sm text-on-wg-surface outline-none transition focus:border-wg-primary"
                                    placeholder="0123456789"
                                    type="text"
                                    name="phone"
                                    value={ phone }
                                    onChange={ (e) => setPhone(e.target.value) }
                                />
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