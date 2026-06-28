import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store";
import Header from "@/feature/auth/component/Header.tsx";
import { Hourglass } from "lucide-react";

const OAuth2Redirect = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { loginWithOAuth2 } = useAuthStore();

    const searchParams = new URLSearchParams(location.search);
    const errorCode = searchParams.get("error-code");
    const errorMessage = searchParams.get("error-message");

    useEffect(() => {
        if (errorCode) {
            const timer = setTimeout(() => {
                navigate("/auth/login", { replace: true });
            }, 3000);

            return () => clearTimeout(timer);
        }

        let isMounted = true;

        const processLogin = async () => {
            try {
                await loginWithOAuth2();
                if (isMounted) navigate("/home", { replace: true });
            } catch (error) {
                console.error("Login process failed:", error);

                if (isMounted) {
                    setTimeout(() => {
                        navigate("/auth/login", { replace: true });
                    }, 3000);
                }
            }
        };

        processLogin();

        return () => {
            isMounted = false;
        };
    }, [errorCode, loginWithOAuth2, navigate]);

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
                            <Hourglass className="h-6 w-6" />
                        </div>
                        <div className="text-center">
                            <h2 className="font-headline text-xl text-on-wg-surface">
                                OAuth2 Sign In
                            </h2>
                            <p className="text-sm text-on-wg-surface-variant">
                                {errorCode
                                    ? `Authentication could not be completed. ${errorMessage}. You will be redirected shortly.`
                                    : "Processing OAuth2 login. You will be redirected automatically."}
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default OAuth2Redirect;
