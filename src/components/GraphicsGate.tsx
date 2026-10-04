"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type GraphicsGateProps = {
	/** Whether the gate is showing. When it flips to false it fades out. */
	open: boolean;
	/** Called when the visitor presses "Enter site". */
	onEnter: (lowGraphics: boolean) => void;
};

export default function GraphicsGate({ open, onEnter }: GraphicsGateProps) {
	const [low, setLow] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);

	// While open: focus the button and lock page scroll.
	useEffect(() => {
		if (!open) return;

		buttonRef.current?.focus({ preventScroll: true });

		const html = document.documentElement;
		const previousOverflow = html.style.overflow;
		html.style.overflow = "hidden";

		return () => {
			html.style.overflow = previousOverflow;
		};
	}, [open]);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		onEnter(low);
	};

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="gate-title"
			aria-describedby="gate-text"
			className="fixed inset-0 z-[100] flex items-center justify-center bg-black px-5"
			style={{
				opacity: open ? 1 : 0,
				visibility: open ? "visible" : "hidden",
				pointerEvents: open ? "auto" : "none",
				transition: open
					? "opacity 420ms ease"
					: "opacity 420ms ease, visibility 0s linear 420ms",
			}}
		>
			<form
				onSubmit={handleSubmit}
				className="w-full max-w-[440px] rounded-2xl border border-white/10 bg-[rgba(14,14,14,0.84)] p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)] sm:p-8"
			>
				<h1
					id="gate-title"
					className="m-0 text-[22px] font-bold leading-tight tracking-[-0.02em] sm:text-[26px]"
				>
					Before you enter
				</h1>

				<p
					id="gate-text"
					className="mb-0 mt-3 text-[15px] leading-relaxed text-white/70"
				>
					This site runs a real-time black hole simulation. On laptops without
					a dedicated graphics card it can run slowly or lag.
				</p>

				<label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.06]">
					<input
						type="checkbox"
						checked={low}
						onChange={(event) => setLow(event.target.checked)}
						className="mt-0.5 size-[18px] shrink-0 cursor-pointer accent-white"
					/>
					<span className="flex flex-col gap-1">
						<span className="text-[15px] font-semibold">
							Use weaker graphics
						</span>
						<span className="text-[13px] leading-snug text-white/55">
							Lower resolution and reduced glow. Tick this if you&apos;re on an
							older laptop or integrated graphics.
						</span>
					</span>
				</label>

				<button
					ref={buttonRef}
					type="submit"
					className="mt-6 min-h-[48px] w-full cursor-pointer rounded-full border border-white bg-white px-6 text-[14px] font-semibold text-[#050505] transition-colors hover:bg-[#e6e6e6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
				>
					Enter site
				</button>
			</form>
		</div>
	);
}