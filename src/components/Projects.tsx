	"use client";

	import {
		useCallback,
		useEffect,
		useRef,
		useState,
		type CSSProperties,
	} from "react";

	type Project = {
		id: string;
		title: string;
		category: string;
		x: number;
		y: number;
		size: "small" | "medium" | "large";
		/** Short blurb shown in the modal (1-2 sentences works best). */
		description: string;
		/** Technologies used. */
		tech: string[];
		/** Path to a screenshot, e.g. "/projects/alpha.png" (put files in /public/projects). */
		image?: string;
		/** Optional link. The button is hidden when this is omitted. */
		link?: string;
	};

	const PROJECTS: Project[] = [
		{
			id: "textana",
			title: "Textana",
			category: "AI / IMAGE PROCESSING",
			x: 22,
			y: 34,
			size: "large",
			description:
				"An image-to-text extraction tool built to make it easier to feed screenshots and images into LLMs. Includes image preprocessing such as binarization and deskewing to improve extraction quality.",
			tech: ["TypeScript", "React", "Python", "Image Processing", "Tailwind CSS"],
			image: "/projects/TextanaScreenshot.webp",
			link: "https://textana.vercel.app/",
		},
		{
			id: "studanova",
			title: "Studanova",
			category: "FULL-STACK / PRODUCTIVITY",
			x: 50,
			y: 20,
			size: "large",
			description:
				"A student productivity platform that turns notes from Notion and Obsidian into flashcards using AI, with a full database-backed architecture and responsive UI.",
			tech: ["Next.js", "TypeScript", "Prisma ORM", "Supabase", "Tailwind CSS"],
			image: "/projects/StudanovaScreenshot.png",
			link: "https://studanova.vercel.app/",
		},
		{
			id: "spaceattack",
			title: "SpaceAttack",
			category: "GAME / UNITY",
			x: 73,
			y: 40,
			size: "medium",
			description:
				"A space-themed game I built in Unity as part of my Code Ninjas Black Belt project. The project is published as a playable web build.",
			tech: ["Unity", "WebGL"],
			image: "/projects/SpaceAttack.webp",
			link: "https://pandalfer.github.io/SpaceAttack/",
		},
		{
			id: "blur",
			title: "Blur Auto Clicker",
			category: "OPEN SOURCE",
			x: 58,
			y: 72,
			size: "medium",
			description:
				"An open-source contribution to Blur Auto Clicker, a Windows desktop auto-clicker project with a focus on performance and a large set of advanced features. Contributed some UI changes and helped plan new features with the creator",
			tech: ["Tauri", "Rust", "React", "TypeScript"],
			image: "/projects/BlurAutoClickerScreenshot.png",
			link: "https://autoclicker.blur009.com",
		},
	];

	const CONNECTIONS = [
		["textana", "studanova"],
		["studanova", "spaceattack"],
		["studanova", "blur"],
		["textana", "blur"],
	];
	const projectMap = new Map(PROJECTS.map((project) => [project.id, project]));

	const ZOOM = 3.2;

	const SHELL_MS = 420;
	const ZOOM_MS = 800;

	/** How long after the zoom finishes before the modal fades in. */
	const MODAL_DELAY_MS = 250;
	const MODAL_MS = 450;

	/** At or above this viewport width the modal takes the left half of the screen. */
	const SPLIT_MIN_WIDTH = 1024;

	/** In split mode the zoomed star is centred in the right half (75% across). */
	const SPLIT_ANCHOR_X = 0.75;

	const BORDER = 1;

	type Phase =
		| "idle"
		| "lifting"
		| "expanding"
		| "zooming"
		| "open"
		| "closing-zoom"
		| "closing-shell";

	type Rect = {
		top: number;
		left: number;
		width: number;
		height: number;
	};

	/*
	 * anchorX is where the zoomed star ends up horizontally (0.5 = centre,
	 * 0.75 = centre of the right half). The cover calculation makes sure the
	 * zoom is large enough that no empty space shows at the viewport edges.
	 */
	function zoomFor(project: Project, rect: Rect, anchorX: number) {
		const vw = window.innerWidth;
		const vh = window.innerHeight;

		const px = (project.x / 100) * vw;
		const py = (project.y / 100) * vh;

		const base = Math.max(ZOOM, Math.min(ZOOM * (vw / rect.width), ZOOM * 1.7));

		const cover = Math.max(
			(anchorX * vw) / px,
			((1 - anchorX) * vw) / (vw - px),
			vh / (2 * Math.min(py, vh - py))
		);

		return Math.min(Math.max(base, cover), base * 1.4);
	}

	export default function Projects() {
		const [phase, setPhase] = useState<Phase>("idle");

		const [activeId, setActiveId] = useState<string | null>(null);

		const [rect, setRect] = useState<Rect | null>(null);

		const [zoom, setZoom] = useState(ZOOM);

		const [headerHidden, setHeaderHidden] = useState(false);

		/* Wide screens: modal on the left half, star on the right half. */
		const [split, setSplit] = useState(false);

		/* Modal fades in a moment after the zoom has finished. */
		const [modalOpen, setModalOpen] = useState(false);

		/* Screenshots that failed to load fall back to a placeholder. */
		const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

		const wrapperRef = useRef<HTMLDivElement>(null);

		const backRef = useRef<HTMLButtonElement>(null);

		const triggerRef = useRef<HTMLButtonElement | null>(null);

		const transitionTimer = useRef<number>(0);

		const active = activeId ? projectMap.get(activeId) ?? null : null;

		const locked = phase !== "idle";

		const expanded = phase === "zooming" || phase === "open";

		const measure = useCallback((): Rect | null => {
			const wrapper = wrapperRef.current;

			if (!wrapper) {
				return null;
			}

			const r = wrapper.getBoundingClientRect();

			return {
				top: r.top,
				left: r.left,
				width: r.width,
				height: r.height,
			};
		}, []);

		/*
		 * ---------------------------------------------------------
		 * OPEN PROJECT
		 * ---------------------------------------------------------
		 *
		 * Header disappears immediately.
		 *
		 * The chart itself:
		 *
		 * 1. Lifts into a fixed layer.
		 * 2. Expands to the viewport.
		 * 3. Zooms into the selected star.
		 * 4. The project modal fades in.
		 *
		 * The shell is never scaled with scaleX/scaleY.
		 * Only its actual dimensions change.
		 */

		const openProject = (id: string, trigger: HTMLButtonElement) => {
			if (phase !== "idle") {
				return;
			}

			const project = projectMap.get(id);

			const r = measure();

			if (!project || !r) {
				return;
			}

			triggerRef.current = trigger;

			const isSplit = window.innerWidth >= SPLIT_MIN_WIDTH;

			/*
			 * IMPORTANT:
			 * Hide immediately.
			 *
			 * The hidden CSS state has transition:none,
			 * so there is no delay when clicking a star.
			 */
			setHeaderHidden(true);
			window.dispatchEvent(new Event("project-open"));

			setRect(r);

			setSplit(isSplit);

			setZoom(zoomFor(project, r, isSplit ? SPLIT_ANCHOR_X : 0.5));

			setActiveId(id);

			setPhase("lifting");
		};

		/*
		 * ---------------------------------------------------------
		 * CLOSE PROJECT
		 * ---------------------------------------------------------
		 *
		 * Header stays hidden during BOTH closing stages.
		 *
		 * 1. Modal fades out and the camera zooms out.
		 * 2. Full constellation is visible.
		 * 3. Shell shrinks back to its card.
		 * 4. Header is revealed only after the shell has finished.
		 */

		const close = useCallback(() => {
			if (phase !== "open") {
				return;
			}

			const r = measure();

			if (r) {
				setRect(r);
			}

			setHeaderHidden(true);

			setPhase("closing-zoom");
		}, [phase, measure]);

		/*
		 * ---------------------------------------------------------
		 * ANIMATION STAGING
		 * ---------------------------------------------------------
		 */

		useEffect(() => {
			const reduced = window.matchMedia(
				"(prefers-reduced-motion: reduce)"
			).matches;

			window.clearTimeout(transitionTimer.current);

			/*
			 * lifting -> expanding
			 *
			 * Wait two animation frames so the browser
			 * paints the fixed starting rectangle before
			 * the dimensions begin transitioning.
			 */
			if (phase === "lifting") {
				if (reduced) {
					setPhase("expanding");
					return;
				}

				let raf2 = 0;

				const raf1 = requestAnimationFrame(() => {
					raf2 = requestAnimationFrame(() => {
						setPhase("expanding");
					});
				});

				return () => {
					cancelAnimationFrame(raf1);
					cancelAnimationFrame(raf2);
				};
			}

			/*
			 * Shell expands to fullscreen.
			 */
			if (phase === "expanding") {
				transitionTimer.current = window.setTimeout(
					() => {
						setPhase("zooming");
					},
					reduced ? 0 : SHELL_MS
				);

				return () => {
					window.clearTimeout(transitionTimer.current);
				};
			}

			/*
			 * Camera zoom completes.
			 */
			if (phase === "zooming") {
				transitionTimer.current = window.setTimeout(
					() => {
						setPhase("open");
					},
					reduced ? 0 : ZOOM_MS
				);

				return () => {
					window.clearTimeout(transitionTimer.current);
				};
			}

			/*
			 * CLOSING STAGE 1
			 *
			 * Fullscreen shell remains in place while the
			 * camera returns from the selected star to 1x.
			 */
			if (phase === "closing-zoom") {
				transitionTimer.current = window.setTimeout(
					() => {
						setPhase("closing-shell");
					},
					reduced ? 0 : ZOOM_MS
				);

				return () => {
					window.clearTimeout(transitionTimer.current);
				};
			}

			/*
			 * CLOSING STAGE 2
			 *
			 * The shell contracts back into the original
			 * card position. The header is STILL hidden here.
			 */
			if (phase === "closing-shell") {
				transitionTimer.current = window.setTimeout(
					() => {
						setPhase("idle");
						setActiveId(null);

						/*
						 * Only NOW does the header return.
						 */
						setHeaderHidden(false);
						window.dispatchEvent(new Event("project-close"));

						triggerRef.current?.focus({
							preventScroll: true,
						});
					},
					reduced ? 0 : SHELL_MS
				);

				return () => {
					window.clearTimeout(transitionTimer.current);
				};
			}
		}, [phase]);

		/*
		 * ---------------------------------------------------------
		 * MODAL TIMING
		 * ---------------------------------------------------------
		 *
		 * Fades in shortly after the zoom has fully finished
		 * (phase === "open"). Hides immediately as soon as the
		 * phase moves on, so it is gone before the camera zooms out.
		 */

		useEffect(() => {
			if (phase !== "open") {
				setModalOpen(false);
				return;
			}

			const reduced = window.matchMedia(
				"(prefers-reduced-motion: reduce)"
			).matches;

			const timer = window.setTimeout(
				() => {
					setModalOpen(true);
				},
				reduced ? 0 : MODAL_DELAY_MS
			);

			return () => {
				window.clearTimeout(timer);
			};
		}, [phase]);

		/*
		 * ---------------------------------------------------------
		 * CLEANUP
		 * ---------------------------------------------------------
		 */

		useEffect(() => {
			return () => {
				window.clearTimeout(transitionTimer.current);
			};
		}, []);

		/*
		 * ---------------------------------------------------------
		 * LOCK DOCUMENT SCROLL
		 * ---------------------------------------------------------
		 */

		useEffect(() => {
			if (!locked) {
				return;
			}

			const html = document.documentElement;

			const previousOverflow = html.style.overflow;

			const previousPadding = html.style.paddingRight;

			const scrollbar = window.innerWidth - html.clientWidth;

			html.style.overflow = "hidden";

			if (scrollbar > 0) {
				html.style.paddingRight = `${scrollbar}px`;
			}

			return () => {
				html.style.overflow = previousOverflow;

				html.style.paddingRight = previousPadding;
			};
		}, [locked]);

		/*
		 * ---------------------------------------------------------
		 * ESCAPE + FOCUS
		 * ---------------------------------------------------------
		 */

		useEffect(() => {
			if (!expanded) {
				return;
			}

			backRef.current?.focus({
				preventScroll: true,
			});

			const onKeyDown = (event: KeyboardEvent) => {
				if (event.key === "Escape") {
					close();
				}
			};

			window.addEventListener("keydown", onKeyDown);

			return () => {
				window.removeEventListener("keydown", onKeyDown);
			};
		}, [expanded, close]);

		/*
		 * ---------------------------------------------------------
		 * SHELL FRAME
		 * ---------------------------------------------------------
		 */

		const shellFullscreen =
			phase === "expanding" ||
			phase === "zooming" ||
			phase === "open" ||
			phase === "closing-zoom";

		const shellStyle =
			locked && rect
				? ({
					top: shellFullscreen ? 0 : rect.top,

					left: shellFullscreen ? 0 : rect.left,

					width: shellFullscreen ? "100vw" : `${rect.width}px`,

					height: shellFullscreen ? "100vh" : `${rect.height}px`,
				} as CSSProperties)
				: undefined;

		/*
		 * ---------------------------------------------------------
		 * WORLD / CAMERA
		 * ---------------------------------------------------------
		 *
		 * The camera uses ONE uniform scale.
		 *
		 * The star is centred horizontally on screen, or on the
		 * centre of the right half when the modal is split-screen.
		 */

		let worldStyle: CSSProperties | undefined;

		if (locked && rect && active) {
			const vw = window.innerWidth;

			const vh = window.innerHeight;

			const px = (active.x / 100) * vw;

			const py = (active.y / 100) * vh;

			const targetX = (split ? vw * SPLIT_ANCHOR_X : vw / 2) - px;

			const targetY = vh / 2 - py;

			const cameraZooming = phase === "zooming" || phase === "open";

			worldStyle = {
				left: 0,
				top: 0,

				right: "auto",
				bottom: "auto",

				width: "100%",
				height: "100%",

				transformOrigin: `${px}px ${py}px`,

				transform: cameraZooming
					? `translate3d(${targetX}px, ${targetY}px, 0) scale3d(${zoom}, ${zoom}, 1)`
					: "translate3d(0, 0, 0) scale3d(1, 1, 1)",

				willChange: "transform",

				backfaceVisibility: "hidden",

				transformStyle: "preserve-3d",
			};
		}

		const showImage = active ? !!active.image && !failedImages[active.id] : false;

		return (
			<section id="projects" className="projects">
				<div className="projects__inner">
					{/* ------------------------------------------------
		            HEADER
		            ------------------------------------------------ */}

					<header
						className={[
							"projects__header",

							headerHidden
								? "projects__header--hidden"
								: "projects__header--visible",
						]
							.filter(Boolean)
							.join(" ")}
					>
						<h2>Things I&apos;ve built</h2>

						<p className="projects__intro">
							A constellation of projects, experiments and technical work.
						</p>
					</header>

					{/* ------------------------------------------------
		            CHART
		            ------------------------------------------------ */}

					<div className="chart-wrapper" ref={wrapperRef}>
						<div
							className={[
								"chart-shell",

								locked ? "chart-shell--fixed" : "",

								phase === "lifting" ? "chart-shell--lifting" : "",

								expanded ? "chart-shell--open" : "",

								split ? "chart-shell--split" : "",

								phase === "closing-shell" ? "chart-shell--closing" : "",
							]
								.filter(Boolean)
								.join(" ")}
							style={shellStyle}
						>
							<div className="chart-world" style={worldStyle}>
								<div className="chart-background" aria-hidden="true">
									<div className="chart-grid" />

									<div className="chart-scan" />

									<div className="chart-drift chart-drift--one" />

									<div className="chart-drift chart-drift--two" />
								</div>

								{/* ------------------------------------------------
		                  CONNECTIONS
		                  ------------------------------------------------ */}

								<svg
									className="chart-lines"
									viewBox="0 0 100 100"
									preserveAspectRatio="none"
									aria-hidden="true"
								>
									{CONNECTIONS.map(([from, to]) => {
										const a = projectMap.get(from)!;

										const b = projectMap.get(to)!;

										return (
											<g key={`${from}-${to}`}>
												<line
													x1={a.x}
													y1={a.y}
													x2={b.x}
													y2={b.y}
													className="chart-line-glow"
												/>

												<line
													x1={a.x}
													y1={a.y}
													x2={b.x}
													y2={b.y}
													className="chart-line"
												/>
											</g>
										);
									})}
								</svg>

								{/* ------------------------------------------------
		                  STARS
		                  ------------------------------------------------ */}

								{PROJECTS.map((project) => (
									<button
										key={project.id}
										type="button"
										className={`star star--${project.size}`}
										style={{
											left: `${project.x}%`,
											top: `${project.y}%`,
										}}
										onClick={(event) =>
											openProject(project.id, event.currentTarget)
										}
										tabIndex={locked ? -1 : 0}
										aria-label={`Zoom in on ${project.title}`}
									>
										<span className="star__halo" />

										<span className="star__core" />

										<span className="star__label">
											<span>{project.title}</span>

											<small>{project.category}</small>
										</span>
									</button>
								))}
							</div>

							{/* ------------------------------------------------
		                PROJECT MODAL
		                ------------------------------------------------ */}

							{active && (
								<aside
									className={[
										"chart-modal",

										split ? "chart-modal--split" : "",

										modalOpen ? "chart-modal--visible" : "",
									]
										.filter(Boolean)
										.join(" ")}
									role="dialog"
									aria-labelledby="chart-modal-title"
									aria-hidden={!modalOpen}
								>
									<div className="chart-modal__scroll">
										<div className="chart-modal__content">
											<div className="chart-modal__media">
												{showImage ? (
													// eslint-disable-next-line @next/next/no-img-element
													<img
														key={active.id}
														src={active.image}
														alt={`Screenshot of ${active.title}`}
														decoding="async"
														onError={() =>
															setFailedImages((prev) => ({
																...prev,
																[active.id]: true,
															}))
														}
													/>
												) : (
													<div
														className="chart-modal__placeholder"
														role="img"
														aria-label="Screenshot not available yet"
													>
														<span>Preview coming soon</span>
													</div>
												)}
											</div>

											<div className="chart-modal__body">
												<p className="chart-modal__category">
													{active.category}
												</p>

												<h3 id="chart-modal-title">{active.title}</h3>

												<div className="chart-modal__description">
													{active.description}
												</div>

												<div className="chart-modal__tech-block">
													<p className="chart-modal__tech-label">Built with</p>

													<ul className="chart-modal__tech">
														{active.tech.map((item) => (
															<li key={item}>{item}</li>
														))}
													</ul>
												</div>

												{active.link && (
													<a
														className="chart-modal__link"
														href={active.link}
														target="_blank"
														rel="noopener noreferrer"
													>
														Visit project
														<svg viewBox="0 0 24 24" aria-hidden="true">
															<path
																d="M7 17L17 7M9 7h8v8"
																fill="none"
																stroke="currentColor"
																strokeWidth="2"
																strokeLinecap="round"
																strokeLinejoin="round"
															/>
														</svg>
													</a>
												)}
											</div>
										</div>
									</div>
								</aside>
							)}

							{/* ------------------------------------------------
		                BACK BUTTON
		                ------------------------------------------------ */}

							<button
								ref={backRef}
								type="button"
								className="chart-back"
								onClick={close}
								tabIndex={expanded ? 0 : -1}
								aria-hidden={!expanded}
								aria-label="Back to projects"
							>
								<svg viewBox="0 0 24 24" aria-hidden="true">
									<path
										d="M15 6l-6 6 6 6"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								Back
							</button>
						</div>
					</div>
				</div>

				<style jsx>{`
					.projects {
						position: relative;
						z-index: 10;
						width: 100%;
						min-height: 100svh;
						box-sizing: border-box;
						padding: clamp(90px, 11vw, 150px) clamp(18px, 6vw, 80px) 110px;
						color: #fff;
					}
	
					.projects__inner {
						width: min(1180px, 100%);
						margin: 0 auto;
					}
	
					/* ------------------------------------------------
						 HEADER
						 ------------------------------------------------ */
	
					.projects__header {
						display: grid;
						grid-template-columns: minmax(0, 1fr) minmax(300px, 500px);
						gap: 40px;
						align-items: end;
						margin-bottom: 28px;
						opacity: 1;
						transform: translate3d(0, 0, 0);
					}
	
					/* OPEN: disappears immediately, no transition. */
					.projects__header--hidden {
						opacity: 0;
						transform: translate3d(0, -12px, 0);
						pointer-events: none;
						transition: none !important;
					}
	
					/* CLOSED: fades back in AFTER the closing sequence. */
					.projects__header--visible {
						opacity: 1;
						transform: translate3d(0, 0, 0);
						pointer-events: auto;
						transition:
							opacity 500ms cubic-bezier(0.22, 1, 0.36, 1),
							transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
					}
	
					.projects h2 {
						margin: 0;
						font-size: clamp(34px, 5vw, 64px);
						font-weight: 650;
						letter-spacing: -0.045em;
						line-height: 0.98;
						text-shadow: 0 3px 30px rgba(0, 0, 0, 0.95);
					}
	
					.projects__intro {
						margin: 0;
						max-width: 42rem;
						color: rgba(255, 255, 255, 0.82);
						font-size: clamp(14px, 1.15vw, 17px);
						line-height: 1.6;
						letter-spacing: 0.01em;
						text-shadow: 0 2px 22px rgba(0, 0, 0, 0.95);
					}
	
					/* ------------------------------------------------
						 CHART WRAPPER
						 ------------------------------------------------ */
	
					.chart-wrapper {
						position: relative;
						width: 100%;
						height: clamp(500px, 66vw, 720px);
						min-height: 500px;
					}
	
					/* ------------------------------------------------
						 NORMAL CHART
						 ------------------------------------------------ */
	
					.chart-shell {
						position: relative;
						width: 100%;
						height: 100%;
						overflow: hidden;
						box-sizing: border-box;
						border: 1px solid rgba(255, 255, 255, 0.13);
						border-radius: 28px;
						background: rgba(0, 0, 0, 0.5);
						isolation: isolate;
					}
	
					.chart-shell::before {
						content: "";
						position: absolute;
						inset: 0;
						pointer-events: none;
						background: radial-gradient(
							ellipse at center,
							transparent 50%,
							rgba(0, 0, 0, 0.5) 100%
						);
						z-index: 10;
					}
	
					.chart-shell::after {
						content: "";
						position: absolute;
						inset: 0;
						pointer-events: none;
						background: rgba(0, 0, 0, 0.42);
						opacity: 0;
						transition: opacity 450ms ease;
						z-index: 11;
					}
	
					/* ------------------------------------------------
						 FIXED / FULLSCREEN
						 ------------------------------------------------ */
	
					.chart-shell--fixed {
						position: fixed;
						z-index: 60;
						touch-action: none;
						overscroll-behavior: contain;
	
						/*
						 * No transform: the shell changes its real
						 * dimensions, so text and stars never distort.
						 */
						transition:
							top ${SHELL_MS}ms cubic-bezier(0.65, 0, 0.25, 1),
							left ${SHELL_MS}ms cubic-bezier(0.65, 0, 0.25, 1),
							width ${SHELL_MS}ms cubic-bezier(0.65, 0, 0.25, 1),
							height ${SHELL_MS}ms cubic-bezier(0.65, 0, 0.25, 1);
	
						will-change: top, left, width, height;
						backface-visibility: hidden;
						contain: paint;
					}
	
					.chart-shell--lifting {
						transition: none !important;
					}
	
					.chart-shell--open::after {
						opacity: 1;
					}
	
					/* ------------------------------------------------
						 WORLD / CAMERA
						 ------------------------------------------------ */
	
					.chart-world {
						position: absolute;
						inset: 0;
					}
	
					.chart-shell--fixed .chart-world {
						transition: transform ${ZOOM_MS}ms cubic-bezier(0.65, 0, 0.25, 1);
						will-change: transform;
						backface-visibility: hidden;
						transform-style: preserve-3d;
					}
	
					.chart-shell--lifting .chart-world {
						transition: none !important;
					}
	
					/* ------------------------------------------------
						 BACKGROUND
						 ------------------------------------------------ */
	
					.chart-background,
					.chart-lines {
						position: absolute;
						inset: 0;
					}
	
					.chart-background {
						overflow: hidden;
					}
	
					.chart-grid {
						position: absolute;
						inset: 0;
						opacity: 0.18;
						background-image:
							linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
							linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
						background-size: 72px 72px;
						mask-image: radial-gradient(circle at center, black, transparent 78%);
					}
	
					.chart-grid::after {
						content: "";
						position: absolute;
						inset: 0;
						background-image: radial-gradient(
							rgba(255, 255, 255, 0.42) 0.6px,
							transparent 0.8px
						);
						background-size: 47px 47px;
						opacity: 0.22;
					}
	
					/* ------------------------------------------------
						 CONNECTION LINES
						 ------------------------------------------------ */
	
					.chart-lines {
						width: 100%;
						height: 100%;
						overflow: visible;
						pointer-events: none;
					}
	
					.chart-line {
						stroke: rgba(160, 205, 255, 0.22);
						stroke-width: 0.14;
						stroke-dasharray: 0.9 1.4;
					}
	
					.chart-line-glow {
						stroke: rgba(130, 190, 255, 0.09);
						stroke-width: 0.55;
						stroke-dasharray: 0.9 1.4;
					}
	
					/* ------------------------------------------------
						 SCAN
						 ------------------------------------------------ */
	
					.chart-scan {
						position: absolute;
						inset: -20% 0;
						pointer-events: none;
						background: linear-gradient(
							to bottom,
							transparent,
							rgba(160, 205, 255, 0.045),
							transparent
						);
						animation: scan 8s linear infinite;
						will-change: transform;
					}
	
					.chart-shell--fixed .chart-scan {
						animation-play-state: paused;
					}
	
					/* ------------------------------------------------
						 DRIFT
						 ------------------------------------------------ */
	
					.chart-drift {
						position: absolute;
						width: 34vw;
						height: 34vw;
						min-width: 220px;
						min-height: 220px;
						border: 1px solid rgba(140, 200, 255, 0.035);
						border-radius: 50%;
						pointer-events: none;
					}
	
					.chart-drift--one {
						left: -10%;
						top: 12%;
						transform: rotate(-20deg) scaleX(1.8);
					}
	
					.chart-drift--two {
						right: -16%;
						bottom: -14%;
						transform: rotate(35deg) scaleX(1.6);
					}
	
					/* ------------------------------------------------
						 STARS
						 ------------------------------------------------ */
	
					.star {
						--star-size: 14px;
						position: absolute;
						z-index: 5;
						display: block;
						width: var(--star-size);
						height: var(--star-size);
						margin: 0;
						padding: 0;
						border: 0;
						background: none;
						color: inherit;
						font: inherit;
						text-align: left;
						cursor: pointer;
						appearance: none;
						-webkit-tap-highlight-color: transparent;
						transform: translate3d(-50%, -50%, 0);
					}
	
					.chart-shell--fixed .star {
						pointer-events: none;
					}
	
					.star:focus-visible {
						outline: 2px solid rgba(160, 210, 255, 0.85);
						outline-offset: 8px;
						border-radius: 50%;
					}
	
					.star--small {
						--star-size: 10px;
					}
	
					.star--medium {
						--star-size: 14px;
					}
	
					.star--large {
						--star-size: 19px;
					}
	
					.star__core {
						position: absolute;
						inset: 0;
						border-radius: 50%;
						background: #fff;
						box-shadow:
							0 0 4px rgba(255, 255, 255, 0.95),
							0 0 11px rgba(160, 210, 255, 0.8),
							0 0 26px rgba(70, 145, 255, 0.5);
					}
	
					.star__halo {
						position: absolute;
						inset: -160%;
						border-radius: 50%;
						background: radial-gradient(
							circle,
							rgba(130, 195, 255, 0.18),
							transparent 62%
						);
						opacity: 0.6;
						transition: opacity 200ms ease;
					}
	
					.star__label { position: absolute; left: 50%; bottom: calc(100% + 12px); width: max-content; max-width: min(180px, 28vw); transform: translate3d(-50%, 0, 0); transform-origin: 50% 100%; color: rgba(255, 255, 255, 0.58); text-align: center; text-shadow: 0 2px 12px rgba(0, 0, 0, 0.9); pointer-events: none; }
					.star__label span, .star__label small { display: block; }
					.star__label span { font-size: 11px; line-height: 1.2; letter-spacing: -0.01em; white-space: nowrap; }
					.star__label small { margin-top: 3px; color: rgba(165, 215, 255, 0.42); font-size: 7px; font-weight: 700; letter-spacing: 0.14em; white-space: nowrap; }
	
					@media (hover: hover) {
						.star:hover .star__halo {
							opacity: 1;
						}
	
						.star:hover .star__label {
							color: rgba(255, 255, 255, 0.92);
						}
					}
	
					/* ------------------------------------------------
						 PROJECT MODAL
						 ------------------------------------------------ */
	
					/*
					 * Default (small screens): a card centred over the
					 * zoomed star, with room left at the top for the
					 * back button.
					 */
					.chart-modal {
						position: absolute;
						z-index: 30;
						inset: 0;
						margin: auto;
						width: min(420px, calc(100% - 32px));
						height: -webkit-fit-content;
						height: fit-content;
						max-height: calc(100% - 150px);
						display: flex;
						flex-direction: column;
						box-sizing: border-box;
						overflow: hidden;
						border: 1px solid rgba(255, 255, 255, 0.14);
						border-radius: 22px;
						background: rgba(7, 11, 20, 0.8);
						-webkit-backdrop-filter: blur(18px) saturate(1.2);
						backdrop-filter: blur(18px) saturate(1.2);
						box-shadow:
							0 30px 80px rgba(0, 0, 0, 0.6),
							inset 0 1px 0 rgba(255, 255, 255, 0.06);
						opacity: 0;
						visibility: hidden;
						pointer-events: none;
						transform: translate3d(0, 14px, 0);
						transition:
							opacity ${MODAL_MS}ms ease,
							transform ${MODAL_MS}ms cubic-bezier(0.22, 1, 0.36, 1),
							visibility 0s linear ${MODAL_MS}ms;
					}
	
					/* Wide screens: the left half, star stays visible on the right. */
					.chart-modal--split {
						inset: 0 auto 0 0;
						margin: 0;
						width: 50%;
						height: 100%;
						max-height: none;
						border-width: 0 1px 0 0;
						border-radius: 0;
						background: rgba(6, 9, 17, 0.82);
						box-shadow: 30px 0 80px rgba(0, 0, 0, 0.45);
						transform: translate3d(-28px, 0, 0);
					}
	
					.chart-modal--visible {
						opacity: 1;
						visibility: visible;
						pointer-events: auto;
						transform: translate3d(0, 0, 0);
						transition:
							opacity ${MODAL_MS}ms ease,
							transform ${MODAL_MS}ms cubic-bezier(0.22, 1, 0.36, 1),
							visibility 0s linear 0s;
					}
	
					.chart-modal__scroll {
						display: flex;
						flex-direction: column;
						min-height: 0;
						flex: 0 1 auto;
						overflow-y: auto;
						overscroll-behavior: contain;
						touch-action: pan-y;
						padding: 14px;
						scrollbar-width: thin;
						scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
					}
	
					.chart-modal--split .chart-modal__scroll {
						padding: clamp(32px, 5vw, 72px);
						flex: 1 1 0;
					}
	
					.chart-modal__content {
						margin: 0;
					}
	
					.chart-modal--split .chart-modal__content {
						max-width: 560px;
						margin: auto;
					}
	
					.chart-modal__media {
						position: relative;
						aspect-ratio: 16 / 10;
						overflow: hidden;
						border: 1px solid rgba(160, 205, 255, 0.18);
						border-radius: 14px;
						background: rgba(130, 190, 255, 0.05);
						box-shadow: 0 18px 50px rgba(0, 0, 0, 0.5);
					}
	
					.chart-modal__media img {
						display: block;
						width: 100%;
						height: 100%;
						object-fit: cover;
						object-position: top center;
					}
	
					.chart-modal__placeholder {
						display: grid;
						place-items: center;
						width: 100%;
						height: 100%;
						background-image:
							linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
							linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
						background-size: 28px 28px;
						color: rgba(190, 225, 255, 0.5);
						font-size: 13px;
						letter-spacing: 0.02em;
					}
	
					.chart-modal__body {
						padding: 22px 6px 8px;
					}
	
					.chart-modal--split .chart-modal__body {
						padding: 32px 0 0;
					}
	
					.chart-modal__category {
						margin: 0 0 10px;
						color: rgba(165, 215, 255, 0.6);
						font-size: 11px;
						font-weight: 700;
						letter-spacing: 0.14em;
					}
	
					.chart-modal h3 {
						margin: 0;
						font-size: clamp(26px, 2.8vw, 42px);
						font-weight: 650;
						letter-spacing: -0.04em;
						line-height: 1.02;
					}
	
					.chart-modal__description {
						margin: 16px 0 0;
						max-width: 46ch;
						color: rgba(255, 255, 255, 0.72);
						font-size: 15px;
						line-height: 1.65;
					}
	
					.chart-modal--split .chart-modal__description {
						font-size: 16px;
					}
	
					.chart-modal__tech-block {
						margin-top: 24px;
					}
	
					.chart-modal__tech-label {
						margin: 0 0 10px;
						color: rgba(255, 255, 255, 0.45);
						font-size: 13px;
					}
	
					.chart-modal__tech {
						display: flex;
						flex-wrap: wrap;
						gap: 8px;
						margin: 0;
						padding: 0;
						list-style: none;
					}
	
					.chart-modal__tech li {
						padding: 6px 13px;
						border: 1px solid rgba(160, 205, 255, 0.22);
						border-radius: 999px;
						background: rgba(130, 190, 255, 0.07);
						color: rgba(220, 236, 255, 0.9);
						font-size: 13px;
						line-height: 1.3;
					}
	
					.chart-modal__link {
						display: inline-flex;
						align-items: center;
						gap: 8px;
						min-height: 44px;
						margin-top: 28px;
						padding: 0 20px;
						border-radius: 999px;
						background: #fff;
						color: #060912;
						font-size: 14px;
						font-weight: 600;
						text-decoration: none;
						-webkit-tap-highlight-color: transparent;
						transition:
							background 160ms ease,
							transform 160ms ease;
					}
	
					.chart-modal__link svg {
						width: 16px;
						height: 16px;
					}
	
					.chart-modal__link:hover {
						background: rgb(190, 225, 255);
						transform: translate3d(0, -1px, 0);
					}
	
					.chart-modal__link:focus-visible {
						outline: 2px solid rgba(160, 210, 255, 0.9);
						outline-offset: 3px;
					}
	
					/* ------------------------------------------------
						 BACK BUTTON
						 ------------------------------------------------ */
	
					.chart-back {
						position: absolute;
						z-index: 40;
						top: max(18px, env(safe-area-inset-top));
						left: max(18px, env(safe-area-inset-left));
						display: inline-flex;
						align-items: center;
						gap: 6px;
						min-height: 44px;
						padding: 0 18px 0 12px;
						border: 1px solid rgba(255, 255, 255, 0.42);
						border-radius: 999px;
						background: rgba(0, 0, 0, 0.45);
						color: #fff;
						font-size: 14px;
						font-weight: 600;
						cursor: pointer;
						-webkit-tap-highlight-color: transparent;
						opacity: 0;
						pointer-events: none;
						transition:
							opacity 250ms ease,
							background 160ms ease;
					}
	
					/* Split layout: the left half belongs to the modal, so the button moves right. */
					.chart-shell--split .chart-back {
						left: auto;
						right: max(18px, env(safe-area-inset-right));
					}
	
					.chart-back svg {
						width: 18px;
						height: 18px;
					}
	
					.chart-back:hover {
						background: rgba(255, 255, 255, 0.14);
					}
	
					.chart-back:focus-visible {
						outline: 2px solid rgba(255, 255, 255, 0.8);
						outline-offset: 2px;
					}
	
					.chart-shell--open .chart-back {
						opacity: 1;
						pointer-events: auto;
						transition:
							opacity 400ms ease 400ms,
							background 160ms ease;
					}
	
					/* ------------------------------------------------
						 ANIMATION
						 ------------------------------------------------ */
	
					@keyframes scan {
						from {
							transform: translate3d(0, -45%, 0);
						}
	
						to {
							transform: translate3d(0, 45%, 0);
						}
					}
	
					/* ------------------------------------------------
						 TABLET / MOBILE
						 ------------------------------------------------ */
	
					@media (max-width: 760px) {
						.projects {
							padding: 82px 14px 90px;
						}
	
						.projects__header {
							grid-template-columns: 1fr;
							gap: 14px;
							margin-bottom: 18px;
						}
	
						.projects__intro {
							max-width: 52ch;
						}
	
						.chart-wrapper {
							height: 390px;
							min-height: 390px;
						}
	
						.chart-shell {
							border-radius: 22px;
						}
	
						.chart-grid {
							background-size: 54px 54px;
						}
	
						.star__label {
							bottom: calc(100% + 9px);
							max-width: 130px;
						}
	
						.star__label span {
							font-size: 10px;
						}
	
						.star__label small {
							font-size: 6px;
						}
	
						/* ------------------------------------------------
						\t   MOBILE PROJECT MODAL
						\t   ------------------------------------------------ */
						.chart-modal {
							width: min(420px, calc(100% - 24px));
							margin: 76px auto 20px; /* clears the Back button */
							max-height: calc(100% - 96px);
							border-radius: 20px;
						}

						.chart-modal__scroll {
							padding: 10px;
							overflow-y: auto; /* was hidden */
						}
	
						.chart-modal__content {
							margin: 0;
						}
	
						.chart-modal__media {
							flex-shrink: 0;
							aspect-ratio: 16 / 9;
							border-radius: 12px;
						}
	
						.chart-modal__body {
							padding: 18px 6px 8px;
						}
	
						/*
						\t * The description gets its own small scroll area.
						\t * This prevents long descriptions from pushing the
						\t * tech stack and button far below the fold.
						\t */
						.chart-modal__description {
							max-height: 110px;
							overflow-y: auto;
							padding-right: 8px;
							margin-top: 14px;
	
							overscroll-behavior: contain;
							-webkit-overflow-scrolling: touch;
	
							scrollbar-width: thin;
							scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
						}
	
						.chart-modal__tech-block {
							margin-top: 18px;
						}
	
						.chart-modal__link {
							margin-top: 22px;
						}
	
						/* Make the scroll area feel intentional rather than ugly. */
						.chart-modal__description::-webkit-scrollbar {
							width: 4px;
						}
	
						.chart-modal__description::-webkit-scrollbar-track {
							background: transparent;
						}
	
						.chart-modal__description::-webkit-scrollbar-thumb {
							background: rgba(255, 255, 255, 0.2);
							border-radius: 999px;
						}
					}
	
					@media (max-width: 480px) {
						.chart-wrapper {
							height: 350px;
							min-height: 350px;
						}
	
						.star__label { bottom: calc(100% + 8px); max-width: 90px; }
						.star__label span { font-size: 9px; line-height: 1.15; white-space: normal; }
						.star__label small { margin-top: 2px; font-size: 5.5px; white-space: normal; }
	
						.chart-line {
							stroke-width: 0.18;
						}
	
						.chart-line-glow {
							stroke-width: 0.6;
						}
					}
	
					/* Short landscape phones: tighter card */
					@media (max-height: 520px) {
						.chart-modal:not(.chart-modal--split) {
							max-height: calc(100% - 90px);
							margin-top: 72px;
						}
					}
	
					/* ------------------------------------------------
						 REDUCED MOTION
						 ------------------------------------------------ */
	
					@media (prefers-reduced-motion: reduce) {
						.chart-scan {
							animation: none;
						}
	
						.projects__header,
						.chart-shell--fixed,
						.chart-shell--fixed .chart-world,
						.chart-back,
						.chart-modal,
						.chart-modal--visible,
						.chart-shell::after {
							transition: none !important;
						}
					}
				`}</style>
			</section>
		);
	}