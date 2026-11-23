import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/utils/cn";

/* ---------------- scroll reveal ---------------- */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", inView && "is-in", className)}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

/* ---------------- buttons ---------------- */
type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "dark" | "quiet" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  title?: string;
  type?: "button" | "submit";
};

export function Btn({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className,
  disabled,
  title,
  type = "button",
}: BtnProps) {
  const sizes = {
    sm: "px-3.5 py-2 text-[13px]",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };
  const variants = {
    primary:
      "bg-gradient-to-b from-lantern-400 to-lantern-500 text-ink-900 font-extrabold shadow-[0_10px_26px_-10px_rgba(255,166,43,0.8)] hover:shadow-[0_14px_34px_-10px_rgba(255,166,43,0.95)] hover:from-lantern-300 hover:to-lantern-400",
    ghost:
      "bg-white/5 text-parch-100 border border-bronze-400/30 hover:bg-white/10 hover:border-bronze-400/60",
    dark:
      "bg-cave-800 text-parch-100 border border-bronze-400/25 hover:bg-cave-700 hover:border-bronze-400/50",
    quiet: "text-parch-200/80 hover:text-parch-50 underline decoration-dotted underline-offset-4",
    danger: "bg-wrong/15 text-wrong border border-wrong/40 hover:bg-wrong/25",
  };
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-full font-bold tracking-wide transition-all duration-200",
        "disabled:cursor-not-allowed disabled:opacity-45",
        sizes[size],
        variants[variant],
        !disabled && "hover:-translate-y-0.5 active:translate-y-0",
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ---------------- small bits ---------------- */
export function Chip({
  children,
  className,
  tone = "bronze",
}: {
  children: ReactNode;
  className?: string;
  tone?: "bronze" | "green" | "red" | "blue" | "dim";
}) {
  const tones = {
    bronze: "border-bronze-400/35 bg-bronze-400/10 text-bronze-200",
    green: "border-solved/40 bg-solved/12 text-solved",
    red: "border-wrong/40 bg-wrong/12 text-wrong",
    blue: "border-clue/40 bg-clue/12 text-clue",
    dim: "border-white/10 bg-white/5 text-parch-200/70",
  };
  return (
    <span
      className={cn(
        "tape inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Bar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-black/45", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-bronze-500 via-lantern-400 to-lantern-300 transition-[width] duration-700 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function Ring({ value, size = 54 }: { value: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="5" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 700ms ease-out" }}
      />
      <defs>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c08b4b" />
          <stop offset="100%" stopColor="#ffbb57" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Stars({ count, max = 3 }: { count: number; max?: number }) {
  return (
    <span className="text-sm tracking-tight" aria-label={`${count} of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < count ? "text-lantern-400" : "text-parch-300/25"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function EmojiTile({
  emoji,
  label,
  size = "md",
}: {
  emoji?: string;
  label?: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 flex-col items-center justify-center rounded-2xl border border-bronze-400/25 bg-gradient-to-b from-black/40 to-black/10",
        size === "md" ? "h-16 w-16 text-3xl sm:h-[4.5rem] sm:w-[4.5rem] sm:text-4xl" : "h-11 w-11 text-xl",
      )}
    >
      <span className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">{emoji ?? "📦"}</span>
      {label && (
        <span className="tape mt-0.5 text-[8px] leading-none text-bronze-300/80 uppercase">{label}</span>
      )}
      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent" />
    </div>
  );
}

export function CaseCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("stone rounded-3xl p-5 sm:p-6", className)}>{children}</div>;
}
