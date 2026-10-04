"use client";

import type { FormEvent } from "react";
import { useEffect, useState, useSyncExternalStore } from "react";

const subscribe = () => () => {};
const CONTACT = {
  email: "shashishpanda1@gmail.com",
  phoneDisplay: "+44 7742 622600",
  phoneHref: "+447742622600",
  github: "https://github.com/Pandalfer",
  linkedin: "https://www.linkedin.com/in/shashish-panda-88b05b344/",
};
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xyzpkvkz";
type ContactProps = { bottomThreshold?: number };

const iconProps = { fill: "none", stroke: "currentColor" };
function MailIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2" {...iconProps} strokeWidth="1.7"/><path d="m5 7.5 7 5.25 7-5.25" {...iconProps} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function PhoneIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 4.1 10 6.6 8.5 9.4a13.2 13.2 0 0 0 6.1 6.1l2.8-1.5 2.5 2.8c.5.6.4 1.5-.2 2l-1.7 1.3c-.6.5-1.4.6-2.1.2C9 17.4 5.6 14 2.7 7.1c-.3-.7-.2-1.5.2-2.1l1.3-1.7c.6-.6 1.4-.7 2-.2Z" {...iconProps} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function GitHubIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" {...iconProps} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function LinkedInIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" {...iconProps} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function ChatIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2Z" {...iconProps} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function SendIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Zm0 0L11 13" {...iconProps} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function CopyIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2" {...iconProps} strokeWidth="1.7"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" {...iconProps} strokeWidth="1.7" strokeLinecap="round"/></svg>;
}
function CheckIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" {...iconProps} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export default function Contact({ bottomThreshold = 3 }: ContactProps) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [visible, setVisible] = useState(false), [copied, setCopied] = useState<"email" | "phone" | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    const update = () => setVisible(document.documentElement.scrollHeight - (window.scrollY + window.innerHeight) <= bottomThreshold);
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [bottomThreshold]);

  const handleCopy = async (type: "email" | "phone") => {
    const value = type === "email" ? CONTACT.email : CONTACT.phoneDisplay;
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value);
      else {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        Object.assign(textarea.style, { position: "fixed", top: "0", left: "0", width: "1px", height: "1px", opacity: "0", pointerEvents: "none" });
        textarea.setAttribute("readonly", "");
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (!successful) throw new Error("Copy failed");
      }
      setCopied(type);
      window.setTimeout(() => setCopied(null), 1400);
    } catch {
      setCopied(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    const form = event.currentTarget;
    try {
      const response = await fetch(FORMSPREE_ENDPOINT, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!response.ok) return setStatus("error");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  if (!mounted) return null;

  const tab = visible ? 0 : -1;
  const copyClass = (type: "email" | "phone") => `copy-button${copied === type ? " copy-button--copied" : ""}`;

  return (
    <section aria-label="Contact" aria-hidden={!visible} className={`contact-overlay${visible ? " contact-overlay--visible" : ""}`}>
      <div className="contact-page">
        <header className="contact-header"><h2>Contact</h2></header>

        <div className="contact-grid">
          <div className="card card--email">
            <span className="card__icon"><MailIcon /></span>
            <span className="card__text"><strong>Email</strong><span>{CONTACT.email}</span></span>
            <button type="button" className={copyClass("email")} onClick={() => handleCopy("email")} tabIndex={tab} aria-label={copied === "email" ? "Email copied" : "Copy email address"}>{copied === "email" ? <CheckIcon /> : <CopyIcon />}</button>
          </div>

          <a className="card card--link card--linkedin" href={CONTACT.linkedin} target="_blank" rel="noopener noreferrer" tabIndex={tab}>
            <span className="card__icon"><LinkedInIcon /></span>
            <span className="card__text"><strong>LinkedIn</strong><span>Professional</span></span>
          </a>

          <div className="card card--open">
            <span className="card__icon"><ChatIcon /></span>
            <span className="card__text"><strong>Open to</strong><span>Apprenticeships &amp; collabs</span></span>
          </div>

          <div className="card card--phone">
            <a className="card__main-link" href={`tel:${CONTACT.phoneHref}`} tabIndex={tab}>
              <span className="card__icon"><PhoneIcon /></span>
              <span className="card__text"><strong>Phone</strong><span>{CONTACT.phoneDisplay}</span></span>
            </a>
            <button type="button" className={copyClass("phone")} onClick={() => handleCopy("phone")} tabIndex={tab} aria-label={copied === "phone" ? "Phone number copied" : "Copy phone number"}>{copied === "phone" ? <CheckIcon /> : <CopyIcon />}</button>
          </div>

          <a className="card card--link card--github" href={CONTACT.github} target="_blank" rel="noopener noreferrer" tabIndex={tab}>
            <span className="card__icon"><GitHubIcon /></span>
            <span className="card__text"><strong>GitHub</strong><span>@Pandalfer · Projects &amp; code</span></span>
          </a>
        </div>

        <section className="form-card" aria-label="Send a message">
          <h3>Send a Message</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label><span>Name</span><input name="name" type="text" placeholder="Your name" autoComplete="name" tabIndex={tab} required /></label>
              <label><span>Email</span><input name="email" type="email" placeholder="your@email.com" autoComplete="email" tabIndex={tab} required /></label>
            </div>
            <label><span>Message</span><textarea name="message" rows={4} placeholder="Your message..." tabIndex={tab} required /></label>
            <div className="form-footer">
              <p className={`form-status form-status--${status}`} aria-live="polite">
                {status === "submitting" && "Sending your message..."}
                {status === "success" && "Message sent successfully."}
                {status === "error" && "Something went wrong. Please try again."}
              </p>
              <button type="submit" disabled={status === "submitting"} tabIndex={tab}>
                <SendIcon />{status === "submitting" ? "Sending..." : status === "success" ? "Sent" : "Send Message"}
              </button>
            </div>
          </form>
        </section>
      </div>

      <style jsx>{`
        .contact-overlay{position:fixed;inset:0;z-index:50;overflow:hidden;box-sizing:border-box;background:#080808;color:#fff;opacity:0;visibility:hidden;pointer-events:none;transform:translateY(14px);contain:layout paint;transition:opacity 420ms ease,transform 420ms ease,visibility 0s linear 420ms}
        .contact-overlay--visible{opacity:1;visibility:visible;pointer-events:auto;transform:translateY(0);transition:opacity 420ms ease,transform 420ms ease}
        .contact-page{width:min(1120px,100%);height:100%;min-height:0;margin:0 auto;box-sizing:border-box;padding:clamp(14px,2.5vh,28px) clamp(16px,3vw,36px) 96px;display:flex;flex-direction:column;justify-content:center;gap:16px}
        .contact-header{margin-bottom:8px}.contact-header h2{margin:0;font-size:clamp(28px,3.5vw,38px);font-weight:800;line-height:1.05;letter-spacing:-.03em}.contact-header p{margin:8px 0 0;color:rgba(255,255,255,.55);font-size:16px;line-height:1.4}
        .contact-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.card--email,.card--phone,.card--github{grid-column:span 2}
        .card{min-width:0;display:flex;align-items:center;gap:14px;padding:18px 20px;box-sizing:border-box;border:1px solid rgba(255,255,255,.09);border-radius:12px;background:#161616;color:#fff;text-decoration:none;transition:border-color 160ms ease,background 160ms ease}
        .card__main-link{min-width:0;flex:1;display:flex;align-items:center;gap:14px;color:inherit;text-decoration:none}.card__main-link:hover{text-decoration:none}
        .card--link:hover,.card--link:focus-visible{border-color:rgba(255,255,255,.24);background:#1b1b1b;outline:none}
        .card__icon{width:40px;height:40px;flex:0 0 auto;display:grid;place-items:center;border-radius:10px;background:#0d0d0d;color:rgba(255,255,255,.92)}.card__icon :global(svg){width:20px;height:20px}
        .card__text{min-width:0;display:flex;flex-direction:column;gap:3px}.card__text strong{font-size:17px;font-weight:650;line-height:1.2}.card__text span{overflow:hidden;color:rgba(255,255,255,.6);font-size:13px;line-height:1.35;text-overflow:ellipsis;white-space:nowrap}
        .copy-button{width:40px;height:40px;flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;margin:0 0 0 auto;padding:0;border:1px solid rgba(255,255,255,.1);border-radius:10px;background:#0d0d0d;color:rgba(255,255,255,.72);cursor:pointer;transition:background 180ms ease,border-color 180ms ease,color 180ms ease,transform 180ms ease}
        .copy-button :global(svg){width:20px;height:20px}.copy-button:hover{background:#202020;border-color:rgba(255,255,255,.2);color:#fff}.copy-button--copied{background:rgba(70,190,120,.12);border-color:rgba(70,190,120,.3);color:#72d69a}.copy-button--copied:hover{background:rgba(70,190,120,.16);border-color:rgba(70,190,120,.4);color:#82e0a7}.copy-button:active{transform:scale(.94)}.copy-button:focus-visible{outline:2px solid rgba(255,255,255,.6);outline-offset:2px}
        .form-card{padding:26px 28px;border:1px solid rgba(255,255,255,.09);border-radius:14px;background:#161616}.form-card h3{margin:0 0 20px;font-size:21px;font-weight:650;line-height:1.2;letter-spacing:-.01em}
        form{display:grid;gap:16px}.form-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}label{min-width:0;display:grid;gap:7px}label>span{color:#fff;font-size:14px;font-weight:650}
        input,textarea{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.08);border-radius:10px;outline:none;background:#121212;color:#fff;font:inherit;font-size:15px;line-height:1.4;transition:border-color 160ms ease,box-shadow 160ms ease}
        input{height:42px;padding:0 14px}textarea{min-height:130px;padding:12px 14px;resize:vertical}input::placeholder,textarea::placeholder{color:rgba(255,255,255,.4)}input:focus,textarea:focus{border-color:rgba(255,255,255,.3);box-shadow:0 0 0 3px rgba(255,255,255,.05)}
        .form-footer{display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:42px}.form-status{display:flex;align-items:center;margin:0;color:rgba(255,255,255,.5);font-size:13px}.form-status--success{color:rgba(255,255,255,.8)}.form-status--error{color:#ff8c8c}
        .form-footer>button{height:42px;display:inline-flex;align-items:center;justify-content:center;gap:9px;margin-left:auto;padding:0 20px;border:0;border-radius:10px;background:#fff;color:#0a0a0a;font:inherit;font-size:14px;font-weight:650;cursor:pointer;transition:background 160ms ease,transform 160ms ease,opacity 160ms ease}.form-footer>button :global(svg){width:16px;height:16px}.form-footer>button:hover:not(:disabled){background:#e6e6e6}.form-footer>button:active:not(:disabled){transform:translateY(1px)}.form-footer>button:disabled{opacity:.65;cursor:not-allowed}.form-footer>button:focus-visible{outline:2px solid rgba(255,255,255,.6);outline-offset:2px}
        @media(max-width:900px){.contact-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.card--email{grid-column:span 2}.card--phone,.card--github{grid-column:span 1}}
        @media(max-width:600px){
          .contact-overlay{overflow-y:auto}.contact-page{height:auto;min-height:100%;justify-content:flex-start;gap:12px;padding-top:28px;padding-bottom:96px}.contact-header{margin-bottom:4px}.contact-grid{gap:10px}
          .card{gap:11px;padding:13px 14px}.card__main-link{gap:11px}.card__icon{width:34px;height:34px;border-radius:9px}.card__icon :global(svg){width:17px;height:17px}.card__text strong{font-size:15px}.card__text span{font-size:12px}
          .copy-button{width:36px;height:36px;border-radius:9px}.copy-button :global(svg){width:19px;height:19px}.form-card{padding:18px 16px}.form-card h3{margin-bottom:14px;font-size:19px}form,.form-row{gap:13px}.form-row{grid-template-columns:1fr}textarea{min-height:110px}
          .form-footer{flex-direction:column-reverse;align-items:stretch;gap:8px}.form-status{justify-content:center;text-align:center}.form-footer>button{width:100%;margin-left:0}
        }
        @media(max-width:420px){
          .contact-grid{grid-template-columns:1fr}.card--email,.card--phone,.card--linkedin,.card--open,.card--github{grid-column:span 1}.card--phone{order:2}.card--linkedin{order:3}.card--open{order:4}.card--github{order:5}
        }
        @media(prefers-reduced-motion:reduce){.contact-overlay,.card,input,textarea,button{transition:none}}
      `}</style>
    </section>
  );
}