"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
} from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  Globe,
  Clock,
  Activity,
} from "lucide-react";
import type { NationalStats } from "@/types";

// ─── Animated counter that smoothly counts up to a target value ───────────────
interface AnimatedNumberProps {
  value: number;
  className?: string;
  decimals?: number;
  suffix?: string;
}

function AnimatedNumber({
  value,
  className,
  decimals = 0,
  suffix,
}: AnimatedNumberProps) {
  const motionVal = useMotionValue(0);
  const display = useTransform(motionVal, (v) =>
    decimals > 0
      ? v.toFixed(decimals) + (suffix ?? "")
      : Math.round(v).toLocaleString("th-TH") + (suffix ?? ""),
  );

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [value, motionVal]);

  return <motion.span className={className}>{display}</motion.span>;
}

// ─── Skeleton pulse card ──────────────────────────────────────────────────────
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-zinc-900/70 border border-zinc-800/60 ${className ?? ""}`}
    >
      <div className="p-5 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1.5">
            <div className="h-2.5 bg-zinc-800 rounded-full w-28" />
            <div className="h-2 bg-zinc-800/70 rounded-full w-20" />
          </div>
          <div className="h-9 w-9 bg-zinc-800 rounded-lg" />
        </div>
        <div className="h-9 bg-zinc-800 rounded-lg w-3/5 mt-1" />
        <div className="h-2 bg-zinc-800/60 rounded-full w-2/5" />
      </div>
    </div>
  );
}

// ─── Animated progress bar ────────────────────────────────────────────────────
interface ProgressBarProps {
  redPct: number;
  blackPct: number;
}

function RatioBar({ redPct, blackPct }: ProgressBarProps) {
  return (
    <div className="h-3 bg-zinc-800/80 rounded-full overflow-hidden flex">
      <motion.div
        className="h-full bg-gradient-to-r from-red-800 via-red-600 to-red-500 rounded-l-full"
        initial={{ width: 0 }}
        animate={{ width: `${redPct}%` }}
        transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      />
      <motion.div
        className="h-full bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-500 rounded-r-full"
        initial={{ width: 0 }}
        animate={{ width: `${blackPct}%` }}
        transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      />
    </div>
  );
}

// ─── Single cumulative stat mini-card ────────────────────────────────────────
interface MiniCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  valueClassName?: string;
  className?: string;
  isPercent?: boolean;
  percentValue?: number;
}

function MiniCard({
  label,
  value,
  sublabel,
  valueClassName,
  className,
  isPercent,
  percentValue,
}: MiniCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: "spring", stiffness: 320, damping: 20 }}
      className={`rounded-lg p-3 text-center border ${className ?? ""}`}
    >
      <p className="text-[11px] text-zinc-500 mb-1.5 leading-tight">{label}</p>
      {isPercent && percentValue !== undefined ? (
        <AnimatedNumber
          value={percentValue}
          decimals={1}
          suffix="%"
          className={`text-lg sm:text-xl font-black leading-none ${valueClassName ?? "text-zinc-200"}`}
        />
      ) : (
        <span
          className={`text-lg sm:text-xl font-black leading-none ${valueClassName ?? "text-zinc-200"}`}
        >
          {value}
        </span>
      )}
      {sublabel && (
        <p
          className={`text-[10px] mt-1 leading-tight ${valueClassName ? valueClassName.replace(/text-\S+/, "text-zinc-600") : "text-zinc-600"}`}
        >
          {sublabel}
        </p>
      )}
    </motion.div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface StatsBoardProps {
  stats: NationalStats | null;
  isLoading: boolean;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function StatsBoard({ stats, isLoading }: StatsBoardProps) {
  const todayTotal = stats?.todayDraws ?? 0;
  const todayRed = stats?.todayRed ?? 0;
  const todayBlack = stats?.todayBlack ?? 0;
  const totalDraws = stats?.totalDraws ?? 0;
  const totalRed = stats?.redCount ?? 0;
  const totalBlack = stats?.blackCount ?? 0;

  const todayRedPct = todayTotal > 0 ? (todayRed / todayTotal) * 100 : 0;
  const todayBlackPct = todayTotal > 0 ? (todayBlack / todayTotal) * 100 : 0;
  const totalRedPct = totalDraws > 0 ? (totalRed / totalDraws) * 100 : 0;
  const totalBlackPct = totalDraws > 0 ? (totalBlack / totalDraws) * 100 : 0;

  const formatTime = (iso: string): string => {
    try {
      return (
        new Date(iso).toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }) + " น."
      );
    } catch {
      return iso;
    }
  };

  // Section entrance
  const sectionVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        delay: 0.1,
      },
    },
  };

  // Stagger children
  const cardVariants = {
    hidden: { opacity: 0, y: 22 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.15 + i * 0.08,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <motion.section
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-4"
    >
      {/* ── Section header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-700/20">
            <Globe className="w-4 h-4 text-amber-500" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-100 tracking-wide">
            สถิติทั่วประเทศ
          </h2>
          <span className="hidden sm:inline text-zinc-600 text-xs tracking-wider">
            National Statistics
          </span>
        </div>

        {/* Last updated */}
        <AnimatePresence>
          {stats?.lastUpdated && !isLoading && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-zinc-600 text-[11px]"
            >
              <Clock className="w-3 h-3 text-zinc-700" />
              <span>อัพเดทล่าสุด {formatTime(stats.lastUpdated)}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Today's main 3 stat cards ── */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeletons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <SkeletonCard className="h-36" />
            <SkeletonCard className="h-36" />
            <SkeletonCard className="h-36" />
          </motion.div>
        ) : (
          <motion.div
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {/* ── Card 1: Today's total ── */}
            <motion.div
              custom={0}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02, y: -3 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              className="relative overflow-hidden rounded-xl bg-zinc-900/80 backdrop-blur-sm
                         border border-zinc-800 p-5 group cursor-default"
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-transparent to-transparent
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              {/* Corner accent */}
              <div
                className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-full
                              translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-500"
              />

              <div className="relative flex items-start justify-between mb-4">
                <div>
                  <p className="text-zinc-400 text-[11px] font-semibold uppercase tracking-widest leading-none mb-1">
                    จับสลากวันนี้
                  </p>
                  <p className="text-zinc-600 text-[10px] tracking-wide">
                    Today&apos;s Draws
                  </p>
                </div>
                <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-700/20 shrink-0">
                  <Users className="w-5 h-5 text-amber-500" />
                </div>
              </div>

              <div className="relative flex items-end gap-2 mb-3">
                <AnimatedNumber
                  value={todayTotal}
                  className="text-4xl sm:text-5xl font-black text-white leading-none"
                />
                <span className="text-zinc-400 text-sm mb-1">คน</span>
              </div>

              <div className="relative flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-zinc-600" />
                <p className="text-zinc-600 text-[11px]">
                  ยอดรวม{" "}
                  <span className="text-zinc-500 font-semibold">
                    {totalDraws.toLocaleString("th-TH")}
                  </span>{" "}
                  คน ทั้งหมด
                </p>
              </div>
            </motion.div>

            {/* ── Card 2: Today red ── */}
            <motion.div
              custom={1}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02, y: -3 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              className="relative overflow-hidden rounded-xl bg-red-950/40 backdrop-blur-sm
                         border border-red-900/50 p-5 group cursor-default"
            >
              {/* Layered red glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/25 via-red-950/10 to-transparent" />
              <div
                className="absolute top-0 right-0 w-32 h-32 bg-red-600/8 rounded-full
                              translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform duration-500"
              />
              {/* Top edge accent */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />

              <div className="relative flex items-start justify-between mb-4">
                <div>
                  <p className="text-red-300 text-[11px] font-semibold uppercase tracking-widest leading-none mb-1">
                    ใบแดงวันนี้
                  </p>
                  <p className="text-red-500/50 text-[10px] tracking-wide">
                    Red Slips Today
                  </p>
                </div>
                <div className="p-2 bg-red-600/20 rounded-lg border border-red-700/40 shrink-0">
                  <TrendingUp className="w-5 h-5 text-red-400" />
                </div>
              </div>

              <div className="relative flex items-end gap-2 mb-3">
                <AnimatedNumber
                  value={todayRed}
                  className="text-4xl sm:text-5xl font-black text-red-400 leading-none"
                />
                <span className="text-red-400/60 text-sm mb-1">ใบ</span>
              </div>

              <div className="relative">
                <p className="text-red-500/60 text-[11px]">
                  คิดเป็น{" "}
                  <span className="text-red-400/80 font-bold">
                    {todayRedPct.toFixed(1)}%
                  </span>{" "}
                  ของวันนี้
                </p>
              </div>
            </motion.div>

            {/* ── Card 3: Today black ── */}
            <motion.div
              custom={2}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02, y: -3 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              className="relative overflow-hidden rounded-xl bg-zinc-900/80 backdrop-blur-sm
                         border border-amber-900/25 p-5 group cursor-default"
            >
              {/* Subtle gold glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-transparent" />
              <div
                className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full
                              translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform duration-500"
              />
              {/* Top edge accent */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-600/30 to-transparent" />

              <div className="relative flex items-start justify-between mb-4">
                <div>
                  <p className="text-amber-400/80 text-[11px] font-semibold uppercase tracking-widest leading-none mb-1">
                    ใบดำวันนี้
                  </p>
                  <p className="text-amber-600/40 text-[10px] tracking-wide">
                    Black Slips Today
                  </p>
                </div>
                <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-700/25 shrink-0">
                  <BarChart3 className="w-5 h-5 text-amber-500" />
                </div>
              </div>

              <div className="relative flex items-end gap-2 mb-3">
                <AnimatedNumber
                  value={todayBlack}
                  className="text-4xl sm:text-5xl font-black text-zinc-100 leading-none"
                />
                <span className="text-zinc-400 text-sm mb-1">ใบ</span>
              </div>

              <div className="relative">
                <p className="text-zinc-500 text-[11px]">
                  คิดเป็น{" "}
                  <span className="text-zinc-400 font-bold">
                    {todayBlackPct.toFixed(1)}%
                  </span>{" "}
                  ของวันนี้
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Red vs Black ratio bar ── */}
      <AnimatePresence>
        {!isLoading && todayTotal > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-4"
          >
            <div className="flex justify-between items-center mb-2.5">
              {/* Red label */}
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-600" />
                <span className="text-red-400 text-xs font-semibold">
                  ใบแดง {todayRedPct.toFixed(1)}%
                </span>
              </div>
              {/* Center label */}
              <span className="text-zinc-600 text-[11px] tracking-wider">
                สัดส่วนวันนี้
              </span>
              {/* Black label */}
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-300 text-xs font-semibold">
                  ใบดำ {todayBlackPct.toFixed(1)}%
                </span>
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-zinc-600 border border-amber-800/30" />
              </div>
            </div>

            <RatioBar redPct={todayRedPct} blackPct={todayBlackPct} />

            {/* Count labels below bar */}
            <div className="flex justify-between mt-2">
              <span className="text-red-500/60 text-[10px]">
                {todayRed.toLocaleString("th-TH")} คน
              </span>
              <span className="text-zinc-600 text-[10px]">
                {todayBlack.toLocaleString("th-TH")} คน
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cumulative bottom row ── */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="mini-skeletons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-3 gap-3"
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse h-[72px] rounded-lg bg-zinc-900/70 border border-zinc-800/60"
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="mini-cards"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="grid grid-cols-3 gap-3"
          >
            {/* Total cumulative */}
            <MiniCard
              label="ยอดรวมทั้งหมด"
              value={totalDraws.toLocaleString("th-TH")}
              sublabel="คน (สะสม)"
              valueClassName="text-zinc-200"
              className="bg-zinc-900/60 border-zinc-800/80"
            />

            {/* Total red % */}
            <MiniCard
              label="ใบแดง (รวม)"
              value=""
              sublabel={`${totalRed.toLocaleString("th-TH")} คน`}
              valueClassName="text-red-400"
              className="bg-red-950/30 border-red-900/30"
              isPercent
              percentValue={totalRedPct}
            />

            {/* Total black % */}
            <MiniCard
              label="ใบดำ (รวม)"
              value=""
              sublabel={`${totalBlack.toLocaleString("th-TH")} คน`}
              valueClassName="text-zinc-200"
              className="bg-zinc-900/60 border-amber-900/20"
              isPercent
              percentValue={totalBlackPct}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Trend footer ── */}
      <AnimatePresence>
        {!isLoading && stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.65 }}
            className="flex items-center justify-between px-1"
          >
            <div className="flex items-center gap-1.5 text-zinc-700 text-[11px]">
              <TrendingDown className="w-3 h-3 text-zinc-700" />
              <span>
                อัตราใบแดงรวม{" "}
                <span
                  className={
                    totalRedPct > 50
                      ? "text-red-500 font-semibold"
                      : "text-zinc-500 font-semibold"
                  }
                >
                  {totalRedPct.toFixed(2)}%
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-700 text-[11px]">
              <span>
                อัตราใบดำรวม{" "}
                <span className="text-zinc-500 font-semibold">
                  {totalBlackPct.toFixed(2)}%
                </span>
              </span>
              <TrendingUp className="w-3 h-3 text-zinc-700" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
