"use client";

const scrollToContact = () => {
	const targetY =
		document.documentElement.scrollHeight - window.innerHeight;

	window.scrollTo({
		top: targetY,
		behavior: "smooth",
	});
};

const scrollToAbout = () => {
	document.getElementById("about")?.scrollIntoView({
		behavior: "smooth",
		block: "start",
	});
}

export default function Header() {
	return (
		<>
			<main
				style={{
					position: "relative",
					zIndex: 10,
					width: "100%",
					boxSizing: "border-box",
					pointerEvents: "none",
				}}
			>
				<section
					style={{
						minHeight: "100vh",
						width: "100%",
						boxSizing: "border-box",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						padding: "40px clamp(20px, 6vw, 80px)",
						pointerEvents: "none",
					}}
				>
					<div
						style={{
							width: "100%",
							maxWidth: "820px",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							textAlign: "center",
							pointerEvents: "auto",
						}}
					>
						<p
							style={{
								margin: "0 0 18px",
								color: "rgba(255, 255, 255, 0.72)",
								fontSize: "clamp(10px, 1.2vw, 13px)",
								fontWeight: 600,
								letterSpacing: "0.18em",
								lineHeight: 1.4,
								textTransform: "uppercase",
								textShadow: "0 2px 12px rgba(0, 0, 0, 0.9)",
							}}
						>
							Aerospace · Software · Apprenticeships
						</p>

						<h1
							style={{
								margin: 0,
								color: "#ffffff",
								fontSize: "clamp(42px, 8vw, 82px)",
								fontWeight: 700,
								lineHeight: 0.98,
								letterSpacing: "-0.045em",
								textWrap: "balance",
								textShadow:
									"0 3px 24px rgba(0, 0, 0, 0.95), 0 0 50px rgba(0, 0, 0, 0.65)",
							}}
						>
							Shashish Panda
						</h1>

						<p
							style={{
								maxWidth: "54ch",
								margin: "24px 0 0",
								color: "rgba(255, 255, 255, 0.84)",
								fontSize: "clamp(15px, 1.7vw, 19px)",
								lineHeight: 1.6,
								textWrap: "balance",
								textShadow:
									"0 2px 16px rgba(0, 0, 0, 1), 0 0 32px rgba(0, 0, 0, 0.85)",
							}}
						>
							Student engineer building useful software and exploring the
							fields of aerospace, mathematics and physics.
						</p>

						<div
							style={{
								display: "flex",
								flexWrap: "wrap",
								justifyContent: "center",
								gap: "12px",
								marginTop: "32px",
							}}
						>
							<button
								type="button"
								style={{
									minWidth: "145px",
									minHeight: "48px",
									padding: "12px 24px",
									border: "1px solid #ffffff",
									borderRadius: "999px",
									background: "#ffffff",
									color: "#050505",
									fontSize: "14px",
									fontWeight: 600,
									cursor: "pointer",
									boxShadow: "0 8px 30px rgba(0, 0, 0, 0.35)",
									transition:
										"transform 160ms ease, background 160ms ease",
								}}
								onClick={scrollToAbout}
							>
								Learn More →
							</button>

							<button
								type="button"
								style={{
									minWidth: "145px",
									minHeight: "48px",
									padding: "12px 24px",
									border: "1px solid rgba(255, 255, 255, 0.42)",
									borderRadius: "999px",
									background: "rgba(0, 0, 0, 0.45)",
									color: "#ffffff",
									fontSize: "14px",
									fontWeight: 600,
									cursor: "pointer",
									backdropFilter: "blur(8px)",
									WebkitBackdropFilter: "blur(8px)",
									transition:
										"transform 160ms ease, background 160ms ease",
								}}
								onClick={scrollToContact}
							>
								Contact
							</button>
						</div>
					</div>
				</section>
			</main>

			<style jsx>{`
        @media (max-width: 768px) {
          section {
            min-height: 100svh !important;
            padding: 32px 18px !important;
          }

          section > div {
            max-width: 620px !important;
          }

          h1 {
            font-size: clamp(40px, 13vw, 64px) !important;
          }

          section > div > p:nth-child(2) {
            margin-top: 18px !important;
            max-width: 38ch !important;
            font-size: 15px !important;
            line-height: 1.55 !important;
          }

          section > div > div {
            width: 100%;
            max-width: 400px;
            margin-top: 26px !important;
          }

          button {
            min-height: 46px !important;
            flex: 1 1 150px;
          }
        }

        @media (max-width: 420px) {
          section > div > div {
            flex-direction: column;
            align-items: stretch;
          }

          button {
            width: 100%;
            flex: none;
          }
        }
      `}</style>
		</>
	);
}