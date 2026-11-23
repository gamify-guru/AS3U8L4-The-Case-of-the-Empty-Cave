import { CAVE_COVER_SRC } from "@/assets/caveImage";
import { Bar, Btn, Chip, Reveal, Stars } from "@/components/ui";
import { cn } from "@/utils/cn";
import type { useCaseStats } from "@/lib/progress";
import type { ProgressState } from "@/lib/progress";

type Stats = ReturnType<typeof useCaseStats>;

const FRAGMENT_EMOJI = ["🥣", "🏮", "🔪", "📿", "🦴", "🗿"];

export function Results({
  stats,
  progress,
  onRestart,
  onNotes,
  onHome,
}: {
  stats: Stats;
  progress: ProgressState;
  onRestart: () => void;
  onNotes: () => void;
  onHome: () => void;
}) {
  const rows = [
    ...stats.classRows,
    { id: "dictation", code: "Game Dictation", title: "Archaeologist’s tape", res: stats.dictRes },
  ];
  const hwRows = [
    { id: "hw-fix", label: "B · Fix the sentences", res: stats.hwFix },
    { id: "hw-q", label: "C · Was there / Were there", res: stats.hwQ },
    { id: "hw-gap", label: "D · Mini-text gaps", res: stats.hwGap },
  ];

  return (
    <div className="space-y-5">
      <Reveal>
        <div className="stone relative overflow-hidden rounded-3xl p-6 sm:p-9">
          <img
            src={CAVE_COVER_SRC}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover object-center opacity-[0.13] blur-[2px] saturate-50"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cave-950/85 via-cave-950/40 to-cave-950/70" />
          <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-lantern-400/12 blur-3xl animate-flicker" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Chip tone="dim">Final Boss Battle · Case Report</Chip>
              <h2 className="font-display mt-3 text-3xl leading-tight font-bold text-parch-50 sm:text-4xl">
                The Case of the Empty Cave
              </h2>
              <p className="mt-2 max-w-lg text-[14.5px] leading-relaxed text-parch-200/80">
                The museum inventory is restored and the labels are back on the display cases. Here is your official
                detective report, {progress.reportDone ? "with your written report filed" : "based on all the clues you solved"}.
              </p>
              <p className="tape mt-4 inline-flex rounded-full border border-lantern-400/40 bg-lantern-400/12 px-4 py-2 text-[12px] text-lantern-300 uppercase">
                Rank: {stats.rank}
              </p>
            </div>
            <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-1 sm:text-right">
              <div className="rounded-2xl border border-bronze-400/20 bg-black/25 px-5 py-3">
                <p className="font-display text-3xl font-bold text-lantern-300">{stats.percent}%</p>
                <p className="tape mt-1 text-[10px] text-parch-200/60 uppercase">clues solved</p>
              </div>
              <div className="rounded-2xl border border-bronze-400/20 bg-black/25 px-5 py-3">
                <p className="font-display text-3xl font-bold text-lantern-300">{stats.accuracy}%</p>
                <p className="tape mt-1 text-[10px] text-parch-200/60 uppercase">first try</p>
              </div>
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-2 flex items-center justify-between">
              <span className="tape text-[11px] text-parch-200/60 uppercase">cave inventory fragments</span>
              <span className="tape text-[11px] text-bronze-300">
                {stats.totalSolved}/{stats.totalAll} clues
              </span>
            </div>
            <Bar value={stats.percent} />
            <div className="mt-4 flex flex-wrap gap-2.5">
              {FRAGMENT_EMOJI.map((e, i) => {
                const filled = i < stats.fragments;
                return (
                  <div
                    key={e}
                    className={cn(
                      "grid h-12 w-12 place-items-center rounded-2xl border text-2xl transition-all duration-500",
                      filled
                        ? "border-lantern-400/60 bg-lantern-400/15 shadow-[0_0_18px_-6px_rgba(255,187,87,0.7)]"
                        : "border-white/10 bg-black/25 opacity-35 grayscale",
                    )}
                  >
                    {e}
                  </div>
                );
              })}
              <div className="ml-auto flex items-center gap-2 rounded-2xl border border-bronze-400/20 bg-black/25 px-4 py-2">
                <span className="tape text-[10px] text-parch-200/60 uppercase">stars</span>
                <Stars count={Math.min(3, Math.round((stats.stars / stats.maxStars) * 3))} />
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="grid gap-5 lg:grid-cols-2">
        <Reveal delay={80}>
          <div className="stone h-full rounded-3xl p-5 sm:p-6">
            <h3 className="font-display text-xl font-bold text-parch-50">Class missions</h3>
            <ul className="mt-4 space-y-2.5">
              {rows.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/25 px-3 py-3 transition hover:border-bronze-400/35"
                >
                  <span className="tape w-24 shrink-0 text-[10px] text-bronze-300 uppercase">{r.code}</span>
                  <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-parch-100">{r.title}</span>
                  <span className="tape shrink-0 text-[12px] text-parch-200/70">
                    {r.res.solved}/{r.res.total}
                  </span>
                  <Stars count={stats.starsFor(r.res)} />
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3">
              <span className="tape text-[11px] text-parch-200/60 uppercase">class total</span>
              <span className="font-display text-lg font-bold text-lantern-300">
                {stats.classSolved + stats.dictSolved}/{stats.classTotal + stats.dictTotal}
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="stone h-full rounded-3xl p-5 sm:p-6">
            <h3 className="font-display text-xl font-bold text-parch-50">Homework file</h3>
            <ul className="mt-4 space-y-2.5">
              {hwRows.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/25 px-3 py-3 transition hover:border-bronze-400/35"
                >
                  <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-parch-100">{r.label}</span>
                  <span className="tape shrink-0 text-[12px] text-parch-200/70">
                    {r.res.solved}/{r.res.total}
                  </span>
                  <Stars count={stats.starsFor(r.res)} />
                </li>
              ))}
              <li className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/25 px-3 py-3">
                <span className="min-w-0 flex-1 text-[14px] font-semibold text-parch-100">A · Written report</span>
                <span
                  className={cn(
                    "tape shrink-0 rounded-full border px-3 py-1 text-[10px] uppercase",
                    progress.reportDone
                      ? "border-solved/45 bg-solved/12 text-solved"
                      : "border-white/15 bg-black/25 text-parch-200/50",
                  )}
                >
                  {progress.reportDone ? "filed ✓" : "not filed"}
                </span>
                <Stars count={progress.reportDone ? 3 : 0} />
              </li>
            </ul>
            <div className="mt-4 rounded-2xl border border-lantern-400/25 bg-lantern-400/8 p-4 text-[13.5px] leading-relaxed text-parch-100">
              <b className="tape text-[11px] text-lantern-300 uppercase">Teacher’s corner · </b>
              Grammar focus: <b>there was</b> + singular / uncountable, <b>there were</b> + plural, negatives and short
              answers. Vocabulary recycled from Unit 8 Lesson 1 in the game dictation.
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal delay={220}>
        <div className="stone flex flex-col items-center gap-4 rounded-3xl p-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="max-w-xl text-[14.5px] text-parch-200/80">
            {stats.percent === 100
              ? "Every single label is back on its case. Outstanding detective work!"
              : "Great progress! You can replay any mission — the notes stay with you."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Btn variant="ghost" onClick={onNotes}>
              📋 Detective Notes
            </Btn>
            <Btn variant="ghost" onClick={onHome}>
              ← Back to the case file
            </Btn>
            <Btn variant="danger" onClick={onRestart}>
              ↺ Start over
            </Btn>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
