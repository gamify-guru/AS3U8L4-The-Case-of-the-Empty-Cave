import { useEffect } from "react";
import { RULE_CARDS } from "@/data/lesson";
import { Chip } from "@/components/ui";
import { cn } from "@/utils/cn";

export function RulesDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-opacity duration-300",
        open ? "opacity-100" : "pointer-events-none invisible opacity-0",
      )}
      aria-hidden={!open}
    >
      <button
        aria-label="Close detective notes"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/70 backdrop-blur-sm"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Detective notes — grammar cards"
        className={cn(
          "paper absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-[28px] border-t-4 border-bronze-500/70 sm:inset-y-0 sm:right-0 sm:left-auto sm:top-0 sm:max-h-none sm:w-[min(30rem,92vw)] sm:rounded-none sm:rounded-l-[28px] sm:border-t-0 sm:border-l-4",
          "transition-transform duration-400 ease-out",
          open ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full",
        )}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-ink-900/12 bg-parch-100/95 px-5 pt-5 pb-4 backdrop-blur sm:px-7">
          <div>
            <Chip tone="dim">Detective Notes</Chip>
            <h2 className="font-display mt-2 text-2xl leading-tight font-bold text-ink-900">
              There was / There were
            </h2>
            <p className="tape mt-1 text-[11px] text-ink-500 uppercase">
              Case 8-4 · The Empty Cave · keep this open any time
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close notes"
            className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink-900/20 text-ink-700 transition hover:rotate-90 hover:border-ink-900/50 hover:bg-ink-900/5"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 px-5 pt-5 pb-10 sm:px-7">
          {RULE_CARDS.map((card, i) => (
            <article
              key={card.id}
              className="rounded-2xl border border-ink-900/12 bg-white/45 p-4 shadow-[0_2px_0_rgba(74,57,42,0.06)] transition hover:-translate-y-0.5 hover:bg-white/70"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-ink-900">{card.title}</h3>
                <span className="tape text-[10px] text-ink-500 uppercase">Card {i + 1}</span>
              </div>
              <p className="tape mt-2 rounded-lg border border-dashed border-ink-900/25 bg-ink-900/4 px-3 py-2 text-[12.5px] text-ink-700">
                {card.formula}
              </p>
              <ul className="mt-3 space-y-1.5 text-[13.5px] leading-snug text-ink-700">
                {card.lines.map((l) => (
                  <li key={l} className="flex gap-2">
                    <span className="text-bronze-600">▸</span>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
              <ul className="mt-3 grid gap-2">
                {card.examples.map((ex) => (
                  <li
                    key={ex.text}
                    className="flex items-start gap-2 rounded-xl bg-parch-50/80 px-3 py-2 text-[13.5px] font-semibold text-ink-900"
                  >
                    {ex.emoji && <span className="text-base leading-none">{ex.emoji}</span>}
                    <span className={cn(ex.text.startsWith("❌") && "font-normal text-ink-700")}>{ex.text}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}

          <div className="rounded-2xl border border-ink-900/15 bg-ink-900/5 p-4 text-[13px] text-ink-700">
            <p className="tape mb-1 text-[11px] uppercase">Detective’s reminder</p>
            Say every sentence out loud before you write the label. If you can hear one thing — <b>there was</b>.
            If you can hear many — <b>there were</b>.
          </div>
        </div>
      </aside>
    </div>
  );
}
