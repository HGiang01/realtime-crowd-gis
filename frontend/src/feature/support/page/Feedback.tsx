import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { feedbackApi } from "@/api";
import {
    MapPinned,
    ArrowRight,
    Inbox,
} from "lucide-react";

export default function Feedback() {
    const navigate = useNavigate();
    const [description, setDescription] = useState("");
    const [satisfactionRating, setSatisfactionRating] = useState<
        "dissatisfied" | "acceptable" | "satisfied"
    >("satisfied");
    const [isLoading, setIsLoading] = useState(false);
    const [submitRatingError, setSubmitRatingError] = useState("");

    const handleRatingSubmit = async (
        e: React.SubmitEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();
        setSubmitRatingError("");
        try {
            const formData = new FormData();
            formData.append("description", description);
            formData.append("satisfactionRating", satisfactionRating);

            setIsLoading(true);
            const response = await feedbackApi.createFeedback(formData);

            if (response.data.code !== "SUCCESS") {
                throw new Error("Failed to submit feedback");
            }

            setIsLoading(false);
            setDescription("");
            setSatisfactionRating("satisfied");
            navigate("/home");
        } catch (error) {
            setIsLoading(false);
            setSubmitRatingError(
                "An error occurred while submitting the rating!",
            );
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
                            <Inbox className="h-6 w-6" />
                        </div>
                        <div className="text-center">
                            <h2 className="font-headline text-xl text-on-wg-surface">
                                Feedback
                            </h2>
                            <p className="text-sm text-on-wg-surface-variant">
                                Provide your feedback to help us improve the
                                application. We value your input and will review
                                all submissions carefully.
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleRatingSubmit}
                        className="flex flex-col gap-6"
                    >
                        <div className="flex flex-col gap-2">
                            <div className="rating rating-xl sm:rating-lg flex justify-evenly gap-2">
                                {[
                                    "dissatisfied",
                                    "acceptable",
                                    "satisfied",
                                ].map((val) => (
                                    <input
                                        key={val}
                                        type="radio"
                                        name="satisfactionRating"
                                        className="mask mask-star-2 bg-orange-400"
                                        value={val}
                                        checked={satisfactionRating === val}
                                        onChange={(e) =>
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            setSatisfactionRating(
                                                e.target.value as any,
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <textarea
                                name="description"
                                className="textarea textarea-bordered w-full resize-none min-h-25 bg-white"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter your feedback here..."
                            ></textarea>
                        </div>
                        {submitRatingError && (
                            <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                                {submitRatingError}
                            </p>
                        )}

                        <button
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-wg-primary px-4 py-3 text-sm font-semibold text-on-wg-primary transition hover:bg-wg-primary-container"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                "Submitting..."
                            ) : (
                                <>
                                    Submit <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>
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
