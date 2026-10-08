"use client";

import { useState } from "react";

type IconName = "code" | "sigma" | "plane";

type Achievement = {
	id: string;
	icon: IconName;
	short: string; // label under the patch
	ring: string; // text that circles the patch (keep it ~25-35 chars)
	title: string;
	org: string;
	note: string;
	years?: string[]; // one orbiting satellite per entry
};

const ACHIEVEMENTS: Achievement[] = [
	{
		id: "kangaroo",
		icon: "sigma",
		short: "UKMT",
		ring: "UKMT KANGAROO • EVERY YEAR •",
		title: "Kangaroo Award",
		org: "UKMT Maths Challenges",
		note: "Earned a Distinction Kangaroo award every single year since Year 7.",
		years: ["Y7", "Y8", "Y9", "Y10", "Y11"],
	},
	{
		id: "bebras",
		icon: "code",
		short: "Bebras",
		ring: "BEBRAS CHALLENGE • DISTINCTION •",
		title: "Bebras Computing Challenge",
		org: "Distinction",
		note: "Distinction in the national computational-thinking challenge.",
	},
	{
		id: "ba",
		icon: "plane",
		short: "British Airways",
		ring: "BRITISH AIRWAYS • JOB SIMULATION •",
		title: "British Airways Job Simulation",
		org: "Virtual work experience",
		note: "Completed a British Airways job simulation. Worked through a series of tasks to experience what it's like to work in the airline industry including resource allocation and maintenance issue identification.",
	},

];

const C = 80; // patch centre (viewBox is 160 x 160)
const RING_R = 62;
const ORBIT_R = 74;
const CIRC = 2 * Math.PI * RING_R;

function ringText(text: string) {
	// Repeat the phrase so it fills the circle at a readable size.
	const repeats = Math.max(1, Math.round(CIRC / (text.length * 6.4)));
	return Array(repeats).fill(text).join(" ");
}

function iconPath(name: IconName) {
	switch (name) {
		case "code":
			return "m8 8-4 4 4 4m8-8 4 4-4 4m-2.5-11-3 14";
		case "sigma":
			return "M18 5H6l6 7-6 7h12";
		case "plane":
			return "M10.5 13.5 4 12l1-1.5 6 .5 4-5.5 2 .5-2 6.5 4.5 2.5-.5 1.5-5-1-2.5 4.5-1.5-.5Z";
	}
}

