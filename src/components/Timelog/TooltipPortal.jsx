// TooltipPortal.jsx
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function TooltipPortal({
  trigger,            // element to render (icon or button)
  children,           // tooltip content
  maxWidth = 720,     // like your .tooltipWide
  onOpenChange,       // optional
  darkMode = false,
}) {
  const wrapRef = useRef(null);
  const tipRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const close = () => setOpen(false);
  const openTip = () => setOpen(true);

  // Position tooltip under trigger and clamp to viewport
  const position = () => {
    const el = wrapRef.current;
    const tip = tipRef.current;
    if (!el || !tip) return;

    const r = el.getBoundingClientRect();
    const tipWidth = Math.min(maxWidth, Math.max(280, window.innerWidth * 0.95));
    const center = r.left + r.width / 2;
    let left = center - tipWidth / 2;

    // clamp horizontally with 16px gutter
    left = Math.max(16, Math.min(left, window.innerWidth - tipWidth - 16));
    const top = r.bottom + 8; // 8px gap

    setPos({ top: Math.round(top + window.scrollY), left: Math.round(left + window.scrollX), width: tipWidth });
  };

  useEffect(() => { if (open) { position(); setTimeout(() => tipRef.current?.focus(), 0); }}, [open]);
  useEffect(() => {
    if (!open) return;
    const onScroll = () => position();
    const onResize = () => position();
    const onKey = (e) => { if (e.key === "Escape") close(); };
    const onDocClick = (e) => {
      if (!wrapRef.current?.contains(e.target) && !tipRef.current?.contains(e.target)) close();
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDocClick);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDocClick);
    };
  }, [open]);

  useEffect(() => { onOpenChange?.(open); }, [open, onOpenChange]);

  const theme = darkMode
    ? {
        bg: "#2d3748",
        fg: "#ffffff",
        border: "#1f2937",
        shadow: "0 10px 30px rgba(0,0,0,.45)",
        link: "#93c5fd",
      }
    : {
        bg: "#ffffff",
        fg: "#111827",
        border: "#e5e7eb",
        shadow: "0 10px 30px rgba(0,0,0,.15)",
        link: "#1d4ed8",
      };

  return (
    <>
    <button
        type="button"
        ref={wrapRef}
        className="inline-flex items-center gap-1 bg-transparent border-0 p-0 m-0"
        onMouseEnter={openTip}
        onFocus={openTip}
        onMouseLeave={close}
        onBlur={close}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="More info"
      >
        {trigger}
      </button>

      {open &&
        createPortal(
          <div
            tabIndex={-1}
            ref={tipRef}
            role="dialog"
            aria-modal="false"
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              maxHeight: "calc(100vh - 140px)",
              overflowY: "auto",
              overflowX: "hidden",
              background: theme.bg,             // <-- theme-aware
              color: theme.fg,                  // <-- theme-aware
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadow,          // <-- lighter in light mode
              borderRadius: 8,
              padding: 16,
              zIndex: 3000,
            }}
            // onKeyDown={(e) => {                           // provide keyboard path
            //   if (e.key === "Escape") {
            //     e.stopPropagation();
            //     close();
            //   } else {
            //     // prevent bubbling into page shortcuts
            //     e.stopPropagation();
            //   }
            // }}
          >
            <style>{`
       .tooltip-portal, .tooltip-portal * {
         color: ${theme.fg} !important;
         -webkit-text-fill-color: ${theme.fg} !important;
       }
       .tooltip-portal a {
         color: ${theme.link} !important;
       }
     `}</style>
     <div className="tooltip-portal">
       {children}
     </div>
          </div>,
          document.body
        )}
    </>
  );
}
