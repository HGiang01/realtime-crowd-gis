import { Link } from "react-router-dom";
import { MapPinned, Headset } from "lucide-react";

export default function Contact() {
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

            <header className="relative z-10 flex items-center justify-between px-8 pt-6 text-sm text-on-wg-surface-variant">
                <div className="flex items-center gap-2">
                    <MapPinned className="h-4 w-4 text-wg-primary" />
                    <span className="font-label">Digital Map of Thu Duc</span>
                </div>
            </header>

            <main className="flex-1 relative z-10 w-full max-w-6xl mx-auto flex items-center justify-center gap-12 px-8 pb-14 pt-10">
                <section
                    className="w-lg fade-up rounded-3xl border border-wg-outline-variant bg-wg-surface-container-lowest p-8 shadow-(--shadow-wg-ambient)"
                    style={{ animationDelay: "360ms" }}
                >
                    <div className="mb-6 flex flex-col items-center justify-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-wg-primary-soft text-wg-primary">
                            <Headset className="h-6 w-6" />
                        </div>
                        <div className="text-center">
                            <h2 className="font-headline text-xl text-on-wg-surface">
                                Contact Us
                            </h2>
                            <p className="text-sm text-on-wg-surface-variant">
                                Have questions or need assistance? Reach out to
                                our support team and we'll get back to you as
                                soon as possible.
                            </p>
                            <div className="mt-4 space-y-1 text-sm text-on-wg-surface-variant">
                                <p>
                                    Email:{" "}
                                    <a
                                        href="mailto:support@example.com"
                                        className="text-primary underline"
                                    >
                                        support@example.com
                                    </a>
                                </p>
                                <p>
                                    Hotline:{" "}
                                    <a
                                        href="tel:+84123456789"
                                        className="text-primary underline"
                                    >
                                        +84 123 456 789
                                    </a>
                                </p>
                                <p>
                                    Working hours: 8:00 AM – 6:00 PM (Mon – Sat)
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-2 flex items-center justify-center">
                        <Link
                            to="/home"
                            className="text-sm text-center hover:underline"
                        >
                            Back to home
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
