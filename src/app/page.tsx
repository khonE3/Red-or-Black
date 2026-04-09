"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";

import Header from "@/components/Header";
import ProvinceSelector from "@/components/ProvinceSelector";
import BucketScene from "@/components/BucketScene";
import OddsDisplay from "@/components/OddsDisplay";
import StatsBoard from "@/components/StatsBoard";
import SlipReveal from "@/components/SlipReveal";

import type {
  Province,
  District,
  BucketState,
  DrawResult,
  GamePhase,
  NationalStats,
} from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildBucketState(district: District): BucketState {
  const red = Math.max(0, district.quota);
  const black = Math.max(0, district.eligibleCount - district.quota);
  const total = red + black;
  return {
    redRemaining: red,
    blackRemaining: black,
    totalRemaining: total,
    initialRed: red,
    initialBlack: black,
    initialTotal: total,
    drawHistory: [],
  };
}

function pickSlip(bucket: BucketState): "red" | "black" {
  if (bucket.totalRemaining <= 0) return "black";
  const rand = Math.random() * bucket.totalRemaining;
  return rand < bucket.redRemaining ? "red" : "black";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Province info bar ────────────────────────────────────────────────────────

interface ProvinceBarProps {
  province: Province;
  district: District;
  bucketState: BucketState;
  onChangeClick: () => void;
}

function ProvinceBar({
  province,
  district,
  bucketState,
  onChangeClick,
}: ProvinceBarProps) {
  const redPct =
    bucketState.initialTotal > 0
      ? ((bucketState.initialRed / bucketState.initialTotal) * 100).toFixed(1)
      : "0.0";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm px-4 py-3 mb-5"
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-gradient-to-b from-red-600 via-red-700 to-red-950" />

      <div className="flex flex-wrap items-center justify-between gap-3 pl-3">
        {/* Location label */}
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="shrink-0 w-4 h-4 text-red-500" />
          <div className="min-w-0">
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest leading-none mb-0.5">
              พื้นที่จำลอง
            </p>
            <p className="text-zinc-100 font-semibold text-sm leading-snug truncate">
              {province.nameTh}
              <span className="text-zinc-600 mx-1.5">›</span>
              {district.nameTh}
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-center hidden sm:block">
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider leading-none mb-0.5">
              ผู้เข้าเกณฑ์
            </p>
            <p className="text-zinc-200 font-bold text-sm tabular-nums">
              {bucketState.initialTotal.toLocaleString("th-TH")} คน
            </p>
          </div>
          <div className="text-center hidden sm:block">
            <p className="text-red-400 text-[10px] uppercase tracking-wider leading-none mb-0.5">
              โควตาใบแดง
            </p>
            <p className="text-red-400 font-bold text-sm tabular-nums">
              {bucketState.initialRed.toLocaleString("th-TH")} ใบ ({redPct}%)
            </p>
          </div>
          <div className="text-center">
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider leading-none mb-0.5">
              เหลือในถัง
            </p>
            <p className="text-amber-400 font-bold text-sm tabular-nums">
              {bucketState.totalRemaining.toLocaleString("th-TH")} ใบ
            </p>
          </div>

          <button
            onClick={onChangeClick}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:border-zinc-600 px-3 py-1.5 text-zinc-300 text-xs font-medium transition-colors duration-200 shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            เปลี่ยนพื้นที่
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Mobile stats toggle ──────────────────────────────────────────────────────

function StatsPanelToggle({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-zinc-300 text-sm font-medium hover:bg-zinc-800/80 transition-colors duration-200 lg:hidden mb-4"
    >
      <span className="flex items-center gap-2">
        <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
        สถิติ &amp; โอกาส
      </span>
      {open ? (
        <ChevronUp className="w-4 h-4 text-zinc-400" />
      ) : (
        <ChevronDown className="w-4 h-4 text-zinc-400" />
      )}
    </button>
  );
}

// ─── Ambient background pattern ───────────────────────────────────────────────

function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Top radial glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-red-950/20 blur-3xl" />
      {/* Bottom corner accents */}
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-red-950/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-zinc-800/20 blur-3xl" />
      {/* Grid lines */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.025]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Home() {
  // Game state
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null,
  );
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null,
  );
  const [bucketState, setBucketState] = useState<BucketState | null>(null);
  const [phase, setPhase] = useState<GamePhase>("selecting");
  const [currentResult, setCurrentResult] = useState<DrawResult | null>(null);
  const [showReveal, setShowReveal] = useState(false);

  // Stats state
  const [stats, setStats] = useState<NationalStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // UI state
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [showSelector, setShowSelector] = useState(true);

  // Guard
  const isDrawingRef = useRef(false);

  // ── Stats fetch ────────────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("stats fetch failed");
      const data: NationalStats = await res.json();
      setStats(data);
    } catch {
      // silent retry on next interval
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 12_000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  // ── Province / district selection ──────────────────────────────────────────

  const handleProvinceDistrictSelect = useCallback(
    (province: Province, district: District) => {
      setSelectedProvince(province);
      setSelectedDistrict(district);
      setBucketState(buildBucketState(district));
      setPhase("ready");
      setCurrentResult(null);
      setShowReveal(false);
      setShowSelector(false);
      isDrawingRef.current = false;
    },
    [],
  );

  const handleChangeArea = useCallback(() => {
    setShowSelector(true);
    setPhase("selecting");
    setShowReveal(false);
    isDrawingRef.current = false;
  }, []);

  // ── Draw flow ──────────────────────────────────────────────────────────────

  const handleDraw = useCallback(async () => {
    if (!bucketState || phase !== "ready" || isDrawingRef.current) return;
    if (bucketState.totalRemaining <= 0) {
      setPhase("empty");
      return;
    }

    isDrawingRef.current = true;
    setPhase("drawing");

    // Snapshot at draw-time for closure safety
    const snapshot: BucketState = {
      ...bucketState,
      drawHistory: [...bucketState.drawHistory],
    };

    // Suspense delay: 1.8 – 2.9 s
    await sleep(1800 + Math.random() * 1100);

    // Determine result
    const type = pickSlip(snapshot);
    const result: DrawResult = { type, timestamp: new Date().toISOString() };

    // Build new bucket
    const newBucket: BucketState = {
      ...snapshot,
      redRemaining:
        type === "red" ? snapshot.redRemaining - 1 : snapshot.redRemaining,
      blackRemaining:
        type === "black"
          ? snapshot.blackRemaining - 1
          : snapshot.blackRemaining,
      totalRemaining: snapshot.totalRemaining - 1,
      drawHistory: [...snapshot.drawHistory, result],
    };

    setBucketState(newBucket);
    setCurrentResult(result);
    setShowReveal(true);
    setPhase("revealing");
    isDrawingRef.current = false;

    // Record to API (fire-and-forget)
    fetch("/api/draw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    })
      .then((r) => r.json())
      .then((updated: NationalStats) => setStats(updated))
      .catch(() => fetchStats());
  }, [bucketState, phase, fetchStats]);

  // ── Reveal close ───────────────────────────────────────────────────────────

  const handleRevealClose = useCallback(() => {
    setShowReveal(false);
    setBucketState((prev) => {
      if (!prev) return prev;
      if (prev.totalRemaining <= 0) {
        setPhase("empty");
      } else {
        setPhase("ready");
      }
      return prev;
    });
  }, []);

  // ── Reset same district ────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    if (selectedDistrict) {
      setBucketState(buildBucketState(selectedDistrict));
      setCurrentResult(null);
      setShowReveal(false);
      setPhase("ready");
    } else {
      setShowSelector(true);
      setPhase("selecting");
    }
    isDrawingRef.current = false;
  }, [selectedDistrict]);

  // ── Derived flags ──────────────────────────────────────────────────────────

  const isInGame = !!(
    selectedProvince &&
    selectedDistrict &&
    bucketState &&
    !showSelector
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="relative min-h-screen bg-zinc-950 flex flex-col">
      <AmbientBackground />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="relative z-10">
        <Header />
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
        {/* ══════════════════════════════════════════════════════════════════
            VIEW A: Province selector (initial / change area)
        ══════════════════════════════════════════════════════════════════ */}
        <AnimatePresence mode="wait">
          {showSelector && (
            <motion.div
              key="selector-view"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              {/* Intro heading */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.35 }}
                className="mb-6 text-center"
              >
                <h2 className="text-zinc-200 text-xl sm:text-2xl font-bold tracking-wide mb-1">
                  เลือกพื้นที่เพื่อเริ่มจำลองการเกณฑ์ทหาร
                </h2>
                <p className="text-zinc-500 text-sm">
                  ระบุจังหวัดและอำเภอ/เขต เพื่อโหลดโควตาสลากตามพื้นที่จริง
                </p>
              </motion.div>

              {/* Province selector */}
              <ProvinceSelector
                onSelect={handleProvinceDistrictSelect}
                selectedProvince={selectedProvince}
                selectedDistrict={selectedDistrict}
              />

              {/* Stats below selector */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4 }}
                className="mt-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-zinc-800" />
                  <span className="text-zinc-600 text-xs uppercase tracking-widest px-3">
                    สถิติทั่วประเทศวันนี้
                  </span>
                  <div className="h-px flex-1 bg-zinc-800" />
                </div>
                <StatsBoard stats={stats} isLoading={statsLoading} />
              </motion.div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              VIEW B: In-game layout
          ══════════════════════════════════════════════════════════════════ */}
          {isInGame && (
            <motion.div
              key="game-view"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              {/* Province info bar */}
              <AnimatePresence>
                {selectedProvince && selectedDistrict && bucketState && (
                  <ProvinceBar
                    province={selectedProvince}
                    district={selectedDistrict}
                    bucketState={bucketState}
                    onChangeClick={handleChangeArea}
                  />
                )}
              </AnimatePresence>

              {/* Mobile: stats toggle */}
              <StatsPanelToggle
                open={showStatsPanel}
                onToggle={() => setShowStatsPanel((v) => !v)}
              />

              {/* Mobile: collapsible stats panel */}
              <AnimatePresence>
                {showStatsPanel && (
                  <motion.div
                    key="mobile-stats"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden lg:hidden mb-4"
                  >
                    <div className="space-y-4 pb-2">
                      {bucketState && (
                        <OddsDisplay
                          redRemaining={bucketState.redRemaining}
                          blackRemaining={bucketState.blackRemaining}
                          totalRemaining={bucketState.totalRemaining}
                          initialTotal={bucketState.initialTotal}
                        />
                      )}
                      <StatsBoard stats={stats} isLoading={statsLoading} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Desktop: two-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ── LEFT: Bucket ─────────────────────────────────────── */}
                <div className="lg:col-span-5 xl:col-span-4">
                  {bucketState && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <BucketScene
                        bucketState={bucketState}
                        phase={phase}
                        onDraw={handleDraw}
                        onReset={handleReset}
                      />
                    </motion.div>
                  )}
                </div>

                {/* ── RIGHT: Odds + Stats (desktop only visible) ────────── */}
                <div className="hidden lg:flex lg:col-span-7 xl:col-span-8 flex-col gap-5">
                  {bucketState && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.1,
                        duration: 0.4,
                        ease: "easeOut",
                      }}
                    >
                      <OddsDisplay
                        redRemaining={bucketState.redRemaining}
                        blackRemaining={bucketState.blackRemaining}
                        totalRemaining={bucketState.totalRemaining}
                        initialTotal={bucketState.initialTotal}
                      />
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
                  >
                    <StatsBoard stats={stats} isLoading={statsLoading} />
                  </motion.div>

                  {/* Draw history recap (desktop) */}
                  {bucketState && bucketState.drawHistory.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm p-4"
                    >
                      <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-3">
                        ประวัติการจับสลากรอบนี้
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {bucketState.drawHistory.map((draw, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 20,
                              delay: idx * 0.03,
                            }}
                            className={`w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-bold border ${
                              draw.type === "red"
                                ? "bg-red-950/80 border-red-700/60 text-red-400"
                                : "bg-zinc-800/80 border-zinc-600/60 text-zinc-400"
                            }`}
                            title={draw.type === "red" ? "ใบแดง" : "ใบดำ"}
                          >
                            {draw.type === "red" ? "แ" : "ด"}
                          </motion.div>
                        ))}
                      </div>
                      <div className="flex gap-4 mt-3 pt-3 border-t border-zinc-800">
                        <span className="text-red-400 text-xs">
                          ใบแดง:{" "}
                          <strong>
                            {
                              bucketState.drawHistory.filter(
                                (d) => d.type === "red",
                              ).length
                            }
                          </strong>
                        </span>
                        <span className="text-zinc-400 text-xs">
                          ใบดำ:{" "}
                          <strong>
                            {
                              bucketState.drawHistory.filter(
                                (d) => d.type === "black",
                              ).length
                            }
                          </strong>
                        </span>
                        <span className="text-zinc-600 text-xs ml-auto">
                          จับไปแล้ว {bucketState.drawHistory.length} ครั้ง
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-zinc-900 py-4 text-center">
        <p className="text-zinc-700 text-xs tracking-wide">
          Red or Black Destiny — ระบบจำลองเพื่อความบันเทิงเท่านั้น
          ไม่ใช่ระบบทางการ
        </p>
      </footer>

      {/* ── Slip reveal overlay ──────────────────────────────────────────── */}
      <SlipReveal
        result={currentResult}
        isVisible={showReveal}
        onClose={handleRevealClose}
        isRed={currentResult?.type === "red"}
      />
    </div>
  );
}
