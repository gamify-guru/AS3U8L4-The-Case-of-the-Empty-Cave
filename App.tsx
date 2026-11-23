import { useCallback, useEffect, useMemo, useState } from "react";
import { CAVE_COVER_SRC } from "@/assets/caveImage";
import { MISSIONS, NAV_STEPS, type Mission } from "@/data/lesson";
import { useProgress, useCaseStats, type ScreenId } from "@/lib/progress";
import { Bar, Btn, Chip, EmojiTile, Reveal, Stars } from "@/components/ui";
import { RulesDrawer } from "@/components/RulesDrawer";
import { Exercise } from "@/components/Exercise";
import { Dictation } from "@/components/Dictation";
import { Homework } from "@/components/Homework";
import { Results } from "@/components/Results";
import { cn } from "@/utils/cn";

export default function App() {
  const { state, patch, setResult, reset } = useProgress();
  const stats = useCaseStats(state);
  const [notesOpen, setNotesOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const go = useCallback(
    (id: ScreenId) => {
      patch({ screen: id });
    },
    [patch],
  );

  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setScrollPct(max > 0 ? Math.round((h.scrollTop / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.screen]);

  const nextStep = useMemo<ScreenId>(() => {
    const order: ScreenId[] = ["m1", "m2", "m3", "m4", "dictation", "homework", "results"];
    const isDone = (id: ScreenId) => {
      if (id === "dictation") return !!state.results.dictation?.done;
      if (id === "homework")
        return !!(
          state.results["hw-fix"]?.done &&
          state.results["hw-q"]?.done &&
          state.results["hw-gap"]?.done &&
          state.reportDone
        );
      if (id === "results") return false;
      return !!state.results[id]?.done;
    };
    return order.find((id) => !isDone(id)) ?? "results";
  }, [state.results]);

  const hasProgress = stats.totalSolved > 0 || state.report.length > 0;

  const onMissionResult = useCallback((key: string) => (r: Parameters<typeof setResult>[1]) => setResult(key, r), [setResult]);

  return (
    <div className="relative min-h-screen">
      <div className="cave-bg" />
      <div className="vignette" />

      {/* ---------------- header ---------------- */}
      <header className="sticky top-0 z-40 border-b border-bronze-400/12 bg-cave-950/85 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 pt-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => go("start")}
              className="focus-ring group flex min-w-0 items-center gap-3 rounded-2xl py-1 pr-2 text-left"
            >
              <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-bronze-400/40 bg-gradient-to-b from-bronze-400/25 to-black/40 text-xl transition group-hover:border-lantern-400/70">
                🕵️
                <span className="absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,224,178,0.25)]" />
              </span>
              <span className="min-w-0">
                <span className="tape block text-[10px] tracking-[0.18em] text-bronze-300 uppercase">
                  Case file 8-4 · Boss Battle
                </span>
                <span className="font-display block truncate text-[15px] leading-tight font-bold text-parch-50 sm:text-lg">
                  The Case of the Empty Cave
                </span>
              </span>
            </button>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <div className="hidden w-40 sm:block md:w-52">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="tape text-[9px] text-parch-200/55 uppercase">inventory</span>
                  <span className="tape text-[10px] text-bronze-300">
                    {stats.totalSolved}/{stats.totalAll}
                  </span>
                </div>
                <Bar value={stats.percent} className="h-1.5" />
              </div>
              <Btn size="sm" variant="ghost" onClick={() => setNotesOpen(true)}>
                <span aria-hidden>📋</span>
                <span className="hidden sm:inline">Detective Notes</span>
                <span className="sm:hidden">Notes</span>
              </Btn>
              {hasProgress && (
                <button
                  onClick={() => setConfirmReset(true)}
                  title="Start over — clear all progress"
                  aria-label="Start over"
                  className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-white/12 text-parch-200/70 transition hover:border-wrong/60 hover:text-wrong"
                >
                  ↺
                </button>
              )}
            </div>
          </div>

          {/* step nav */}
          <nav className="step-scroll -mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-3" aria-label="Lesson steps">
            <StepChip
              active={state.screen === "start"}
              done={false}
              emoji="🚪"
              label="Start"
              onClick={() => go("start")}
            />
            {NAV_STEPS.map((s) => (
              <StepChip
                key={s.id}
                active={state.screen === s.id}
                done={
                  s.id === "dictation"
                    ? !!state.results.dictation?.done
                    : s.id === "homework"
                      ? !!(state.results["hw-fix"]?.done && state.results["hw-q"]?.done && state.results["hw-gap"]?.done)
                      : s.id === "results"
                        ? false
                        : !!state.results[s.id]?.done
                }
                emoji={s.emoji}
                label={s.label}
                onClick={() => go(s.id as ScreenId)}
              />
            ))}
          </nav>
        </div>
        <div className="h-[2px] w-full bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-bronze-600 via-lantern-400 to-lantern-300 transition-[width] duration-150 ease-out"
            style={{ width: `${scrollPct}%` }}
          />
        </div>
      </header>

      {/* ---------------- main ---------------- */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-6 pb-24 sm:px-6 sm:pt-8">
        {state.screen === "start" && (
          <StartScreen
            hasProgress={hasProgress}
            percent={stats.percent}
            totalSolved={stats.totalSolved}
            totalAll={stats.totalAll}
            nextStep={nextStep}
            go={go}
            openNotes={() => setNotesOpen(true)}
            missionDone={stats.missionDone}
          />
        )}

        {MISSIONS.map((m) =>
          state.screen === m.id ? (
            <MissionScreen
              key={m.id}
              mission={m}
              savedDone={!!state.results[m.id]?.done}
              onResult={onMissionResult(m.id)}
              nextId={
                m.id === "m1"
                  ? "m2"
                  : m.id === "m2"
                    ? "m3"
                    : m.id === "m3"
                      ? "m4"
                      : "dictation"
              }
              nextLabel={
                m.id === "m4" ? "To the game dictation →" : "Next mission →"
              }
              go={go}
            />
          ) : null,
        )}

        {state.screen === "dictation" && (
          <section className="space-y-5">
            <ScreenHead
              tag="Game dictation · Unit 8 Lesson 1"
              title="The Archaeologist’s Tape"
              story="Before the thief took the labels, an archaeologist recorded the words of the cave. The tape is old and noisy — decode every record and the inventory list is complete."
              brief="10 words: museum, history, fire, tool, sculpture, necklace, bowl, knife, coin, musical instrument."
              reward="Fragment restored: the word list"
            />
            <Dictation progress={state} patch={patch} onResult={(r) => setResult("dictation", r)} />
            <Reveal>
              <div className="stone flex flex-wrap items-center justify-between gap-3 rounded-3xl p-5">
                <p className="text-[14px] text-parch-200/75">
                  Tape decoded? Move on to the homework file — or check the final report.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Btn variant="ghost" onClick={() => go("homework")}>
                    Homework →
                  </Btn>
                  <Btn onClick={() => go("results")}>Case report →</Btn>
                </div>
              </div>
            </Reveal>
          </section>
        )}

        {state.screen === "homework" && (
          <section className="space-y-5">
            <ScreenHead
              tag="Homework · detective’s evening file"
              title="Your Own Investigation"
              story="The cave case is closed, but a good detective keeps working. Tonight you write your own report about the things that were in your room yesterday."
              brief="Four tasks: free writing, error correction, Was there / Were there questions and a mini-text with gaps."
              reward="Extra fragments for your journal"
            />
            <Homework progress={state} patch={patch} onResult={(key, r) => setResult(key, r)} />
            <Reveal>
              <div className="stone flex flex-wrap items-center justify-between gap-3 rounded-3xl p-5">
                <p className="text-[14px] text-parch-200/75">Finished the file? Let’s see the final case report.</p>
                <Btn onClick={() => go("results")}>Case report →</Btn>
              </div>
            </Reveal>
          </section>
        )}

        {state.screen === "results" && (
          <Results
            stats={stats}
            progress={state}
            onRestart={() => {
              reset();
              setConfirmReset(false);
            }}
            onNotes={() => setNotesOpen(true)}
            onHome={() => go("start")}
          />
        )}
      </main>

      {/* ---------------- footer ---------------- */}
      <footer className="relative z-10 border-t border-white/8 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="tape text-[11px] text-parch-200/45 uppercase">
            Academy Stars 3 · Unit 8 · Lesson 4 Grammar · There was / There were
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setNotesOpen(true)} className="focus-ring tape text-[11px] text-bronze-300 uppercase underline decoration-dotted underline-offset-4">
              Detective Notes
            </button>
            <button onClick={() => setConfirmReset(true)} className="focus-ring tape text-[11px] text-parch-200/45 uppercase underline decoration-dotted underline-offset-4 hover:text-wrong">
              Start over
            </button>
          </div>
        </div>
      </footer>

      {/* mobile floating notes button */}
      <button
        onClick={() => setNotesOpen(true)}
        aria-label="Open detective notes"
        className="focus-ring fixed right-4 bottom-4 z-30 grid h-14 w-14 place-items-center rounded-full border border-bronze-400/50 bg-gradient-to-b from-bronze-400/30 to-cave-900 text-2xl shadow-[0_12px_30px_-8px_rgba(0,0,0,0.9)] transition hover:scale-105 hover:border-lantern-400 sm:hidden"
      >
        📋
      </button>

      <RulesDrawer open={notesOpen} onClose={() => setNotesOpen(false)} />

      {/* start-over confirmation */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="stone animate-pop w-full max-w-sm rounded-3xl p-6 text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full border border-wrong/40 bg-wrong/12 text-2xl">
              ↺
            </div>
            <h3 className="font-display text-xl font-bold text-parch-50">Start the case again?</h3>
            <p className="mt-2 text-[14px] text-parch-200/75">
              All solved clues, stars and your written report will be cleared. This cannot be undone.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Btn variant="ghost" onClick={() => setConfirmReset(false)}>
                Keep my progress
              </Btn>
              <Btn
                variant="danger"
                onClick={() => {
                  reset();
                  setConfirmReset(false);
                }}
              >
                Start over
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
function StepChip({
  active,
  done,
  emoji,
  label,
  onClick,
}: {
  active: boolean;
  done: boolean;
  emoji: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "focus-ring tape flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] uppercase transition-all",
        active
          ? "border-lantern-400 bg-lantern-400/20 text-lantern-300"
          : done
            ? "border-solved/35 bg-solved/10 text-solved/90 hover:bg-solved/20"
            : "border-white/10 bg-black/25 text-parch-200/60 hover:border-bronze-400/45 hover:text-parch-50",
      )}
    >
      <span aria-hidden>{done ? "✓" : emoji}</span>
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
function ScreenHead({
  tag,
  title,
  story,
  brief,
  reward,
}: {
  tag: string;
  title: string;
  story: string;
  brief: string;
  reward?: string;
}) {
  return (
    <Reveal>
      <div className="stone relative overflow-hidden rounded-3xl p-5 sm:p-7">
        <div className="pointer-events-none absolute -top-20 -left-10 h-56 w-56 rounded-full bg-lantern-400/10 blur-3xl animate-flicker" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone="bronze">{tag}</Chip>
            {reward && <Chip tone="dim">{reward}</Chip>}
          </div>
          <h1 className="font-display mt-3 text-2xl leading-tight font-bold text-parch-50 sm:text-[2.1rem]">{title}</h1>
          <p className="mt-3 max-w-3xl text-[14.5px] leading-relaxed text-parch-200/85">{story}</p>
          <p className="mt-3 max-w-3xl rounded-2xl border border-lantern-400/25 bg-lantern-400/8 px-4 py-3 text-[14px] text-parch-100">
            <b className="tape mr-2 text-[10px] text-lantern-300 uppercase">task</b>
            {brief}
          </p>
        </div>
      </div>
    </Reveal>
  );
}

function MissionScreen({
  mission,
  onResult,
  nextId,
  nextLabel,
  go,
  savedDone,
}: {
  mission: Mission;
  savedDone: boolean;
  onResult: (r: { solved: number; total: number; firstTry: number; attempts: number; done: boolean }) => void;
  nextId: ScreenId;
  nextLabel: string;
  go: (id: ScreenId) => void;
}) {
  return (
    <section className="space-y-5">
      <ScreenHead
        tag={`${mission.code} · ${mission.tag}`}
        title={mission.title}
        story={mission.story}
        brief={mission.brief}
        reward={mission.reward}
      />
      <Exercise
        items={mission.items}
        onResult={onResult}
        boss={mission.id === "m4"}
        savedDone={savedDone}
        onNext={() => go(nextId)}
        nextLabel={nextLabel}
      />
    </section>
  );
}

/* ------------------------------------------------------------------ */
function StartScreen({
  hasProgress,
  percent,
  totalSolved,
  totalAll,
  nextStep,
  go,
  openNotes,
  missionDone,
}: {
  hasProgress: boolean;
  percent: number;
  totalSolved: number;
  totalAll: number;
  nextStep: ScreenId;
  go: (id: ScreenId) => void;
  openNotes: () => void;
  missionDone: number;
}) {
  return (
    <div className="space-y-6">
      {/* hero */}
      <Reveal>
        <section className="relative overflow-hidden rounded-[28px] border border-bronze-400/20 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.95)]">
          <img
            src={CAVE_COVER_SRC}
            alt="A young detective girl with a journal inside a cave museum: empty display cases, a large stone bowl, animal bones and a glowing lantern"
            className="absolute inset-0 h-full w-full object-cover object-[42%_50%] animate-drift sm:object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cave-950 via-cave-950/55 to-cave-950/15" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_78%_35%,rgba(255,176,66,0.28),transparent_70%)] animate-flicker" />

          <div className="absolute top-4 right-4 rotate-6 sm:top-7 sm:right-8">
            <span className="tape rounded-xl border-2 border-lantern-400/60 bg-black/25 px-3 py-1.5 text-[10px] tracking-[0.2em] text-lantern-300 uppercase opacity-85">
              case open
            </span>
          </div>
          <div className="relative flex min-h-[27rem] flex-col justify-end p-5 sm:min-h-[32rem] sm:p-8">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Chip tone="bronze">Case file #8-4 · Boss Battle</Chip>
                <Chip tone="dim">Academy Stars 3 · Unit 8 · Lesson 4</Chip>
              </div>
              <h1 className="font-display mt-4 text-[2.1rem] leading-[1.05] font-bold text-parch-50 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] sm:text-6xl">
                The Case of the Empty Cave
              </h1>
              <p className="tape mt-3 text-[12px] tracking-[0.14em] text-lantern-300 uppercase sm:text-[13px]">
                Grammar target · There was / There were
              </p>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-parch-100/90 sm:text-base">
                Someone took every label off the display cases in the prehistoric cave. You are the Junior Detective
                on duty tonight: read the clues, restore the inventory and describe what{" "}
                <b className="text-lantern-300">there was</b> and what <b className="text-lantern-300">there were</b>{" "}
                in the cave.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Btn size="lg" onClick={() => go(nextStep)}>
                  {hasProgress ? `Continue the case →` : "Open the case file →"}
                </Btn>
                <Btn size="lg" variant="ghost" onClick={openNotes}>
                  📋 Detective Notes
                </Btn>
              </div>
              {hasProgress && (
                <p className="tape mt-4 inline-flex rounded-full border border-solved/40 bg-solved/12 px-3 py-1.5 text-[11px] text-solved uppercase">
                  progress saved · {totalSolved}/{totalAll} clues · {percent}%
                </p>
              )}
            </div>
          </div>
        </section>
      </Reveal>

      {/* briefing + plan */}
      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
        <Reveal delay={80}>
          <div className="stone h-full rounded-3xl p-5 sm:p-7">
            <Chip tone="dim">Mission briefing</Chip>
            <h2 className="font-display mt-3 text-2xl font-bold text-parch-50">Detective, this is your case</h2>
            <ul className="mt-4 space-y-3 text-[14.5px] leading-relaxed text-parch-200/85">
              {[
                ["🔦", "The museum displays a prehistoric cave with a stone bowl, bones, tools and old coins."],
                ["🏷️", "All the description labels are gone — the thief left only photos and short notes."],
                ["🧠", "Every label needs the right verb: there was for one thing, there were for many things."],
                ["🗝️", "Solve four missions, decode the archaeologist’s tape and open the Mixed Vault."],
              ].map(([e, t]) => (
                <li key={t} className="flex gap-3">
                  <span className="text-lg leading-none">{e}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 grid gap-2 rounded-2xl border border-bronze-400/20 bg-black/25 p-4 text-[13.5px] text-parch-200/80 sm:grid-cols-2">
              <p>
                <b className="text-bronze-300">Level:</b> 6th grade (≈12 years old)
              </p>
              <p>
                <b className="text-bronze-300">Format:</b> 1-to-1 online lesson · 45 min
              </p>
              <p>
                <b className="text-bronze-300">Vocabulary:</b> Unit 8 Lesson 1 words
              </p>
              <p>
                <b className="text-bronze-300">Mission:</b> Restore the Cave Inventory
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <div className="stone h-full rounded-3xl p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <Chip tone="dim">Investigation plan</Chip>
              <span className="tape text-[10px] text-parch-200/50 uppercase">{missionDone}/5 done</span>
            </div>
            <ul className="mt-4 space-y-2.5">
              {[
                { id: "m1", emoji: "📷", title: "Mission 1 · Old Photos", text: "was or were? 8 photo notes" },
                { id: "m2", emoji: "🏷️", title: "Mission 2 · Single Finds", text: "singular labels with there was" },
                { id: "m3", emoji: "🪙", title: "Mission 3 · Many Finds", text: "plural labels with there were" },
                { id: "m4", emoji: "🗝️", title: "Mission 4 · Mixed Vault", text: "Boss Battle: mixed clues" },
                { id: "dictation", emoji: "🎧", title: "Game Dictation", text: "decode 10 recorded words" },
                { id: "homework", emoji: "🏠", title: "Homework file", text: "4 tasks for after the lesson" },
                { id: "results", emoji: "🏅", title: "Case Report", text: "your rank and stars" },
              ].map((row, i) => (
                <li key={row.id}>
                  <button
                    onClick={() => go(row.id as ScreenId)}
                    className="focus-ring lift group flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-black/25 px-3 py-3 text-left hover:border-lantern-400/45 hover:bg-lantern-400/8"
                  >
                    <EmojiTile emoji={row.emoji} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-bold text-parch-50">{row.title}</span>
                      <span className="block truncate text-[12.5px] text-parch-200/60">{row.text}</span>
                    </span>
                    <span className="tape text-[10px] text-bronze-300/70 uppercase">{String(i + 1).padStart(2, "0")}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      {/* grammar teaser */}
      <Reveal delay={200}>
        <div className="stone grid gap-5 rounded-3xl p-5 sm:p-7 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Chip tone="bronze">Grammar on the case</Chip>
            <h2 className="font-display mt-3 text-2xl font-bold text-parch-50">
              There was <span className="text-parch-200/50">/</span> There were
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-parch-200/80">
              Open <b>Detective Notes</b> at any moment — even in the middle of a mission. Your progress never resets.
            </p>
            <Btn className="mt-4" variant="ghost" onClick={openNotes}>
              Open the notes →
            </Btn>
          </div>
          <div className="grid gap-3 lg:col-span-2 sm:grid-cols-2">
            <div className="rounded-2xl border border-bronze-400/20 bg-black/25 p-4">
              <p className="tape text-[10px] text-bronze-300 uppercase">singular · one thing</p>
              <p className="font-display mt-2 text-lg font-bold text-parch-50">There was a stone bowl.</p>
              <p className="mt-1 text-[13px] text-parch-200/65">a bowl · a knife · a sculpture · some water</p>
            </div>
            <div className="rounded-2xl border border-bronze-400/20 bg-black/25 p-4">
              <p className="tape text-[10px] text-bronze-300 uppercase">plural · many things</p>
              <p className="font-display mt-2 text-lg font-bold text-parch-50">There were twelve coins.</p>
              <p className="mt-1 text-[13px] text-parch-200/65">coins · tools · bones · knives</p>
            </div>
            <div className="rounded-2xl border border-bronze-400/20 bg-black/25 p-4">
              <p className="tape text-[10px] text-bronze-300 uppercase">negative</p>
              <p className="font-display mt-2 text-lg font-bold text-parch-50">
                There wasn’t a label. There weren’t any coins.
              </p>
            </div>
            <div className="rounded-2xl border border-bronze-400/20 bg-black/25 p-4">
              <p className="tape text-[10px] text-bronze-300 uppercase">questions</p>
              <p className="font-display mt-2 text-lg font-bold text-parch-50">
                Was there a fire? — Yes, there was.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={240}>
        <div className="stone flex flex-col items-center justify-between gap-4 rounded-3xl p-5 sm:flex-row sm:p-6">
          <div className="flex items-center gap-3">
            <Stars count={3} />
            <p className="text-[14px] text-parch-200/80">
              Detectives who solve every clue get the rank of <b className="text-lantern-300">Master Detective</b>.
            </p>
          </div>
          <Btn size="lg" onClick={() => go(nextStep)}>
            {hasProgress ? `Continue the case →` : "Start Mission 1 →"}
          </Btn>
        </div>
      </Reveal>
    </div>
  );
}
