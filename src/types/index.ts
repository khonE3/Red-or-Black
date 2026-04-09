// ─── Legacy types (kept for backward compatibility with existing components) ──

export interface NationalStats {
  totalDraws: number;
  redCount: number;
  blackCount: number;
  todayDraws: number;
  todayRed: number;
  todayBlack: number;
  lastUpdated: string;
}

export interface DrawSession {
  id: string;
  totalSlips: number;
  redSlips: number;
  blackSlips: number;
  drawnCount: number;
  redDrawn: number;
  blackDrawn: number;
  startedAt: string;
  status: "active" | "completed" | "paused";
}

export type SlipType = "red" | "black";

export interface OddsSnapshot {
  redOdds: number;
  blackOdds: number;
  redRemaining: number;
  blackRemaining: number;
  totalRemaining: number;
  timestamp: string;
}

// ─── Core simulation types ────────────────────────────────────────────────────

export interface Province {
  id: string;
  nameTh: string;
  nameEn: string;
  districts: District[];
}

export interface District {
  id: string;
  nameTh: string;
  nameEn: string;
  eligibleCount: number;
  quota: number;
}

export interface BucketState {
  redRemaining: number;
  blackRemaining: number;
  totalRemaining: number;
  initialRed: number;
  initialBlack: number;
  initialTotal: number;
  drawHistory: DrawResult[];
}

export interface DrawResult {
  type: "red" | "black";
  timestamp: string;
}

export type GamePhase =
  | "selecting"
  | "ready"
  | "drawing"
  | "revealing"
  | "result"
  | "empty";
