import type { NationalStats } from "@/types";

// ─── Seeded baseline (realistic-looking national totals) ──────────────────────
const BASE_TOTAL = 847_293;
const BASE_RED = 162_847;
const BASE_BLACK = BASE_TOTAL - BASE_RED;

interface StatsStore {
  totalDraws: number;
  redCount: number;
  blackCount: number;
  todayDraws: number;
  todayRed: number;
  todayBlack: number;
  lastReset: string;
}

// ─── Module-level singleton (persists across requests in the same process) ────
const store: StatsStore = (() => {
  // Seed today's draws with a plausible mid-day number
  const todayTotal = 3_241 + Math.floor(Math.random() * 2_000);
  const todayRed = Math.round(todayTotal * 0.192);
  const todayBlack = todayTotal - todayRed;

  return {
    totalDraws: BASE_TOTAL,
    redCount: BASE_RED,
    blackCount: BASE_BLACK,
    todayDraws: todayTotal,
    todayRed,
    todayBlack,
    lastReset: new Date().toDateString(),
  };
})();

// ─── Day-boundary reset ───────────────────────────────────────────────────────
function checkDayReset(): void {
  const today = new Date().toDateString();
  if (store.lastReset !== today) {
    store.todayDraws = 0;
    store.todayRed = 0;
    store.todayBlack = 0;
    store.lastReset = today;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────
export function getStats(): NationalStats {
  checkDayReset();
  return {
    totalDraws: store.totalDraws,
    redCount: store.redCount,
    blackCount: store.blackCount,
    todayDraws: store.todayDraws,
    todayRed: store.todayRed,
    todayBlack: store.todayBlack,
    lastUpdated: new Date().toISOString(),
  };
}

export function recordDraw(type: "red" | "black"): NationalStats {
  checkDayReset();

  store.totalDraws += 1;
  store.todayDraws += 1;

  if (type === "red") {
    store.redCount += 1;
    store.todayRed += 1;
  } else {
    store.blackCount += 1;
    store.todayBlack += 1;
  }

  return getStats();
}