export default function Achievements() {
	const [selected, setSelected] = useState(0);
	const current = ACHIEVEMENTS[selected];

	return (
		<div className="ach">
			<p className="ach__eyebrow">Mission patches · {ACHIEVEMENTS.length} logged</p>

			<ul className="ach__patches">
				{ACHIEVEMENTS.map((a, i) => {
					const active = i === selected;
					const pathId = `ach-ring-${a.id}`;

					return (
						<li key={a.id}>
							<button
								type="button"
								className={`patch${active ? " patch--active" : ""}`}
								onClick={() => setSelected(i)}
								aria-pressed={active}
								aria-label={`${a.title}. ${a.org}`}
							>
								<svg viewBox="0 0 160 160" className="patch__svg" aria-hidden="true">
									<defs>
										<radialGradient id={`ach-core-${a.id}`} cx="50%" cy="42%" r="60%">
											<stop offset="0%" stopColor="#1b2540"/>
											<stop offset="100%" stopColor="#07080c"/>
										</radialGradient>
										<path
											id={pathId}
											d={`M ${C} ${C} m -${RING_R}, 0 a ${RING_R},${RING_R} 0 1,1 ${RING_R * 2},0 a ${RING_R},${RING_R} 0 1,1 -${RING_R * 2},0`}
										/>
									</defs>

									{/* patch body */}
									<circle cx={C} cy={C} r="78" className="patch__rim"/>
									<circle cx={C} cy={C} r="54" fill={`url(#ach-core-${a.id})`} className="patch__core"/>
									<circle cx={C} cy={C} r="47" className="patch__dash"/>

									{/* rotating ring text */}
									<g className="patch__spin">
										<text className="patch__text" fontSize="8.5" textLength={CIRC} lengthAdjust="spacing">
											<textPath href={`#${pathId}`}>{ringText(a.ring)}</textPath>
										</text>
									</g>

									{/* one orbiting satellite per year */}
									{a.years && (
										<g className="patch__orbit">
											{a.years.map((y, k) => {
												const angle = (k / a.years!.length) * Math.PI * 2 - Math.PI / 2;
												return (
													<circle
														key={y}
														cx={C + Math.cos(angle) * ORBIT_R}
														cy={C + Math.sin(angle) * ORBIT_R}
														r="3"
														className="patch__sat"
													/>
												);
											})}
										</g>
									)}

									{/* centre icon (24x24 icon scaled up and centred) */}
									<g transform={`translate(${C - 20} ${C - 20}) scale(1.67)`}>
										<path
											d={iconPath(a.icon)}
											fill="none"
											stroke="currentColor"
											strokeWidth="1.2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="patch__icon"
										/>
									</g>
								</svg>

								<span className="patch__label">{a.short}</span>
							</button>
						</li>
					);
				})}
			</ul>

			{/* mission log for the selected patch */}
			<div className="log" key={current.id} aria-live="polite">
				<p className="log__tag">
					Mission {String(selected + 1).padStart(2, "0")} / {String(ACHIEVEMENTS.length).padStart(2, "0")}
				</p>
				<h4>{current.title}</h4>
				<p className="log__org">{current.org}</p>
				<p className="log__note">{current.note}</p>

				{current.years && (
					<ul className="log__years" aria-label="Years earned">
						{current.years.map((y) => (
							<li key={y}>{y}</li>
						))}
					</ul>
				)}
			</div>

			<style jsx>{`
				.ach {
					display: grid;
					gap: 22px;
				}

				.ach__eyebrow {
					margin: 0;
					color: rgba(169, 193, 255, 0.75);
					font-size: 11.5px;
					font-weight: 600;
					letter-spacing: 0.2em;
					text-transform: uppercase;
				}

				.ach__patches {
					margin: 0;
					padding: 0;
					list-style: none;
					display: grid;
					grid-template-columns: repeat(3, minmax(0, 1fr));
					gap: clamp(8px, 2vw, 22px);
				}

				.patch {
					width: 100%;
					display: grid;
					justify-items: center;
					gap: 8px;
					padding: 0;
					border: 0;
					background: none;
					color: rgba(255, 255, 255, 0.55);
					font: inherit;
					cursor: pointer;
					transition:
						color 250ms ease,
						transform 300ms ease;
					-webkit-tap-highlight-color: transparent;
				}

				.patch:focus-visible {
					outline: 2px solid rgba(169, 193, 255, 0.7);
					outline-offset: 6px;
					border-radius: 16px;
				}

				.patch--active {
					color: #fff;
					transform: translateY(-3px);
				}

				.patch__svg {
					width: min(100%, 168px);
					height: auto;
					overflow: visible;
					transition: filter 300ms ease;
				}

				.patch--active .patch__svg {
					filter: drop-shadow(0 0 14px rgba(169, 193, 255, 0.45));
				}

				.patch__rim {
					fill: none;
					stroke: rgba(255, 255, 255, 0.14);
					stroke-width: 1;
					transition: stroke 300ms ease;
				}

				.patch--active .patch__rim {
					stroke: rgba(169, 193, 255, 0.7);
				}

				.patch__core {
					stroke: rgba(255, 255, 255, 0.16);
					stroke-width: 1;
				}

				.patch__dash {
					fill: none;
					stroke: rgba(255, 255, 255, 0.18);
					stroke-width: 0.8;
					stroke-dasharray: 2 5;
				}

				.patch__text {
					fill: currentColor;
					font-weight: 600;
				}

				.patch__spin {
					transform-origin: ${C}px ${C}px;
					animation: spin 60s linear infinite;
				}

				.patch--active .patch__spin {
					animation-duration: 26s;
				}

				.patch__orbit {
					transform-origin: ${C}px ${C}px;
					animation: spin 40s linear infinite reverse;
				}

				.patch--active .patch__orbit {
					animation-duration: 16s;
				}

				.patch__sat {
					fill: #a9c1ff;
				}

				.patch--active .patch__sat {
					filter: drop-shadow(0 0 3px rgba(169, 193, 255, 0.95));
				}

				.patch__icon {
					color: #a9c1ff;
				}

				.patch__label {
					font-size: 13px;
					font-weight: 600;
					letter-spacing: -0.01em;
					text-align: center;
				}

				.log {
					padding: 2px 0 2px 18px;
					border-left: 1px solid rgba(169, 193, 255, 0.5);
					animation: arrive 420ms cubic-bezier(0.2, 0.7, 0.2, 1);
				}

				.log__tag {
					margin: 0;
					color: rgba(169, 193, 255, 0.8);
					font-size: 11.5px;
					font-weight: 600;
					letter-spacing: 0.18em;
					text-transform: uppercase;
				}

				.log h4 {
					margin: 8px 0 0;
					color: #fff;
					font-size: clamp(19px, 2.2vw, 23px);
					font-weight: 700;
					letter-spacing: -0.02em;
				}

				.log__org {
					margin: 4px 0 0;
					color: rgba(255, 255, 255, 0.78);
					font-size: 14.5px;
				}

				.log__note {
					max-width: 58ch;
					margin: 8px 0 0;
					color: rgba(255, 255, 255, 0.6);
					font-size: 14px;
					line-height: 1.6;
				}

				.log__years {
					margin: 12px 0 0;
					padding: 0;
					list-style: none;
					display: flex;
					flex-wrap: wrap;
					gap: 6px;
				}

				.log__years li {
					padding: 4px 10px;
					border: 1px solid rgba(169, 193, 255, 0.3);
					border-radius: 999px;
					background: rgba(169, 193, 255, 0.08);
					color: #fff;
					font-size: 12px;
					font-weight: 600;
				}

				@keyframes spin {
					from {
						transform: rotate(0deg);
					}
					to {
						transform: rotate(360deg);
					}
				}

				@keyframes arrive {
					from {
						opacity: 0;
						transform: translateY(6px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				@media (max-width: 480px) {
					.patch__label {
						font-size: 12px;
					}
				}

				@media (prefers-reduced-motion: reduce) {
					.patch__spin,
					.patch__orbit,
					.log {
						animation: none;
					}

					.patch,
					.patch__svg,
					.patch__rim {
						transition: none;
					}
				}
			`}</style>
		</div>
	);
}