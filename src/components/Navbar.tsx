"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import {
	motion,
	useMotionValue,
	useSpring,
	useTransform,
	type MotionValue,
} from "motion/react";
import { config, type IconDefinition } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faEnvelope,
	faFileArrowDown,
	faHouse,
	faLaptopCode,
	faUser,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

// Stops FontAwesome injecting its own CSS (prevents giant icons flashing in Next.js)
config.autoAddCss = false;

/* ---------- config ---------- */

const GITHUB_URL = "https://github.com/Pandalfer";

// Put your CV in /public and set the path here. Leave as null to hide the button
// until the file exists (so nobody downloads a 404).
const CV_URL: string | null = null; // e.g. "/Shashish-Panda-CV.pdf"

const BASE_SIZE = 40; // icon size at rest (px)
const MAGNIFIED_SIZE = 54; // icon size under the cursor (px)
const MAGNIFY_DISTANCE = 120; // how far from the cursor icons start growing (px)

/* ---------- actions ---------- */

const scrollToTop = () =>
	window.scrollTo({ top: 0, behavior: "smooth" });

const scrollToAbout = () =>
	document
		.getElementById("about")
		?.scrollIntoView({ behavior: "smooth", block: "start" });

const scrollToProjects = () =>
	document
		.getElementById("projects")
		?.scrollIntoView({ behavior: "smooth", block: "start" });

// Same logic as the hero's Contact button: the contact overlay appears at the very bottom.
const scrollToContact = () =>
	window.scrollTo({
		top: document.documentElement.scrollHeight - window.innerHeight,
		behavior: "smooth",
	});

/* ---------- items ---------- */

type Item =
	| { kind: "button"; label: string; icon: IconDefinition; onClick: () => void }
	| {
	kind: "link";
	label: string;
	icon: IconDefinition;
	href: string;
	external?: boolean;
	download?: boolean;
};

const GROUPS: Item[][] = [
	[
		{ kind: "button", label: "Home", icon: faHouse, onClick: scrollToTop },
		{ kind: "button", label: "About", icon: faUser, onClick: scrollToAbout },
		{
			kind: "button",
			label: "Projects",
			icon: faLaptopCode,
			onClick: scrollToProjects,
		},
		{
			kind: "button",
			label: "Contact",
			icon: faEnvelope,
			onClick: scrollToContact,
		},
	],
	[
		{
			kind: "link",
			label: "GitHub",
			icon: faGithub,
			href: GITHUB_URL,
			external: true,
		},
		...(CV_URL
			? ([
				{
					kind: "link",
					label: "Download CV",
					icon: faFileArrowDown,
					href: CV_URL,
					download: true,
				},
			] as Item[])
			: []),
	],
];

/* ---------- dock ---------- */

const ITEM_CLASS =
	"flex h-full w-full cursor-pointer items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70";

function DockItem({
	                  item,
	                  mouseX,
                  }: {
	item: Item;
	mouseX: MotionValue<number>;
}) {
	const ref = useRef<HTMLDivElement>(null);

	// Horizontal distance from the cursor to the centre of this icon
	const distance = useTransform(mouseX, (x) => {
		const rect = ref.current?.getBoundingClientRect();
		return rect ? x - (rect.left + rect.width / 2) : Infinity;
	});

	const target = useTransform(
		distance,
		[-MAGNIFY_DISTANCE, 0, MAGNIFY_DISTANCE],
		[BASE_SIZE, MAGNIFIED_SIZE, BASE_SIZE]
	);

	const size = useSpring(target, { mass: 0.1, stiffness: 150, damping: 12 });

	const icon = <FontAwesomeIcon icon={item.icon} className="size-4" />;

	return (
		<motion.div
			ref={ref}
			style={{ width: size, height: size }}
			className="group relative flex shrink-0 items-center justify-center p-1"
		>
			{item.kind === "button" ? (
				<button
					type="button"
					onClick={item.onClick}
					aria-label={item.label}
					className={ITEM_CLASS}
				>
					{icon}
				</button>
			) : (
				<a
					href={item.href}
					aria-label={item.label}
					className={ITEM_CLASS}
					{...(item.external
						? { target: "_blank", rel: "noopener noreferrer" }
						: {})}
					{...(item.download ? { download: true } : {})}
				>
					{icon}
				</a>
			)}

			<span
				role="tooltip"
				className="pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#161616] px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-has-[:focus-visible]:opacity-100"
			>
				{item.label}
			</span>
		</motion.div>
	);
}

export default function Navbar() {
	// Cursor x position. Infinity = cursor is not over the dock.
	const mouseX = useMotionValue(Infinity);

	const [projectOpen, setProjectOpen] = useState(false);

	useEffect(() => {
		const handleProjectOpen = () => setProjectOpen(true);
		const handleProjectClose = () => setProjectOpen(false);

		window.addEventListener("project-open", handleProjectOpen);
		window.addEventListener("project-close", handleProjectClose);

		return () => {
			window.removeEventListener("project-open", handleProjectOpen);
			window.removeEventListener("project-close", handleProjectClose);
		};
	}, []);

	return (
		<div
			data-no-blackhole
			className={`pointer-events-none fixed inset-x-0 z-[55] flex justify-center transition-opacity duration-300 ${
				projectOpen ? "opacity-0 invisible" : "opacity-100 visible"
			}`}
			style={{bottom: "max(24px, env(safe-area-inset-bottom))"}}
			aria-hidden={projectOpen}
		>
			<motion.nav
				aria-label="Primary"
				onPointerMove={(e) => {
					// Magnify only for real mice, not touch
					if (e.pointerType === "mouse") mouseX.set(e.clientX);
				}}
				onPointerLeave={() => mouseX.set(Infinity)}
				className="pointer-events-auto flex h-[68px] items-center gap-1.5 rounded-2xl border border-white/10 bg-[rgba(14,14,14,0.84)] p-2 backdrop-blur-[14px] sm:gap-2"
			>
				{GROUPS.map((group, i) => (
					<Fragment key={i}>
						{i > 0 && (
							<span
								aria-hidden="true"
								className="mx-1 h-6 w-px shrink-0 bg-white/15"
							/>
						)}
						{group.map((item) => (
							<DockItem key={item.label} item={item} mouseX={mouseX}/>
						))}
					</Fragment>
				))}
			</motion.nav>
		</div>
	);
}