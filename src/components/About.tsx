"use client";

import { useRef, useState } from "react";
import Technologies from "@/components/Technologies";
import Education from "@/components/Education";
import Achievements from "@/components/Achievements";

const PROFILE = {
	name: "Shashish Panda",
	location: "Hertfordshire, UK",
	role: "Student engineer",
	avatar: "https://github.com/Pandalfer.png?size=240",
	initials: "SP",
	description: [
		"I'm a full stack developer who builds useful software and spends my spare time exploring aerospace, mathematics and physics.",
		"I work part time in Code Ninjas, a teaching place for younger students to help them learn the basics of programming and game development.",
		"I'm open to apprenticeships, work experience and collaborations in aerospace and technology alongside my A-Levels. If you wish to contact me, please use the contact form at the bottom of the page.",
	],
};

type Panel = {
	id: string;
	button?: string;
	title?: string;
};

const PANELS: Panel[] = [
	{ id: "profile" },
	{ id: "education", button: "Education", title: "Education" },
	{ id: "technologies", button: "Technologies", title: "Technologies" },
	{
		id: "achievements",
		button: "Achievements",
		title: "Achievements",
	},
];

export type AboutDirection = "horizontal" | "vertical";

const DEFAULT_DIRECTION: AboutDirection = "horizontal";

function ArrowIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M5 12h14m-6-6 6 6-6 6"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export default function About({
	                              direction = DEFAULT_DIRECTION,
                              }: {
	direction?: AboutDirection;
}) {
	const [active, setActive] = useState(0);
	const [avatarFailed, setAvatarFailed] = useState(false);

	const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

	const go = (index: number) => {
		const next = index === active ? 0 : index;
		setActive(next);
	};

	const renderBody = (id: string) => {
		switch (id) {
			case "education":
				return <Education/>
			case "achievements":
				return <Achievements/>
			case "technologies":
				return <Technologies />;
			default:
				return null;
		}
	};

	return (
		<section id="about" className="about" aria-label="About">
			<div className="about__inner">
				<div className="about__layout">
					<div className="card">
						<div
							className={`track track--${direction}`}
							style={{
								transform:
									direction === "horizontal"
										? `translateX(${-active * 100}%)`
										: `translateY(calc(var(--card-h) * ${-active}))`,
							}}
						>
							{PANELS.map((panel, i) => (
								<div
									key={panel.id}
									id={`about-panel-${panel.id}`}
									ref={(el) => {
										panelRefs.current[i] = el;
									}}
									className={`panel ${
										panel.id === "technologies"
											? "panel--technologies"
											: ""
									}`}
									inert={i !== active}
									tabIndex={i === active ? 0 : -1}
									aria-label={panel.title ?? "Profile"}
								>
									<div className="panel__content">
										{i === 0 ? (
											<>
												<div className="profile">
													<div className="avatar">
														{avatarFailed ? (
															<span className="avatar__fallback">
                                {PROFILE.initials}
                              </span>
														) : (
															<img
																src={PROFILE.avatar}
																alt={`${PROFILE.name}'s GitHub avatar`}
																width={96}
																height={96}
																referrerPolicy="no-referrer"
																onError={() => setAvatarFailed(true)}
															/>
														)}
													</div>

													<div className="profile__text">
														<h3>{PROFILE.name}</h3>

														<p className="profile__role">
															{PROFILE.role}
														</p>

														<p className="profile__location">
															{PROFILE.location}
														</p>
													</div>
												</div>

												<div className="divider" />

												<div className="description">
													{PROFILE.description.map((paragraph, p) => (
														<p key={p}>{paragraph}</p>
													))}
												</div>
											</>
										) : (
											renderBody(panel.id)
										)}
									</div>
								</div>
							))}
						</div>
					</div>

					<nav className="nav" aria-label="About sections">
						{PANELS.map((panel, i) =>
							panel.button ? (
								<button
									key={panel.id}
									type="button"
									className={`nav__button${
										active === i ? " nav__button--active" : ""
									}`}
									onClick={() => go(i)}
									aria-controls={`about-panel-${panel.id}`}
									aria-pressed={active === i}
									title={
										active === i ? "Back to profile" : undefined
									}
								>
									<span>{panel.button}</span>

									<span className="nav__arrow">
                    <ArrowIcon />
                  </span>
								</button>
							) : null
						)}
					</nav>
				</div>
			</div>

			<style jsx>{`
				.about {
					--card-h: clamp(430px, 62vh, 540px);
					position: relative;
					z-index: 10;
					min-height: 100vh;
					min-height: 100svh;
					width: 100%;
					box-sizing: border-box;
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 72px clamp(16px, 4vw, 48px);
					color: #fff;
					pointer-events: auto;
					touch-action: pan-y;
				}

				.about__inner {
					width: min(1000px, 100%);
				}

				.about__heading {
					margin: 0 0 22px;
					font-size: clamp(28px, 3.5vw, 38px);
					font-weight: 800;
					line-height: 1.05;
					letter-spacing: -0.03em;
					text-shadow: 0 2px 18px rgba(0, 0, 0, 0.9);
				}

				.about__layout {
					display: grid;
					grid-template-columns: minmax(0, 1fr) 230px;
					gap: 18px;
					align-items: start;
				}

				.card {
					position: relative;
					height: var(--card-h);
					overflow: hidden;
					border: 1px solid rgba(255, 255, 255, 0.1);
					border-radius: 14px;
					background: rgba(14, 14, 14, 0.84);
					-webkit-backdrop-filter: blur(14px);
					backdrop-filter: blur(14px);
					box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
					touch-action: pan-y;
				}

				.track {
					height: 100%;
					transition: transform 620ms cubic-bezier(0.65, 0, 0.25, 1);
					will-change: transform;
				}

				.track--horizontal {
					display: flex;
					width: 100%;
				}

				.track--horizontal .panel {
					flex: 0 0 100%;
					width: 100%;
					min-width: 0;
				}

				.track--vertical {
					width: 100%;
				}

				.track--vertical .panel {
					width: 100%;
				}

				.panel {
					height: var(--card-h);
					box-sizing: border-box;
					overflow: hidden;
					padding: clamp(20px, 3vw, 34px);
					outline: none;
					touch-action: pan-y;
				}

				.panel__content {
					width: 100%;
					max-width: 100%;
					box-sizing: border-box;
					max-height: calc(
						var(--card-h) - (clamp(20px, 3vw, 34px) * 2)
					);
					overflow-y: auto;
					overflow-x: hidden;
					overscroll-behavior: auto;
					-webkit-overflow-scrolling: touch;
					scrollbar-width: thin;
					scrollbar-color:
						rgba(255, 255, 255, 0.25)
						transparent;
					touch-action: pan-y;
				}

				.panel--technologies {
					overflow: visible;
				}

				.panel--technologies .panel__content {
					height: 100%;
					max-height: none;
					overflow: visible;
				}

				.panel__content::-webkit-scrollbar {
					width: 6px;
				}

				.panel__content::-webkit-scrollbar-track {
					background: transparent;
				}

				.panel__content::-webkit-scrollbar-thumb {
					background: rgba(255, 255, 255, 0.25);
					border-radius: 999px;
				}

				.panel__content::-webkit-scrollbar-thumb:hover {
					background: rgba(255, 255, 255, 0.4);
				}

				.panel:focus-visible {
					box-shadow:
						inset 0 0 0 2px rgba(255, 255, 255, 0.4);
				}

				.profile {
					display: flex;
					align-items: center;
					gap: clamp(14px, 2.4vw, 24px);
				}

				.avatar {
					width: 96px;
					height: 96px;
					flex: 0 0 auto;
					box-sizing: border-box;
					padding: 4px;
					border: 1px solid rgba(255, 255, 255, 0.28);
					border-radius: 50%;
				}

				.avatar img,
				.avatar__fallback {
					width: 100%;
					height: 100%;
					display: grid;
					place-items: center;
					border-radius: 50%;
					object-fit: cover;
					background: #1c1c1c;
					filter: grayscale(1) contrast(1.05);
					font-size: 26px;
					font-weight: 700;
					letter-spacing: 0.04em;
				}

				.profile__text {
					min-width: 0;
				}

				.profile__text h3 {
					margin: 0;
					font-size: clamp(22px, 2.6vw, 28px);
					font-weight: 700;
					line-height: 1.15;
					letter-spacing: -0.02em;
				}

				.profile__role {
					margin: 6px 0 0;
					color: rgba(255, 255, 255, 0.82);
					font-size: 15px;
				}

				.profile__location {
					margin: 3px 0 0;
					color: rgba(255, 255, 255, 0.5);
					font-size: 14px;
				}

				.divider {
					height: 1px;
					margin: 22px 0;
					background: rgba(255, 255, 255, 0.1);
				}

				.description p {
					max-width: 62ch;
					margin: 0 0 14px;
					color: rgba(255, 255, 255, 0.7);
					font-size: clamp(15px, 1.5vw, 17px);
					line-height: 1.7;
				}

				.description p:last-child {
					margin-bottom: 0;
				}

				.panel__title {
					margin: 0;
					font-size: clamp(22px, 2.6vw, 28px);
					font-weight: 700;
					letter-spacing: -0.02em;
				}

				.timeline {
					margin: 0;
					padding: 0;
					list-style: none;
					display: grid;
					gap: 22px;
				}

				.timeline__item {
					padding-left: 18px;
					border-left: 1px solid rgba(255, 255, 255, 0.18);
				}

				.timeline__top {
					display: flex;
					flex-wrap: wrap;
					align-items: baseline;
					justify-content: space-between;
					gap: 4px 16px;
				}

				.timeline__top h4 {
					margin: 0;
					font-size: 17px;
					font-weight: 650;
				}

				.timeline__period {
					color: rgba(255, 255, 255, 0.5);
					font-size: 13px;
					white-space: nowrap;
				}

				.timeline__place {
					margin: 4px 0 0;
					color: rgba(255, 255, 255, 0.78);
					font-size: 14.5px;
				}

				.timeline__note {
					max-width: 62ch;
					margin: 8px 0 0;
					color: rgba(255, 255, 255, 0.58);
					font-size: 14px;
					line-height: 1.6;
				}

				.skills {
					display: grid;
					gap: 22px;
				}

				.skills__group h4 {
					margin: 0 0 10px;
					color: rgba(255, 255, 255, 0.78);
					font-size: 14.5px;
					font-weight: 650;
				}

				.skills__group ul {
					margin: 0;
					padding: 0;
					list-style: none;
					display: flex;
					flex-wrap: wrap;
					gap: 8px;
				}

				.skills__group li {
					padding: 7px 13px;
					border: 1px solid rgba(255, 255, 255, 0.14);
					border-radius: 999px;
					background: rgba(255, 255, 255, 0.04);
					color: rgba(255, 255, 255, 0.85);
					font-size: 13.5px;
				}

				.nav {
					display: flex;
					flex-direction: column;
					gap: 12px;
				}

				.nav__button {
					width: 100%;
					min-height: 56px;
					display: flex;
					align-items: center;
					justify-content: space-between;
					gap: 12px;
					box-sizing: border-box;
					padding: 0 18px;
					border: 1px solid rgba(255, 255, 255, 0.12);
					border-radius: 12px;
					background: rgba(14, 14, 14, 0.84);
					-webkit-backdrop-filter: blur(14px);
					backdrop-filter: blur(14px);
					color: #fff;
					font: inherit;
					font-size: 15px;
					font-weight: 600;
					text-align: left;
					cursor: pointer;
					transition:
						background 180ms ease,
						border-color 180ms ease,
						color 180ms ease;
					touch-action: manipulation;
				}

				.nav__button:hover {
					border-color: rgba(255, 255, 255, 0.3);
					background: rgba(28, 28, 28, 0.9);
				}

				.nav__button:focus-visible {
					outline: 2px solid rgba(255, 255, 255, 0.7);
					outline-offset: 2px;
				}

				.nav__button--active,
				.nav__button--active:hover {
					background: #fff;
					border-color: #fff;
					color: #0a0a0a;
				}

				.nav__arrow {
					display: grid;
					place-items: center;
					transition: transform 280ms ease;
				}

				.nav__arrow :global(svg) {
					width: 20px;
					height: 20px;
				}

				.nav__button:hover .nav__arrow {
					transform: translateX(3px);
				}

				.nav__button--active .nav__arrow,
				.nav__button--active:hover .nav__arrow {
					transform: rotate(180deg);
				}

				@media (max-width: 820px) {
					.about {
						--card-h: clamp(400px, 64svh, 520px);
						align-items: flex-start;
						padding-top: 84px;
						padding-bottom: 56px;
					}

					.about__layout {
						grid-template-columns: 1fr;
					}

					.nav {
						flex-direction: row;
						flex-wrap: wrap;
					}

					.nav__button {
						flex: 1 1 150px;
						width: auto;
					}

					.panel {
						padding: 22px;
					}

					.panel__content {
						max-height: calc(var(--card-h) - 44px);
					}

					.panel--technologies .panel__content {
						max-height: none;
					}
				}

				@media (max-width: 480px) {
					.profile {
						flex-direction: column;
						align-items: flex-start;
					}

					.avatar {
						width: 84px;
						height: 84px;
					}

					.divider {
						margin: 18px 0;
					}

					.nav {
						flex-direction: column;
					}

					.nav__button {
						flex: none;
						width: 100%;
					}

					.panel {
						padding: 20px;
					}

					.panel__content {
						max-height: calc(var(--card-h) - 40px);
					}

					.panel--technologies .panel__content {
						max-height: none;
					}
				}

				@media (prefers-reduced-motion: reduce) {
					.track,
					.nav__button,
					.nav__arrow {
						transition: none;
					}
				}
			`}</style>
		</section>
	);
}