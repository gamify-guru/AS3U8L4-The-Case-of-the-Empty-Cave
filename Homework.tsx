import { useMemo, useState } from "react";
import {
  HOMEWORK_FIXES,
  HOMEWORK_GAP_TEXT,
  HOMEWORK_QUESTIONS,
  HOMEWORK_NOTES,
  REPORT_STARTERS,
} from "@/data/lesson";
import { Bar, Btn, Chip } from "@/components/ui";
import { Exercise } from "@/components/Exercise";
import { cn } from "@/utils/cn";
import type { ExerciseResult, ProgressState } from "@/lib/progress";

const norm = (s: string) =>
  s.toLowerCase().replace(/[’‘`´]/g, "'").replace(/\s+/g, " ").trim();

const TABS = [
  { id: "a", label: "A · My cave report", emoji: "📝" },
  { id: "b", label: "B · Fix the sentences", emoji: "🛠️" },
  { id: "c", label: "C · Was there / Were there", emoji: "❓" },
  { id: "d", label: "D · Mini-text gaps", emoji: "📄" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function Homework({
  progress,
  patch,
  onResult,
}: {
  progress: ProgressState;
  patch: (next: Partial<ProgressState>) => void;
  onResult: (key: string, r: ExerciseResult) => void;
}) {
  const [tab, setTab] = useState<TabId>("a");

  const bDone = progress.results["hw-fix"]?.done;
  const cDone = progress.results["hw-q"]?.done;
  const dDone = progress.results["hw-gap"]?.done;
  const doneMap: Record<TabId, boolean | undefined> = { a: progress.reportDone, b: bDone, c: cDone, d: dDone };
  const doneCount = TABS.filter((t) => doneMap[t.id]).length;

  return (
    <div className="space-y-5">
      <div className="stone rounded-3xl p-5 sm:p-7">
        <Chip tone="dim">Separate block · Homework</Chip>
        <h2 className="font-display mt-3 text-2xl font-bold text-parch-50 sm:text-3xl">
          Homework — Detective’s evening file
        </h2>
        <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-parch-200/80">
          Four tasks, different from the class missions. You can finish them after the lesson — everything is saved
          automatically, and your teacher sees the same journal.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <Bar value={(doneCount / TABS.length) * 100} className="max-w-xs" />
          <span className="tape text-[11px] text-parch-200/60 uppercase">{doneCount}/4 done</span>
        </div>
      </div>

      <div className="step-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "focus-ring flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-[13px] font-bold transition-all",
              tab === t.id
                ? "border-lantern-400 bg-lantern-400/20 text-lantern-300"
                : "border-white/10 bg-black/25 text-parch-200/70 hover:border-bronze-400/45 hover:text-parch-50",
            )}
          >
            <span>{t.emoji}</span>
            {t.label}
            {doneMap[t.id] && <span className="text-solved">✓</span>}
          </button>
        ))}
      </div>

      {tab === "a" && <ReportTask progress={progress} patch={patch} />}
      {tab === "b" && (
        <Exercise
          items={HOMEWORK_FIXES}
          practice
          savedDone={!!progress.results["hw-fix"]?.done}
          onResult={(r) => onResult("hw-fix", r)}
          nextLabel="Task B solved ✓"
        />
      )}
      {tab === "c" && (
        <Exercise
          items={HOMEWORK_QUESTIONS}
          practice
          savedDone={!!progress.results["hw-q"]?.done}
          onResult={(r) => onResult("hw-q", r)}
          nextLabel="Task C solved ✓"
        />
      )}
      {tab === "d" && <GapTask progress={progress} patch={patch} onResult={(r) => onResult("hw-gap", r)} />}
    </div>
  );
}

/* ---------------- Task A: written report ---------------- */
function ReportTask({
  progress,
  patch,
}: {
  progress: ProgressState;
  patch: (next: Partial<ProgressState>) => void;
}) {
  const report = progress.report ?? "";
  const stats = useMemo(() => {
    const sentences = report
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2);
    const was = (report.match(/there\s+wasn?['’]?t?/gi) ?? []).length;
    const were = (report.match(/there\s+weren?['’]?t?/gi) ?? []).length;
    return { count: sentences.length, was, were, total: was + were };
  }, [report]);

  const checks = [
    { ok: stats.count >= 5, text: `5–7 sentences (you have ${stats.count})` },
    { ok: stats.was >= 1, text: "there was / there wasn’t used at least once" },
    { ok: stats.were >= 1, text: "there were / there weren’t used at least once" },
    { ok: report.length > 60, text: "a few details: where was it? how many?" },
  ];
  const ready = checks.every((c) => c.ok);

  return (
    <div className="space-y-4">
      <div className="stone rounded-3xl p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Chip tone="dim">Task A · free writing</Chip>
          <span className="tape text-[11px] text-parch-200/55 uppercase">saved automatically</span>
        </div>
        <h3 className="font-display mt-3 text-xl font-bold text-parch-50 sm:text-2xl">
          My cave / my room yesterday
        </h3>
        <p className="mt-2 text-[14.5px] leading-relaxed text-parch-200/80">
          You are the detective now. Look around your room (or imagine your own cave) and write 5–7 sentences about
          what <b>there was</b> and <b>there were</b> there yesterday. Use singular and plural, add one negative
          sentence, and finish with one question.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {REPORT_STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => patch({ report: `${report}${report && !report.endsWith(" ") ? " " : ""}${s}` })}
              className="focus-ring tape rounded-full border border-bronze-400/25 bg-black/25 px-3 py-1.5 text-[11px] text-bronze-200 transition hover:border-lantern-400/60 hover:text-lantern-300"
            >
              + {s}
            </button>
          ))}
        </div>

        <textarea
          value={report}
          onChange={(e) => patch({ report: e.target.value })}
          rows={8}
          placeholder="There was a … There were some … There wasn’t any …"
          aria-label="Write your report"
          className="focus-ring mt-4 w-full rounded-2xl border border-bronze-400/30 bg-black/35 px-4 py-3 text-[15px] leading-relaxed text-parch-50 placeholder:text-parch-200/25 focus:border-lantern-400"
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[12px] text-parch-200/50">
          <span>{report.length} characters</span>
          <span>{stats.count} sentences · {stats.total} there was/were forms</span>
        </div>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {checks.map((c) => (
            <li
              key={c.text}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-[13px]",
                c.ok ? "border-solved/40 bg-solved/10 text-parch-100" : "border-white/10 bg-black/25 text-parch-200/65",
              )}
            >
              <span className={c.ok ? "text-solved" : "text-parch-200/40"}>{c.ok ? "✓" : "○"}</span>
              {c.text}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Btn
            onClick={() => patch({ reportDone: true })}
            disabled={!ready}
            title={ready ? "Send your report to the case journal" : "Finish the checklist first"}
          >
            Send to the case journal
          </Btn>
          {progress.reportDone && (
            <span className="tape animate-pop rounded-full border border-solved/45 bg-solved/12 px-3 py-1.5 text-[11px] text-solved uppercase">
              ✓ report filed
            </span>
          )}
          {progress.reportDone && (
            <Btn variant="quiet" onClick={() => patch({ reportDone: false })}>
              keep editing
            </Btn>
          )}
        </div>
      </div>

      <div className="stone rounded-3xl p-5 sm:p-6">
        <Chip tone="dim">Detective notes for you</Chip>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {HOMEWORK_NOTES.map((n) => (
            <p key={n} className="rounded-xl border border-white/8 bg-black/25 px-3 py-2 text-[13.5px] text-parch-200/85">
              {n}
            </p>
          ))}
        </div>
        <p className="mt-3 text-[13px] text-parch-200/60">
          Use these sentences as a model: one thing → <b>there was</b>, many things → <b>there were</b>.
        </p>
      </div>
    </div>
  );
}

/* ---------------- Task D: gap text ---------------- */
function GapTask({
  progress,
  patch,
  onResult,
}: {
  progress: ProgressState;
  patch: (next: Partial<ProgressState>) => void;
  onResult: (r: ExerciseResult) => void;
}) {
  const gaps = useMemo(() => HOMEWORK_GAP_TEXT.parts.filter((p) => p.gap).map((p) => p.gap!), []);
  const values = progress.gapText ?? {};
  const [checked, setChecked] = useState(false);
  const [reveal, setReveal] = useState(false);

  const results = gaps.map((g) => {
    const v = values[g.id] ?? "";
    if (!v.trim()) return "empty" as const;
    return g.answers.some((a) => norm(a) === norm(v)) ? ("ok" as const) : ("bad" as const);
  });
  const okCount = results.filter((r) => r === "ok").length;

  const report = (nextChecked: boolean) => {
    onResult({
      solved: nextChecked ? okCount : results.filter((r) => r === "ok").length,
      total: gaps.length,
      firstTry: okCount,
      attempts: gaps.length - okCount,
      done: nextChecked && okCount === gaps.length,
    });
  };

  return (
    <div className="stone rounded-3xl p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Chip tone="dim">{HOMEWORK_GAP_TEXT.title}</Chip>
        <span className="tape text-[11px] text-parch-200/55 uppercase">
          {checked ? `${okCount}/${gaps.length} correct` : "8 gaps"}
        </span>
      </div>
      <h3 className="font-display mt-3 text-xl font-bold text-parch-50 sm:text-2xl">
        Detective Ella’s report — put the verbs back
      </h3>
      <p className="mt-2 text-[14.5px] leading-relaxed text-parch-200/80">{HOMEWORK_GAP_TEXT.intro}</p>

      <div className="paper mt-5 rounded-2xl p-5 text-[15px] leading-[2.3] sm:p-7 sm:text-[16px]">
        {HOMEWORK_GAP_TEXT.parts.map((p, i) => {
          const gap = p.gap;
          if (!gap) {
            return (
              <span key={`t${i}`} className="text-ink-700">
                {p.text}
              </span>
            );
          }
          const state = reveal ? "ok" : results[i];
          return (
            <span key={gap.id} className="mx-1 inline-flex items-baseline">
              <input
                value={values[gap.id] ?? ""}
                onChange={(e) => {
                  const next = { ...values, [gap.id]: e.target.value };
                  patch({ gapText: next });
                  setChecked(false);
                }}
                aria-label={`Gap ${gap.id}`}
                placeholder="…"
                className={cn(
                  "tape ink-line focus-ring w-24 rounded-md bg-white/60 px-2 py-1 text-center text-[15px] font-bold text-ink-900 placeholder:text-ink-500/40",
                  state === "ok" && "border-b-2 border-solved text-solved",
                  state === "bad" && "border-b-2 border-wrong text-wrong",
                )}
              />
            </span>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
          <Btn
            onClick={() => {
              setChecked(true);
              report(true);
            }}
          >
            Check my report
          </Btn>
        <Btn variant="ghost" onClick={() => setReveal((v) => !v)}>
          {reveal ? "Hide answers" : "Show answers"}
        </Btn>
        <Btn
          variant="quiet"
          onClick={() => {
            patch({ gapText: {} });
            setChecked(false);
            setReveal(false);
          }}
        >
          Clear gaps
        </Btn>
      </div>

      {checked && (
        <div
          className={cn(
            "animate-pop mt-4 rounded-2xl border px-4 py-3 text-[14px]",
            okCount === gaps.length
              ? "border-solved/40 bg-solved/10 text-parch-100"
              : "border-lantern-400/35 bg-lantern-400/8 text-parch-100",
          )}
        >
          <b>{okCount === gaps.length ? "Perfect report!" : `${okCount} of ${gaps.length} gaps are correct.`}</b>{" "}
          {okCount === gaps.length
            ? "Detective Ella is proud of you."
            : "Read the red gaps again — count the noun: one thing or many things?"}
        </div>
      )}
    </div>
  );
}


