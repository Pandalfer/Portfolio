"use client";

import { useEffect, useRef } from "react";

type Status = "done" | "active" | "next";

type Milestone = {
	id: string;
	title: string;
	place?: string;
	period: string;
	status: Status;
	note?: string;
	grades?: { subject: string; grade: string }[];
	tags?: string[];
};

const MILESTONES: Milestone[] = [
	{
		id: "gcse",
		title: "GCSEs",
		place: "Monk's Walk School, Welwyn Garden City, UK",
		period: "2024 to 2026",
		status: "done",
		grades: [
			{ subject: "Mathematics", grade: "9" },
			{ subject: "Computer Science", grade: "9" },
			{ subject: "Physics", grade: "9" },
			{ subject: "Chemistry", grade: "9" },
			{ subject: "Biology", grade: "9" },
			{ subject: "English Language", grade: "9" },
			{ subject: "English Literature", grade: "9" },
			{ subject: "Geography", grade: "9" },
			{ subject: "Spanish", grade: "8" },
			{ subject: "Creative IMedia", grade: "L2D*" },
		],
	},
	{
		id: "alevels",
		title: "A-Levels",
		period: "In progress",
		status: "active",
		note: "Currently studying the maths and physical sciences route.",
		tags: ["Mathematics", "Further Mathematics", "Physics", "Chemistry"],
	},
	{
		id: "next",
		title: "Apprenticeship",
		period: "Next",
		status: "next",
		note: "Open to apprenticeships and collaborations.",
	},
];

const MARKER = 26;

function findScroller(el: HTMLElement): HTMLElement | null {
	let node = el.parentElement;
	while (node) {
		const { overflowY } = getComputedStyle(node);
		if (overflowY === "auto" || overflowY === "scroll") return node;
		node = node.parentElement;
	}
	return null;
}

