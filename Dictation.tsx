import { useEffect, useMemo, useRef, useState } from "react";
import { DICTATION_WORDS, SPEECH_TIP, type DictWord } from "@/data/lesson";
import { Bar, Btn, Chip, EmojiTile } from "@/components/ui";
import { cn } from "@/utils/cn";
import type { ExerciseResult } from "@/lib/progress";
import type { ProgressState } from "@/lib/progress";

type Status = "" | "wrong" | "solved" | "retry" | "revealed";

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

/** deterministic shuffle so the picture options never jump around */
function seededShuffle<T>(seed: number, arr: T[]): T[] {
  const a = [...arr];
  let x = (seed * 9301 + 49297) % 233280;
  for (let i = a.length - 1; i > 0; i--) {
    x = (x * 9301 + 49297) % 233280;
    const j = Math.floor((x / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function optionsFor(seed: number, target: DictWord, all: DictWord[]): DictWord[] {
  const others = seededShuffle(seed + 7, all.filter((w) => w.id !== target.id)).slice(0, 3);
  return seededShuffle(seed + 13, [target, ...others]);
}

export function Dictation({
  progress,
  patch,
  onResult,
}: {
  progress: ProgressState;
  patch: (next: Partial<ProgressState>) => void;
  onResult: (r: ExerciseResult) => void;
}) {
  const [mode, setMode] = useState<"write" | "pick">("write");
  const [idx, setIdx] = useState(() => {
    const firstUnsolved = DICTATION_WORDS.findIndex((w) => !progress.dictStatus[w.id]);
    return firstUnsolved === -1 ? 0 : firstUnsolved;
  });
  const [text, setText] = useState("");
  const [wrongPicks, setWrongPicks] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [noVoice, setNoVoice] = useState(false);
  const timer = useRef<number | null>(null);
  const lastReported = useRef<string>("");

  const statusMap = progress.dictStatus;
  const word = DICTATION_WORDS[idx];
  const status: Status = (statusMap[word.id] as Status) ?? "";
  const options = useMemo(() => optionsFor(idx, word, DICTATION_WORDS), [idx, word]);

  useEffect(() => {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!synth) return;
    const check = () => {
      if (!synth.getVoices().length) return;
    };
    synth.addEventListener?.("voiceschanged", check);
    return () => synth.removeEventListener?.("voiceschanged", check);
  }, []);

  useEffect(() => {
    const solved = DICTATION_WORDS.filter((w) => {
      const s = statusMap[w.id];
      return s === "solved" || s === "retry" || s === "revealed";
    }).length;
    const firstTry = DICTATION_WORDS.filter((w) => statusMap[w.id] === "solved").length;
    const attemptSum = DICTATION_WORDS.reduce((sum, w) => {
      const s = statusMap[w.id];
      if (s === "solved" || s === "retry") return sum + 1;
      return sum;
    }, 0);
    const key = `${solved}/${firstTry}/${attemptSum}`;
    if (key === lastReported.current) return;
    lastReported.current = key;
    onResult({ solved, total: DICTATION_WORDS.length, firstTry, attempts: attemptSum, done: solved === DICTATION_WORDS.length });
  }, [statusMap, onResult]);

  const speak = (value: string, rate = 0.82) => {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!synth) {
      setNoVoice(true);
      return;
    }
    try {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(value);
      u.lang = "en-GB";
      u.rate = rate;
      u.pitch = 1.05;
      const voices = synth.getVoices();
      const v =
        voices.find((x) => /en-(GB|US|AU)/i.test(x.lang)) ?? voices.find((x) => /^en/i.test(x.lang));
      if (v) u.voice = v;
      u.onend = () => setSpeaking(false);
      u.onerror = () => {
        setSpeaking(false);
        setNoVoice(true);
      };
      setSpeaking(true);
      synth.speak(u);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setSpeaking(false), Math.max(1800, value.length * 190));
    } catch {
      setNoVoice(true);
    }
  };

  const solvedCount = DICTATION_WORDS.filter((w) => {
    const s = statusMap[w.id];
    return s === "solved" || s === "retry" || s === "revealed";
  }).length;
  const done = solvedCount === DICTATION_WORDS.length;

  const save = (next: Status) => {
    patch({ dictStatus: { ...statusMap, [word.id]: next }, dictText: { ...progress.dictText, [word.id]: text } });
  };

  const goTo = (i: number) => {
    setIdx(i);
    setText(progress.dictText[DICTATION_WORDS[i].id] ?? "");
    setWrongPicks([]);
    setAttempts(0);
    setHint(false);
  };

  if (done) {
    const firstTry = DICTATION_WORDS.filter((w) => statusMap[w.id] === "solved").length;
    const acc = Math.round((firstTry / DICTATION_WORDS.length) * 100);
    return (
      <div className="space-y-5">
        <div className="stone animate-pop rounded-3xl p-6 text-center sm:p-9">
          <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full border border-solved/40 bg-solved/15 text-4xl">
            🎧
          </div>
          <h3 className="font-display text-2xl font-bold text-parch-50 sm:text-3xl">All records decoded!</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-parch-200/80">
            The archaeologist’s tape is clear again — 10 words from Unit 8 Lesson 1 are back in your journal.
          </p>
          <div className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3">
            <div className="rounded-2xl border border-bronze-400/20 bg-black/25 p-3">
              <p className="font-display text-2xl font-bold text-lantern-300">{firstTry}/10</p>
              <p className="tape mt-1 text-[10px] text-parch-200/60 uppercase">first try</p>
            </div>
            <div className="rounded-2xl border border-bronze-400/20 bg-black/25 p-3">
              <p className="font-display text-2xl font-bold text-lantern-300">{acc}%</p>
              <p className="tape mt-1 text-[10px] text-parch-200/60 uppercase">accuracy</p>
            </div>
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Btn
              variant="ghost"
              onClick={() => {
                patch({ dictStatus: {}, dictText: {} });
                goTo(0);
              }}
            >
              ↻ Listen again
            </Btn>
          </div>
        </div>
        <WordList statusMap={statusMap} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="stone rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="tape text-xs text-bronze-300 uppercase">
            Record {idx + 1} / {DICTATION_WORDS.length}
          </span>
          <div className="flex rounded-full border border-bronze-400/25 bg-black/30 p-1">
            {(["write", "pick"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "focus-ring tape rounded-full px-3 py-1.5 text-[11px] uppercase transition",
                  mode === m ? "bg-lantern-400 text-ink-900" : "text-parch-200/70 hover:text-parch-50",
                )}
              >
                {m === "write" ? "🎧 write it" : "🖼️ pick the picture"}
              </button>
            ))}
          </div>
        </div>
        <Bar value={(solvedCount / DICTATION_WORDS.length) * 100} className="mt-4" />
        <p className="tape mt-2 text-[11px] text-parch-200/55">decoded records: {solvedCount}/10</p>
      </div>

      {/* tape recorder */}
      <div className="stone relative overflow-hidden rounded-3xl p-5 sm:p-7">
        <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-lantern-400/10 blur-3xl animate-flicker" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <button
            onClick={() => speak(word.word)}
            aria-label={`Play the word ${word.word}`}
            className="focus-ring group grid h-24 w-24 shrink-0 place-items-center rounded-full border border-lantern-400/50 bg-gradient-to-b from-lantern-400/25 to-black/40 text-4xl transition hover:scale-105 hover:border-lantern-300"
          >
            <span className="drop-shadow-[0_0_18px_rgba(255,187,87,0.55)]">🔊</span>
            <span className="absolute inset-0 rounded-full border border-lantern-400/30 animate-pulse" />
          </button>
          <div className="min-w-0 flex-1">
            <Chip tone="dim">Archaeologist’s tape · record {idx + 1}</Chip>
            <p className="mt-2 text-[15px] font-semibold text-parch-50">
              Listen and {mode === "write" ? "write the word you hear" : "choose the picture you hear"}.
            </p>
            <div className="mt-3 flex h-8 items-end gap-1">
              {Array.from({ length: 22 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "w-1.5 rounded-full bg-gradient-to-t from-bronze-600 to-lantern-300",
                    speaking ? "animate-eq" : "opacity-30",
                  )}
                  style={{
                    height: `${18 + ((i * 37) % 18)}px`,
                    animationDelay: `${(i % 7) * 90}ms`,
                    animationDuration: `${700 + (i % 5) * 130}ms`,
                  }}
                />
              ))}
            </div>
            {noVoice && (
              <p className="mt-2 text-[12.5px] text-wrong/90">
                This browser has no voice. {SPEECH_TIP}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Btn size="sm" variant="ghost" onClick={() => speak(word.word, 0.55)}>
                🐢 Slow
              </Btn>
              <Btn size="sm" variant="ghost" onClick={() => speak(word.word)}>
                ↻ Repeat
              </Btn>
              <Btn size="sm" variant="quiet" onClick={() => setHint(true)}>
                💡 Syllables
              </Btn>
            </div>
          </div>
        </div>
      </div>

      {/* answer area */}
      <div className="stone rounded-3xl p-5 sm:p-7">
        {mode === "write" ? (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (norm(text) === norm(word.word)) save(attempts === 0 ? "solved" : "retry");
                    else {
                      setAttempts((a) => a + 1);
                      setHint(true);
                      save("wrong");
                    }
                  }
                }}
                disabled={status === "solved" || status === "retry" || status === "revealed"}
                placeholder="type the English word…"
                aria-label="Write the word you hear"
                className={cn(
                  "focus-ring tape min-w-0 flex-1 rounded-2xl border bg-black/35 px-4 py-3 text-[15px] text-parch-50 placeholder:text-parch-200/30",
                  status === "solved" || status === "retry"
                    ? "border-solved/60"
                    : status === "wrong"
                      ? "border-wrong/60"
                      : "border-bronze-400/30 focus:border-lantern-400",
                )}
              />
              <Btn
                variant="ghost"
                onClick={() => {
                  if (norm(text) === norm(word.word)) save(attempts === 0 ? "solved" : "retry");
                  else {
                    setAttempts((a) => a + 1);
                    setHint(true);
                    save("wrong");
                  }
                }}
                disabled={status === "solved" || status === "retry" || status === "revealed"}
              >
                Decode
              </Btn>
            </div>
            {hint && (status === "" || status === "wrong") && (
              <p className="mt-3 text-[13px] text-lantern-300/90">
                💡 Syllables: <b className="tape">{word.syllables}</b>
                {attempts >= 1 && <span> · {word.word.length} letters</span>}
              </p>
            )}
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {options.map((o) => {
              const isWrong = wrongPicks.includes(o.id);
              const isRight = o.id === word.id && (status === "solved" || status === "retry" || status === "revealed");
              return (
                <button
                  key={o.id}
                  disabled={isWrong || isRight}
                  onClick={() => {
                    if (o.id === word.id) {
                      save(attempts === 0 ? "solved" : "retry");
                    } else {
                      setWrongPicks((p) => [...p, o.id]);
                      setAttempts((a) => a + 1);
                      setHint(true);
                      save("wrong");
                    }
                  }}
                  className={cn(
                    "answer-chip focus-ring flex flex-col items-center gap-1 rounded-2xl border px-2 py-4",
                    isRight
                      ? "border-solved/60 bg-solved/15"
                      : isWrong
                        ? "border-wrong/35 bg-wrong/8 opacity-45"
                        : "border-bronze-400/25 bg-black/25 hover:border-lantern-400/70 hover:bg-lantern-400/10",
                  )}
                >
                  <EmojiTile emoji={o.emoji} size="sm" />
                </button>
              );
            })}
          </div>
        )}

        {/* result line */}
        <div className="mt-4 min-h-[3rem]">
          {status === "solved" || status === "retry" ? (
            <div className="animate-pop flex flex-wrap items-center gap-3 rounded-2xl border border-solved/35 bg-solved/10 px-4 py-3">
              <EmojiTile emoji={word.emoji} size="sm" />
              <div className="min-w-0">
                <p className="font-display text-lg font-bold text-parch-50">{word.word}</p>
                <p className="text-[12.5px] text-parch-200/70">
                  {word.ru} · <span className="tape">{word.syllables}</span> ·{" "}
                  <b className={status === "solved" ? "text-solved" : "text-lantern-300"}>
                    {status === "solved" ? "first try!" : "decoded after a retry"}
                  </b>
                </p>
              </div>
            </div>
          ) : status === "revealed" ? (
            <div className="animate-pop flex flex-wrap items-center gap-3 rounded-2xl border border-clue/35 bg-clue/10 px-4 py-3">
              <EmojiTile emoji={word.emoji} size="sm" />
              <div>
                <p className="font-display text-lg font-bold text-parch-50">{word.word}</p>
                <p className="text-[12.5px] text-parch-200/70">
                  {word.ru} — copy it into your journal three times.
                </p>
              </div>
            </div>
          ) : status === "wrong" ? (
            <p className="animate-pop rounded-2xl border border-wrong/35 bg-wrong/10 px-4 py-3 text-[14px] text-parch-100">
              <b className="text-wrong">Not decoded yet.</b> Listen once more, slowly — then try again.
            </p>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
          <Btn variant="quiet" onClick={() => goTo(Math.max(0, idx - 1))} disabled={idx === 0}>
            ← Previous record
          </Btn>
          <div className="flex flex-wrap gap-2">
            {(status === "solved" || status === "retry" || status === "revealed") && (
              <Btn size="sm" variant="ghost" onClick={() => save("revealed")}>
                I need the answer
              </Btn>
            )}
            <Btn onClick={() => goTo(Math.min(DICTATION_WORDS.length - 1, idx + 1))} disabled={idx === DICTATION_WORDS.length - 1}>
              Next record →
            </Btn>
          </div>
        </div>
      </div>

      <WordList statusMap={statusMap} />
    </div>
  );
}

