import {
	ArrowRight,
	HelpCircle,
	Asterisk,
	MapPinned,
} from "lucide-react";

export default function VerifyEmail() {
	const emailPlaceholder = "[email]";
	const headingText = `Enter the OTP sent to ${emailPlaceholder}`;

	return (
		<div className="flex flex-col relative min-h-screen overflow-hidden bg-wg-background text-on-wg-background">
			<style>{`
                @keyframes fade-up {
                    0% { opacity: 0; transform: translateY(16px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .fade-up { animation: fade-up 600ms ease-out both; }
            `}</style>

			<div className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-wg-primary-soft blur-3xl"/>
			<div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-wg-primary-container/30 blur-3xl"/>

			<header className="relative z-10 flex items-center justify-between px-8 pt-6 text-sm text-on-wg-surface-variant">
				<div className="flex items-center gap-2">
					<MapPinned className="h-4 w-4 text-wg-primary"/>
					<span className="font-label">Digital Map of Thu Duc</span>
				</div>
				<button
					className="inline-flex items-center gap-2 rounded-full border border-wg-outline-variant px-3 py-1 text-xs text-on-wg-surface-variant hover:text-on-wg-surface"
					type="button"
				>
					<HelpCircle className="h-4 w-4"/>
					Help
				</button>
			</header>

			<main className="flex-1 relative z-10 w-full max-w-6xl mx-auto flex items-center justify-center gap-12 px-8 pb-14 pt-10">
				<section
					className="w-lg fade-up rounded-3xl border border-wg-outline-variant bg-wg-surface-container-lowest p-8 shadow-(--shadow-wg-ambient)"
					style={{ animationDelay: "360ms" }}
				>
					<div className="mb-6 flex flex-col items-center justify-center gap-4">
						<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-wg-primary-soft text-wg-primary">
							<Asterisk className="h-6 w-6"/>
						</div>
						<div className="text-center">
							<h2 className="font-headline text-xl text-on-wg-surface">
								{headingText}
							</h2>
							<p className="text-sm text-on-wg-surface-variant">
								Manage spatial data, connect the community
							</p>
						</div>
					</div>

					<form className="space-y-5">
						<label className="block text-sm font-medium text-on-wg-surface">
							<input
								className="mt-2 w-full rounded-xl border border-wg-outline bg-wg-surface-container-lowest px-4 py-3 text-sm text-on-wg-surface outline-none transition focus:border-wg-primary"
								type="text"
								name="otp"
							/>
						</label>

						<div className="text-red-500">Error message</div>

						<button
							className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-wg-primary px-4 py-3 text-sm font-semibold text-on-wg-primary transition hover:bg-wg-primary-container"
							type="submit"
						>
							Verify email
							<ArrowRight className="h-4 w-4"/>
						</button>

                        <div className="text-center text-xs text-on-wg-surface-variant">
                            If you didn't receive a code?{" "}
                            <button
                                className="font-semibold text-wg-primary hover:underline"
                                type="button"
                            >
                                Resend
                            </button>
                        </div>
					</form>
				</section>
			</main>
		</div>
	);
}
