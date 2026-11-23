import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Item } from "@/data/lesson";
import { Bar, Btn, Chip, EmojiTile, Stars } from "@/components/ui";
import { cn } from "@/utils/cn";
import type { ExerciseResult } from "@/lib/progress";

interface ItemState {
  chosen?: string;
  wrong: string[];
  attempts: number;
  status: "idle" | "wrong" | "solved" | "revealed";
  text: string;
  hint: boolean;
}

const blank: ItemState = { wrong: [], attempts: 0, status: "idle", text: "", hint: false };

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

/** Splits a sentence so that the ___ gap becomes a styled slot. */
function withSlot(prompt: string, filled?: string) {
  const parts = prompt.split("___");
  if (parts.length === 1) return <>{prompt}</>;
  return (
    <>
      {parts[0]}
      <span className="gap-slot">{filled ?? "\u00A0\u00A0\u00A0"}</span>
      {parts.slice(1).join("")}
    </>
  );
}

export function Exercise({
  items,
  onResult,
  onNext,
  nextLabel,
  boss = false,
  practice = false,
  savedDone = false,
}: {
  items: Item[];
  onResult: (r: ExerciseResult) => void;
  onNext?: () => void;
  nextLabel?: string;
  boss?: boolean;
  practice?: boolean;
  savedDone?: boolean;
}) {
  const [states, setStates] = useState<Record<string, ItemState>>(() => {
    const init: Record<string, ItemState> = {};
    items.forEach((i) => (init[i.id] = { ...blank }));
    return init;
  });
  const [idx, setIdx] = useState(0);
  const [touched, setTouched] = useState(false);
  const lastReported = useRef<string>("");

  const st = (id: string): ItemState => states[id] ?? blank;

  const update = useCallback((id: string, patch: Partial<ItemState>) => {
    setTouched(true);
    setStates((prev) => ({ ...prev, [id]: { ...(prev[id] ?? blank), ...patch } }));
  }, []);

  const stats = useMemo(() => {
    const solved = items.filter((i) => {
      const s = st(i.id).status;
      return s === "solved" || s === "revealed";
    }).length;
    const firstTry = items.filter((i) => st(i.id).status === "solved" && st(i.id).attempts === 0).length;
    const attempts = items.reduce((s, i) => s + st(i.id).attempts, 0);
    const done = solved === items.length;
    return { solved, firstTry, attempts, done };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [states, items]);

  useEffect(() => {
    const key = `${stats.solved}/${stats.firstTry}/${stats.attempts}/${stats.done}`;
    if (key === lastReported.current) return;
    lastReported.current = key;
    onResult({ solved: stats.solved, total: items.length, firstTry: stats.firstTry, attempts: stats.attempts, done: stats.done });
  }, [stats, items.length, onResult]);

  const item = items[Math.min(idx, items.length - 1)];
  const s = st(item.id);
  const solvedCount = stats.solved;
  const bossHp = Math.max(0, items.length - solvedCount);

  const pick = (label: string) => {
    const opt = item.options?.find((o) => o.label === label);
    if (!opt || s.status === "solved" || s.status === "revealed") return;
    if (opt.ok) {
      update(item.id, { chosen: label, status: "solved", hint: false });
    } else {
      update(item.id, {
        wrong: [...s.wrong, label],
        attempts: s.attempts + 1,
        status: "wrong",
        hint: true,
        chosen: undefined,
      });
    }
  };

  const checkTyped = () => {
    const val = s.text;
    if (!val.trim()) return;
    const ok = (item.answers ?? []).some((a) => norm(a) === norm(val));
    if (ok) {
      update(item.id, { status: "solved", chosen: val.trim() });
    } else {
      update(item.id, { attempts: s.attempts + 1, status: "wrong", hint: true });
    }
  };

  const reveal = () => {
    const answer =
      item.kind === "type" ? (item.answers ?? ["—"])[0] : (item.options?.find((o) => o.ok)?.label ?? "—");
    update(item.id, { status: "revealed", chosen: answer, text: item.kind === "type" ? answer : s.text });
  };

  const canReveal = practice ? s.attempts >= 1 : s.attempts >= 2;

  /* ---------- finished state ---------- */
  if (stats.done || (savedDone && !touched)) {
    const acc = stats.solved ? Math.round((stats.firstTry / stats.solved) * 100) : 0;
    const starCount = acc >= 90 ? 3 : acc >= 65 ? 2 : 1;
    return (
      <div className="stone animate-pop rounded-3xl p-6 text-center sm:p-9">
        <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full border border-solved/40 bg-solved/15 text-4xl">
          {boss ? "🗝️" : "✅"}
        </div>
        <h3 className="font-display text-2xl font-bold text-parch-50 sm:text-3xl">
          {boss ? "The vault is open!" : "Inventory restored!"}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-parch-200/80">
          {boss
            ? "The Empty Case Thief gives up — the last labels are back on the display cases."
            : "Every label has its correct verb again. Well done, detective."}
        </p>
        <div className="mx-auto mt-6 grid max-w-sm grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl border border-bronze-400/20 bg-black/25 p-3">
            <p className="font-display text-2xl font-bold text-lantern-300">
              {stats.solved}/{items.length}
            </p>
            <p className="tape mt-1 text-[10px] text-parch-200/60 uppercase">clues</p>
          </div>
          <div className="rounded-2xl border border-bronze-400/20 bg-black/25 p-3">
            <p className="font-display text-2xl font-bold text-lantern-300">{acc}%</p>
            <p className="tape mt-1 text-[10px] text-parch-200/60 uppercase">first try</p>
          </div>
          <div className="rounded-2xl border border-bronze-400/20 bg-black/25 p-3">
            <p className="font-display text-2xl font-bold text-lantern-300">
              <Stars count={starCount} />
            </p>
            <p className="tape mt-1 text-[10px] text-parch-200/60 uppercase">stars</p>
          </div>
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {onNext && (
            <Btn onClick={onNext} size="lg">
              {nextLabel ?? "Continue the case →"}
            </Btn>
          )}
          <Btn
            variant="ghost"
            onClick={() => {
              setTouched(true);
              setStates(Object.fromEntries(items.map((i) => [i.id, { ...blank }])));
              setIdx(0);
            }}
          >
            ↻ Practice again
          </Btn>
        </div>
      </div>
    );
  }

  /* ---------- active card ---------- */
  return (
    <div className="space-y-4">
      {/* progress header */}
      <div className="stone rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="tape text-xs text-bronze-300 uppercase">
              Clue {idx + 1} / {items.length}
            </span>
            <Chip tone={solvedCount ? "green" : "dim"}>restored {solvedCount}</Chip>
          </div>
          {boss ? (
            <div className="flex items-center gap-2">
              <span className="tape text-[10px] text-wrong uppercase">Empty Case Thief</span>
              <div className="flex gap-1">
                {items.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-2.5 w-2.5 rounded-full border transition-all",
                      i < bossHp ? "border-wrong/60 bg-wrong/70" : "border-solved/50 bg-solved/60",
                    )}
                  />
                ))}
              </div>
            </div>
          ) : (
            <Bar value={(solvedCount / items.length) * 100} className="max-w-[9rem]" />
          )}
        </div>

        {/* review strip */}
        <div className="step-scroll mt-4 flex gap-2 overflow-x-auto pb-1">
          {items.map((it, i) => {
            const ist = st(it.id);
            const done = ist.status === "solved" || ist.status === "revealed";
            return (
              <button
                key={it.id}
                onClick={() => setIdx(i)}
                aria-label={`Go to clue ${i + 1}`}
                className={cn(
                  "focus-ring tape grid h-8 w-8 shrink-0 place-items-center rounded-lg border text-[11px] transition-all",
                  i === idx
                    ? "border-lantern-400 bg-lantern-400/25 text-lantern-300"
                    : done
                      ? "border-solved/40 bg-solved/15 text-solved hover:bg-solved/25"
                      : "border-white/10 bg-black/25 text-parch-200/55 hover:border-bronze-400/40 hover:text-parch-100",
                )}
              >
                {done ? "✓" : i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* card */}
      <div key={item.id} className={cn("stone rounded-3xl p-5 sm:p-7", s.status === "wrong" && "animate-shake")}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex items-center gap-3 sm:flex-col sm:gap-2">
            <EmojiTile emoji={item.emoji} label={item.kind === "two" ? "photo" : "label"} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone="dim">{item.photoLabel ?? item.label ?? "evidence"}</Chip>
              {item.kind === "type" && <Chip tone="blue">type the verb</Chip>}
              {item.kind === "mc" && <Chip tone="blue">choose 1</Chip>}
            </div>

            <p className="font-display mt-3 text-xl leading-relaxed font-semibold text-parch-50 sm:text-[1.7rem]">
              {item.prompt ? withSlot(item.prompt, s.chosen) : (item.ru ?? "Choose the correct label.")}
            </p>

            {item.ru && item.prompt && (
              <p className="mt-2 text-[13px] text-parch-200/55">
                <span className="tape text-[10px] tracking-wider uppercase">ru support · </span>
                {item.ru}
              </p>
            )}
            {!item.prompt && (
              <p className="mt-2 text-[13.5px] text-parch-200/70">
                <span className="tape text-[10px] tracking-wider uppercase">task · </span>
                Pick the correct label with <b className="text-lantern-300">there was</b>.
              </p>
            )}

            {/* options */}
            {item.kind !== "type" && (
              <div
                className={cn(
                  "mt-5 grid gap-2.5",
                  (item.options ?? []).every((o) => o.label.length <= 12) ? "sm:grid-cols-2" : "grid-cols-1",
                )}
              >
                {(item.options ?? []).map((o) => {
                  const isWrong = s.wrong.includes(o.label);
                  const isChosen = s.chosen === o.label && (s.status === "solved" || s.status === "revealed");
                  return (
                    <button
                      key={o.label}
                      onClick={() => pick(o.label)}
                      disabled={isWrong || s.status === "solved" || s.status === "revealed"}
                      className={cn(
                        "answer-chip focus-ring group relative overflow-hidden rounded-2xl border px-4 py-3.5 text-left text-[15px] font-bold",
                        isChosen
                          ? "border-solved/60 bg-solved/15 text-parch-50"
                          : isWrong
                            ? "border-wrong/35 bg-wrong/8 text-parch-200/40 line-through"
                            : "border-bronze-400/25 bg-black/25 text-parch-100 hover:border-lantern-400/70 hover:bg-lantern-400/10",
                      )}
                    >
                      <span className="relative z-10">{o.label}</span>
                      {isChosen && <span className="relative z-10 ml-2">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* typed answer */}
            {item.kind === "type" && (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <input
                  value={s.text}
                  onChange={(e) => update(item.id, { text: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") checkTyped();
                  }}
                  disabled={s.status === "solved" || s.status === "revealed"}
                  placeholder="was / were / wasn’t / weren’t"
                  aria-label="Type the missing verb"
                  className={cn(
                    "focus-ring tape min-w-0 flex-1 rounded-2xl border bg-black/35 px-4 py-3 text-[15px] text-parch-50 placeholder:text-parch-200/30",
                    s.status === "solved"
                      ? "border-solved/60"
                      : s.status === "wrong"
                        ? "border-wrong/60"
                        : "border-bronze-400/30 focus:border-lantern-400",
                  )}
                />
                <Btn variant="ghost" onClick={checkTyped} disabled={s.status === "solved" || s.status === "revealed"}>
                  Check
                </Btn>
              </div>
            )}

            {/* feedback */}
            <div className="mt-4 min-h-[2.5rem]">
              {s.status === "solved" && (
                <div className="animate-pop rounded-2xl border border-solved/35 bg-solved/10 px-4 py-3 text-[14px] text-parch-100">
                  <b className="text-solved">Clue restored!</b> {item.note ?? ""}
                </div>
              )}
              {s.status === "revealed" && (
                <div className="animate-pop rounded-2xl border border-clue/35 bg-clue/10 px-4 py-3 text-[14px] text-parch-100">
                  <b className="text-clue">Detective note:</b> {item.note ?? ""} Keep it in your journal.
                </div>
              )}
              {s.status === "wrong" && (
                <div className="animate-pop rounded-2xl border border-wrong/35 bg-wrong/10 px-4 py-3 text-[14px] text-parch-100">
                  <b className="text-wrong">Not on the label yet.</b> Try once more — one wrong turn is normal
                  detective work.
                </div>
              )}
              {s.hint && s.status !== "solved" && item.hint && (
                <p className="mt-2 text-[13px] text-lantern-300/90">
                  💡 Hint: {item.hint}
                </p>
              )}
              {s.hint && s.status !== "solved" && item.kind === "type" && !item.hint && (
                <p className="mt-2 text-[13px] text-lantern-300/90">
                  💡 Hint: count the noun — one thing or many things?
                </p>
              )}
              {canReveal && s.status !== "solved" && s.status !== "revealed" && (
                <button
                  onClick={reveal}
                  className="focus-ring quiet tape mt-3 text-[11px] uppercase text-parch-200/60 hover:text-parch-100"
                >
                  show the answer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* nav */}
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/8 pt-4">
          <Btn variant="quiet" onClick={() => setIdx((v) => Math.max(0, v - 1))} disabled={idx === 0}>
            ← Previous
          </Btn>
          {idx === items.length - 1 ? (
            <span className="tape text-[10px] text-parch-200/45 uppercase">last clue of this mission</span>
          ) : (
            <Btn variant="ghost" onClick={() => setIdx((v) => Math.min(items.length - 1, v + 1))}>
              Next clue →
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}
