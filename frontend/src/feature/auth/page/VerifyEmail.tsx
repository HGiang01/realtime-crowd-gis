import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Asterisk } from "lucide-react";
import Header from "../component/Header";
import { useAuthStore } from "@/store";

export default function VerifyEmail() {
    const pendingEmail = useAuthStore((state) => state.pendingEmail);
    const [otp, setOtp] = useState("");
    const [isResendingOtp, setIsResendingOtp] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const { verifyEmail, resendOtp, isLoading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleVerifyEmail = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const isSuccess = await verifyEmail({
            email: pendingEmail!,
            otp,
        });
        if (isSuccess) {
            navigate("/auth/email-verified");
        }
    };

    const handleResendOtp = async () => {
        if (!pendingEmail) return;

        setIsResendingOtp(true);
        const isSuccess = await resendOtp(pendingEmail);
        setIsResendingOtp(false);

        if (isSuccess) {
            setCountdown(300);
        }
    };

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60)
            .toString()
            .padStart(2, "0");
        const seconds = (totalSeconds % 60).toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
    };

    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

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
                            <Asterisk className="h-6 w-6" />
                        </div>
                        <div className="text-center">
                            <h2 className="font-headline text-xl text-on-wg-surface">
                                {`Enter the OTP sent to ${pendingEmail}`}
                            </h2>
                            <p className="text-sm text-on-wg-surface-variant">
                                Manage spatial data, connect the community
                            </p>
                        </div>
                    </div>

                    <form className="space-y-5" onSubmit={handleVerifyEmail}>
                        <label className="block text-sm font-medium text-on-wg-surface">
                            <input
                                className="mt-2 w-full text-center rounded-xl border border-wg-outline bg-wg-surface-container-lowest px-4 py-3 text-sm text-on-wg-surface outline-none transition focus:border-wg-primary"
                                type="text"
                                name="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </label>

                        {error && <div className="text-red-500">{error}</div>}

                        <button
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-wg-primary px-4 py-3 text-sm font-semibold text-on-wg-primary transition hover:bg-wg-primary-container"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                "Verifying..."
                            ) : (
                                <>
                                    Verify email{" "}
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>

                        <div className="text-center text-xs text-on-wg-surface-variant">
                            If you didn't receive a code?{" "}
                            <button
                                className={`font-semibold transition ${
                                    isResendingOtp || countdown > 0
                                        ? "text-wg-outline cursor-not-allowed"
                                        : "text-wg-primary hover:underline"
                                }`}
                                type="button"
                                onClick={handleResendOtp}
                                disabled={isResendingOtp || countdown > 0}
                            >
                                {isResendingOtp
                                    ? "Sending..."
                                    : countdown > 0
                                      ? `Resend in ${formatTime(countdown)}`
                                      : "Resend"}
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
}
