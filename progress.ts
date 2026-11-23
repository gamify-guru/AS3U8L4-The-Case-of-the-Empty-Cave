import { useCallback, useEffect, useMemo, useState } from "react";
import { DICTATION_WORDS, HOMEWORK_FIXES, HOMEWORK_QUESTIONS, HOMEWORK_GAP_TEXT, MISSIONS } from "@/data/lesson";

export type ScreenId = "start" | "m1" | "m2" | "m3" | "m4" | "dictation" | "homework" | "results";

export interface ExerciseResult {
  solved: number;
  total: number;
  firstTry: number;
  attempts: number;
  done: boolean;
}

export interface ProgressState {
  v: number;
  screen: ScreenId;
  results: Record<string, ExerciseResult>;
  dictText: Record<string, string>;
  dictStatus: Record<string, string>;
  gapText: Record<string, string>;
  report: string;
  reportDone: boolean;
  startedAt: number | null;
  updatedAt: number;
}

export const STORAGE_KEY = "cave-case-8-4-v1";

export const emptyResult = (total: number): ExerciseResult => ({
  solved: 0,
  total,
  firstTry: 0,
  attempts: 0,
  done: false,
});

export const DEFAULT_PROGRESS: ProgressState = {
  v: 1,
  screen: "start",
  results: {},
  dictText: {},
  dictStatus: {},
  gapText: {},
  report: "",
  reportDone: false,
  startedAt: null,
  updatedAt: 0,
};

function load(): ProgressState {
  if (typeof window === "undefined") return { ...DEFAULT_PROGRESS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      results: { ...(parsed.results ?? {}) },
      dictText: { ...(parsed.dictText ?? {}) },
      dictStatus: { ...(parsed.dictStatus ?? {}) },
      gapText: { ...(parsed.gapText ?? {}) },
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function useProgress() {
  const [state, setState] = useState<ProgressState>(() => load());

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked — the lesson keeps working in memory */
    }
  }, [state]);

  const patch = useCallback((next: Partial<ProgressState>) => {
    setState((prev) => ({ ...prev, ...next, updatedAt: Date.now() }));
  }, []);

  const setResult = useCallback((key: string, res: ExerciseResult) => {
    setState((prev) => ({
      ...prev,
      results: { ...prev.results, [key]: res },
      updatedAt: Date.now(),
    }));
  }, []);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setState({ ...DEFAULT_PROGRESS, updatedAt: Date.now() });
  }, []);

  return { state, patch, setResult, reset, setState };
}

export function exerciseResult(state: ProgressState, key: string, total: number): ExerciseResult {
  const found = state.results[key];
  if (!found) return emptyResult(total);
  return { ...found, total };
}

/** Everything that counts towards the final case report. */
export function useCaseStats(state: ProgressState) {
  return useMemo(() => {
    const classRows = MISSIONS.map((m) => ({
      id: m.id,
      title: m.title,
      code: m.code,
      res: exerciseResult(state, m.id, m.items.length),
    }));
    const dictRes = exerciseResult(state, "dictation", DICTATION_WORDS.length);
    const hwFix = exerciseResult(state, "hw-fix", HOMEWORK_FIXES.length);
    const hwQ = exerciseResult(state, "hw-q", HOMEWORK_QUESTIONS.length);
    const gapKeys = HOMEWORK_GAP_TEXT.parts.filter((p) => p.gap).length;
    const hwGap = exerciseResult(state, "hw-gap", gapKeys);

    const classSolved = classRows.reduce((s, r) => s + r.res.solved, 0);
    const classTotal = classRows.reduce((s, r) => s + r.res.total, 0);
    const classFirst = classRows.reduce((s, r) => s + r.res.firstTry, 0);

    const hwSolved = hwFix.solved + hwQ.solved + hwGap.solved;
    const hwTotal = hwFix.total + hwQ.total + hwGap.total;
    const hwFirst = hwFix.firstTry + hwQ.firstTry + hwGap.firstTry;

    const dictSolved = dictRes.solved;
    const dictTotal = dictRes.total;

    const totalSolved = classSolved + dictSolved + hwSolved;
    const totalAll = classTotal + dictTotal + hwTotal;
    const accuracy = totalSolved ? Math.round((classFirst + hwFirst + dictRes.firstTry) / totalSolved * 100) : 0;

    const percent = totalAll ? Math.round((totalSolved / totalAll) * 100) : 0;

    const missionDone =
      classRows.filter((r) => r.res.done).length + (dictRes.done ? 1 : 0);
    const missionsTotal = MISSIONS.length + 1;

    const starsFor = (res: ExerciseResult) => {
      if (!res.done || !res.solved) return 0;
      const acc = res.solved ? res.firstTry / res.solved : 0;
      if (res.solved < res.total) return 1;
      if (acc >= 0.9) return 3;
      if (acc >= 0.65) return 2;
      return 1;
    };

    const stars =
      classRows.reduce((s, r) => s + starsFor(r.res), 0) +
      starsFor(dictRes) +
      starsFor(hwFix) +
      starsFor(hwQ) +
      starsFor(hwGap) +
      (state.reportDone ? 3 : 0);

    const maxStars = MISSIONS.length * 3 + 3 + 3 * 4; // missions + dictation + 4 homework tasks

    let rank = "Trainee Detective";
    if (percent >= 100 && accuracy >= 85) rank = "Master Detective";
    else if (percent >= 80 && accuracy >= 75) rank = "Case Solver";
    else if (percent >= 50) rank = "Junior Detective";
    else if (percent >= 20) rank = "Evidence Collector";

    return {
      classRows,
      dictRes,
      hwFix,
      hwQ,
      hwGap,
      classSolved,
      classTotal,
      dictSolved,
      dictTotal,
      hwSolved,
      hwTotal,
      totalSolved,
      totalAll,
      percent,
      accuracy,
      stars,
      maxStars,
      rank,
      missionDone,
      missionsTotal,
      starsFor,
      fragments: Math.min(6, Math.round((classSolved / Math.max(1, classTotal)) * 6)),
    };
  }, [state]);
}