export default function Education() {
	const listRef = useRef<HTMLOListElement>(null);
	const railRef = useRef<HTMLDivElement>(null);
	const fillRef = useRef<HTMLDivElement>(null);
	const probeRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const list = listRef.current;
		if (!list) return;

		const scroller = findScroller(list);
		let frame = 0;

		// Hide the card's scrollbar (it still scrolls). Inline style beats the
		// parent's `scrollbar-width: thin`; the WebKit side is handled by the
		// global style block at the bottom of this file.
		if (scroller) {
			scroller.setAttribute("data-edu-scroll", "true");
			scroller.style.scrollbarWidth = "none";
		}

		const update = () => {
			frame = 0;
			const rail = railRef.current;
			const fill = fillRef.current;
			const probe = probeRef.current;
			if (!rail || !fill || !probe) return;

			const items = Array.from(list.children).filter(
				(c): c is HTMLLIElement => c instanceof HTMLLIElement
			);
			const first = items[0];
			const last = items[items.length - 1];
			if (!first || !last) return;

			// Rail runs from the first marker's centre to the last marker's centre.
			const height = last.offsetTop - first.offsetTop;
			rail.style.top = `${first.offsetTop + MARKER / 2}px`;
			rail.style.height = `${height}px`;

			const viewTop = scroller ? scroller.getBoundingClientRect().top : 0;
			const viewH = scroller ? scroller.clientHeight : window.innerHeight;
			const max = scroller
				? scroller.scrollHeight - scroller.clientHeight
				: document.documentElement.scrollHeight - window.innerHeight;
			const pos = scroller ? scroller.scrollTop : window.scrollY;
			const p = max > 4 ? Math.min(Math.max(pos / max, 0), 1) : 1;

			// The probe's line of sight slides from 20% to 90% of the view as you
			// scroll, so the last waypoint can always be reached.
			const refY = viewTop + viewH * (0.2 + 0.7 * p);

			const railTop = rail.getBoundingClientRect().top;
			const filled = Math.min(Math.max(refY - railTop, 0), height);

			fill.style.transform = `scaleY(${height > 0 ? filled / height : 0})`;
			probe.style.transform = `translate(-50%, ${filled}px)`;

			for (const li of items) {
				const markerY = li.getBoundingClientRect().top + MARKER / 2;
				li.dataset.lit = markerY <= refY ? "true" : "false";
			}
		};

		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};

		const target: HTMLElement | Window = scroller ?? window;
		target.addEventListener("scroll", schedule, { passive: true });
		window.addEventListener("resize", schedule);

		const observer = new ResizeObserver(schedule);
		observer.observe(list);
		if (scroller) observer.observe(scroller);

		update();

		return () => {
			target.removeEventListener("scroll", schedule);
			window.removeEventListener("resize", schedule);
			observer.disconnect();
			if (frame) cancelAnimationFrame(frame);
			if (scroller) {
				scroller.removeAttribute("data-edu-scroll");
				scroller.style.removeProperty("scrollbar-width");
			}
		};
	}, []);

	return (
		<div className="journey">
			<div ref={railRef} className="journey__rail" aria-hidden="true">
				<div ref={fillRef} className="journey__fill" />
				<div ref={probeRef} className="journey__probe" />
			</div>

			<ol ref={listRef} className="journey__list">
				{MILESTONES.map((m) => {
					const nines = (m.grades ?? []).filter((g) => g.grade === "9").length;

					return (
						<li
							key={m.id}
							className={`stop stop--${m.status}`}
							data-lit="false"
						>
							<span className="stop__marker" aria-hidden="true" />

							<div className="stop__body">
								<div className="stop__head">
									<h4>{m.title}</h4>
									<span className="stop__period">{m.period}</span>
								</div>

								{m.place && <p className="stop__place">{m.place}</p>}
								{m.note && <p className="stop__note">{m.note}</p>}
								{nines > 0 && (
									<p className="stop__stat">{nines} subjects at grade 9</p>
								)}

								{m.grades && (
									<ul className="chips" aria-label={`${m.title} results`}>
										{m.grades.map((g) => (
											<li key={g.subject} className="chip">
												<span>{g.subject}</span>
												<strong>{g.grade}</strong>
											</li>
										))}
									</ul>
								)}

								{m.tags && (
									<ul className="chips" aria-label={`${m.title} subjects`}>
										{m.tags.map((t) => (
											<li key={t} className="chip">
												<span>{t}</span>
											</li>
										))}
									</ul>
								)}
							</div>
						</li>
					);
				})}
			</ol>

			<style jsx>{`
				.journey {
					position: relative;
					padding: 2px 0 6px;
				}

				.journey__list {
					margin: 0;
					padding: 0;
					list-style: none;
				}

				/* Flight path */
				.journey__rail {
					position: absolute;
					left: ${MARKER / 2 - 1}px;
					top: 0;
					width: 2px;
					height: 0;
					border-radius: 2px;
					background: rgba(255, 255, 255, 0.1);
				}

				.journey__fill {
					position: absolute;
					inset: 0;
					border-radius: 2px;
					transform-origin: top;
					transform: scaleY(0);
					will-change: transform;
					background: linear-gradient(
						to bottom,
						rgba(169, 193, 255, 0.05),
						rgba(169, 193, 255, 0.7) 70%,
						#fff
					);
				}

				.journey__probe {
					position: absolute;
					z-index: 2;
					left: 50%;
					top: -5px; /* half the probe's height, so its centre sits on the rail point */
					width: 10px;
					height: 10px;
					border-radius: 50%;
					background: #fff;
					box-shadow: 0 0 12px 3px rgba(169, 193, 255, 0.75);
					transform: translate(-50%, 0);
					will-change: transform;
				}

				/* Waypoints */
				.stop {
					position: relative;
					padding: 0 0 34px ${MARKER + 20}px;
					min-height: clamp(150px, 26vh, 220px);
					opacity: 0.38;
					transition: opacity 450ms ease;
				}

				.stop:last-child {
					min-height: 0;
					padding-bottom: 8px;
				}

				.stop[data-lit="true"] {
					opacity: 1;
				}

				.stop__marker {
					position: absolute;
					left: 0;
					top: 0;
					z-index: 1;
					width: ${MARKER}px;
					height: ${MARKER}px;
					box-sizing: border-box;
					border: 1px solid rgba(255, 255, 255, 0.4);
					border-radius: 50%;
					background: #0b0b0b;
					transition:
						border-color 350ms ease,
						box-shadow 350ms ease;
				}

				.stop__marker::after {
					content: "";
					position: absolute;
					inset: 7px;
					border-radius: 50%;
					background: rgba(255, 255, 255, 0.35);
					transition: background 350ms ease;
				}

				.stop[data-lit="true"] .stop__marker {
					border-color: #fff;
					box-shadow: 0 0 14px rgba(169, 193, 255, 0.55);
				}

				.stop[data-lit="true"] .stop__marker::after {
					background: #fff;
				}

				.stop--active[data-lit="true"] .stop__marker {
					box-shadow:
						0 0 0 5px rgba(169, 193, 255, 0.14),
						0 0 18px rgba(169, 193, 255, 0.7);
				}

				.stop--next .stop__marker {
					border-style: dashed;
				}

				.stop--next .stop__marker::after {
					background: transparent;
				}

				.stop[data-lit="true"].stop--next .stop__marker::after {
					background: transparent;
				}

				/* Content */
				.stop__head {
					display: flex;
					flex-wrap: wrap;
					align-items: baseline;
					justify-content: space-between;
					gap: 4px 16px;
				}

				.stop__head h4 {
					margin: 0;
					color: #fff;
					font-size: clamp(19px, 2.2vw, 23px);
					font-weight: 700;
					letter-spacing: -0.02em;
				}

				.stop__period {
					color: rgba(255, 255, 255, 0.5);
					font-size: 13px;
					white-space: nowrap;
				}

				.stop__place {
					margin: 4px 0 0;
					color: rgba(255, 255, 255, 0.78);
					font-size: 14.5px;
				}

				.stop__note {
					max-width: 58ch;
					margin: 8px 0 0;
					color: rgba(255, 255, 255, 0.6);
					font-size: 14px;
					line-height: 1.6;
				}

				.stop__stat {
					margin: 10px 0 0;
					color: #a9c1ff;
					font-size: 13.5px;
					font-weight: 600;
				}

				.chips {
					margin: 12px 0 0;
					padding: 0;
					list-style: none;
					display: flex;
					flex-wrap: wrap;
					gap: 6px;
				}

				.chip {
					display: inline-flex;
					align-items: baseline;
					gap: 8px;
					padding: 5px 11px;
					border: 1px solid rgba(255, 255, 255, 0.12);
					border-radius: 999px;
					background: rgba(255, 255, 255, 0.04);
					color: rgba(255, 255, 255, 0.8);
					font-size: 13px;
				}

				.chip strong {
					color: #fff;
					font-weight: 700;
				}

				@media (max-width: 480px) {
					.stop {
						padding-left: ${MARKER + 14}px;
					}
				}

				@media (prefers-reduced-motion: reduce) {
					.stop,
					.stop__marker,
					.stop__marker::after {
						transition: none;
					}
				}
			`}</style>

			{/* Targets the card's scroll container, which lives outside this component */}
			<style jsx global>{`
				[data-edu-scroll="true"] {
					-ms-overflow-style: none;
				}

				[data-edu-scroll="true"]::-webkit-scrollbar {
					display: none !important;
					width: 0 !important;
					height: 0 !important;
				}
			`}</style>
		</div>
	);
}