function WordList({ statusMap }: { statusMap: Record<string, string> }) {
  return (
    <div className="stone rounded-3xl p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <Chip tone="dim">Archaeologist’s word list · Unit 8 Lesson 1</Chip>
        <span className="tape text-[10px] text-parch-200/50 uppercase">tap a card to hear it</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {DICTATION_WORDS.map((w) => {
          const s = statusMap[w.id];
          const ok = s === "solved" || s === "retry" || s === "revealed";
          const play = () => {
            const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
            if (!synth) return;
            const u = new SpeechSynthesisUtterance(w.word);
            u.lang = "en-GB";
            u.rate = 0.8;
            synth.speak(u);
          };
          return (
            <button
              key={w.id}
              onClick={play}
              className={cn(
                "focus-ring lift flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-center",
                ok ? "border-solved/40 bg-solved/10" : "border-white/10 bg-black/25 hover:border-bronze-400/40",
              )}
            >
              <span className="text-2xl">{w.emoji}</span>
              <span className={cn("text-[12.5px] font-bold", ok ? "text-parch-50" : "text-parch-200/60")}>
                {ok ? w.word : w.syllables.replace(/[^a-zA-Z· ]/g, "•••")}
              </span>
              <span className="tape text-[9px] text-parch-200/45 uppercase">{ok ? w.ru : "locked"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
