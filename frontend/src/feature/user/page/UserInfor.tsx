import Header from "@/component/Header.tsx";
import Navigate from "../component/Navigate.tsx";
import { useAuthStore } from '@/store/authStore';

export default function User() {
    const {user} = useAuthStore();

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
                className="flex-1 relative z-10 w-full max-w-3/4 mx-auto grid grid-cols-10 gap-6 p-6">
                <Navigate/>

                <section
                    className="col-span-8 fade-up flex flex-col relative rounded-3xl border border-wg-outline-variant bg-wg-surface-container-lowest p-8 shadow-(--shadow-wg-ambient)"
                    style={ {animationDelay: "480ms"} }
                >
                    <span
                        className="absolute right-6 top-6 px-2 py-0.5 rounded-2xl border border-transparent bg-wg-surface-container text-on-wg-surface">
                        { user?.role }
                    </span>
                    <div className="flex-1 gap-2 mb-3">
                        <h3 className="text-xl">Basic Information</h3>
                        <div className="h-full grid grid-cols-2 grid-rows-2 m-4">
                            <div>
                                <h2 className="text-md text-on-wg-background/70">Username</h2>
                                <p>{ user?.username || "null" }</p>
                            </div>
                            <div>
                                <h2 className="text-md text-on-wg-background/70">Date of birth</h2>
                                <p>{ user?.dob || "null" }</p>
                            </div>
                            <div>
                                <h2 className="text-md text-on-wg-background/70">Email</h2>
                                <p>{ user?.email || "null" }</p>
                            </div>
                            <div>
                                <h2 className="text-md text-on-wg-background/70">Phone</h2>
                                <p>{ user?.phone || "null" }</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 gap-2 mb-3">
                        <h3 className="text-xl">Contribution Summary</h3>
                        <div className="h-full flex items-center justify-around m-4">
                            <div className="flex flex-col justify-center items-center">
                                <h2 className="text-md text-on-wg-background/70">Earned points</h2>
                                <p className="px-20 py-15 text-4xl font-bold rounded-2xl border transition-colors
                                border-transparent bg-wg-success text-on-wg-primary">0</p>
                            </div>
                            <div className="flex flex-col justify-center items-center">
                                <h2 className="text-md text-on-wg-background/70">Reports contributed</h2>
                                <p className="px-20 py-15 text-4xl font-bold rounded-2xl border transition-colors
                                border-transparent bg-wg-surface-container text-on-wg-surface">0</p>
                            </div>
                            <div className="flex flex-col justify-center items-center">
                                <h2 className="text-md text-on-wg-background/70">Reports processed</h2>
                                <p className="px-20 py-15 text-4xl font-bold rounded-2xl border transition-colors
                                border-transparent bg-wg-primary text-on-wg-primary">0</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}