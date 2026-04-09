"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Loader2, RotateCcw, AlertTriangle } from "lucide-react";
import type { BucketState, GamePhase, DrawResult } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BucketSceneProps {
  bucketState: BucketState;
  phase: GamePhase;
  onDraw: () => void;
  onReset: () => void;
}

// ─── Slip configuration ───────────────────────────────────────────────────────

const SLIP_CONFIGS = [
  { cx: 58, cy: 89, angle: -22, isRed: true },
  { cx: 72, cy: 84, angle: -11, isRed: false },
  { cx: 85, cy: 81, angle: 6, isRed: false },
  { cx: 97, cy: 79, angle: -4, isRed: true },
  { cx: 110, cy: 79, angle: 9, isRed: false },
  { cx: 122, cy: 81, angle: -7, isRed: true },
  { cx: 135, cy: 84, angle: 13, isRed: false },
  { cx: 149, cy: 89, angle: -19, isRed: false },
  { cx: 65, cy: 86, angle: -28, isRed: true },
  { cx: 90, cy: 80, angle: 17, isRed: false },
  { cx: 112, cy: 80, angle: -14, isRed: true },
  { cx: 130, cy: 83, angle: 23, isRed: false },
] as const;

// ─── SVG Bucket ───────────────────────────────────────────────────────────────

function MilitaryBucket({
  slipCount,
  phase,
}: {
  slipCount: number;
  phase: GamePhase;
}) {
  const visibleSlips = SLIP_CONFIGS.slice(
    0,
    Math.max(0, Math.min(12, slipCount)),
  );

  return (
    <svg
      viewBox="0 0 200 264"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.7))" }}
    >
      <defs>
        {/* Bucket body gradient – olive military green with left-side lighting */}
        <linearGradient id="bdy" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#141D0D" />
          <stop offset="22%" stopColor="#243418" />
          <stop offset="48%" stopColor="#35491F" />
          <stop offset="76%" stopColor="#253618" />
          <stop offset="100%" stopColor="#111908" />
        </linearGradient>

        {/* Gold/brass band gradient */}
        <linearGradient id="band" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8CC60" />
          <stop offset="35%" stopColor="#C8A838" />
          <stop offset="70%" stopColor="#A88820" />
          <stop offset="100%" stopColor="#886810" />
        </linearGradient>

        {/* Rim outer gradient */}
        <linearGradient id="rim" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ECD870" />
          <stop offset="40%" stopColor="#C8A840" />
          <stop offset="100%" stopColor="#907020" />
        </linearGradient>

        {/* Bottom face gradient */}
        <linearGradient id="btm" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1C2A10" />
          <stop offset="100%" stopColor="#0C1408" />
        </linearGradient>

        {/* Specular sheen on left face */}
        <linearGradient id="sheen" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.00)" />
          <stop offset="18%" stopColor="rgba(255,255,255,0.07)" />
          <stop offset="38%" stopColor="rgba(255,255,255,0.02)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
        </linearGradient>

        {/* Red slip gradient */}
        <linearGradient id="redSlip" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#EF3030" />
          <stop offset="100%" stopColor="#B01818" />
        </linearGradient>

        {/* Dark slip gradient */}
        <linearGradient id="darkSlip" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2A2A2A" />
          <stop offset="100%" stopColor="#111111" />
        </linearGradient>

        {/* Clip path for body – clips metal bands to bucket silhouette */}
        <clipPath id="bodyClip">
          <path d="M 24 92 L 176 92 L 160 224 L 40 224 Z" />
        </clipPath>

        {/* Inner glow filter for drawing phase */}
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Ground shadow ───────────────────────────────────────────────────── */}
      <ellipse cx="100" cy="252" rx="66" ry="9" fill="rgba(0,0,0,0.55)" />

      {/* ── Bottom face (rendered behind body so lower arc shows) ───────────── */}
      <ellipse cx="100" cy="224" rx="60" ry="10" fill="url(#btm)" />

      {/* ── Bucket body ─────────────────────────────────────────────────────── */}
      <path d="M 24 92 L 176 92 L 160 224 L 40 224 Z" fill="url(#bdy)" />

      {/* Specular sheen overlay */}
      <path d="M 24 92 L 176 92 L 160 224 L 40 224 Z" fill="url(#sheen)" />

      {/* Right-side shadow for cylindrical depth */}
      <path
        d="M 138 92 L 176 92 L 160 224 L 126 224 Z"
        fill="rgba(0,0,0,0.22)"
      />

      {/* ── Metal bands (clipped to body silhouette) ─────────────────────────── */}
      <g clipPath="url(#bodyClip)">
        {/* Upper band */}
        <ellipse
          cx="100"
          cy="133"
          rx="72"
          ry="9"
          fill="none"
          stroke="url(#band)"
          strokeWidth="8"
        />
        {/* Lower band */}
        <ellipse
          cx="100"
          cy="178"
          rx="65"
          ry="8"
          fill="none"
          stroke="url(#band)"
          strokeWidth="7"
        />
        {/* Band highlight lines */}
        <ellipse
          cx="100"
          cy="131"
          rx="72"
          ry="9"
          fill="none"
          stroke="rgba(255,220,120,0.25)"
          strokeWidth="1.5"
        />
        <ellipse
          cx="100"
          cy="176"
          rx="65"
          ry="8"
          fill="none"
          stroke="rgba(255,220,120,0.25)"
          strokeWidth="1.5"
        />
      </g>

      {/* Bottom rim band */}
      <ellipse
        cx="100"
        cy="224"
        rx="60"
        ry="10"
        fill="none"
        stroke="url(#band)"
        strokeWidth="4"
        opacity="0.7"
      />

      {/* ── Engraved label ──────────────────────────────────────────────────── */}
      <text
        x="100"
        y="158"
        textAnchor="middle"
        fill="rgba(255,255,255,0.10)"
        fontSize="9.5"
        fontFamily="serif"
        letterSpacing="3"
        fontWeight="bold"
      >
        เกณฑ์ทหาร
      </text>
      <text
        x="100"
        y="170"
        textAnchor="middle"
        fill="rgba(255,255,255,0.06)"
        fontSize="7"
        fontFamily="serif"
        letterSpacing="1.5"
      >
        MILITARY DRAFT
      </text>

      {/* ── Paper slips (rendered BEFORE rim so rim covers bases) ────────────── */}
      {visibleSlips.map((slip, i) => (
        <g
          key={i}
          transform={`translate(${slip.cx},${slip.cy}) rotate(${slip.angle})`}
          style={{
            animation: `slipFloat${i % 4} ${2.2 + (i % 5) * 0.4}s ease-in-out ${(i * 0.17) % 1.2}s infinite`,
          }}
        >
          {/* Slip body */}
          <rect
            x="-5"
            y="-28"
            width="10"
            height="30"
            rx="1.5"
            fill={slip.isRed ? "url(#redSlip)" : "url(#darkSlip)"}
            stroke={slip.isRed ? "rgba(255,100,100,0.5)" : "rgba(80,80,80,0.4)"}
            strokeWidth="0.6"
          />
          {/* Fold crease line */}
          <line
            x1="-5"
            y1="-24"
            x2="5"
            y2="-24"
            stroke={
              slip.isRed ? "rgba(255,160,160,0.4)" : "rgba(100,100,100,0.3)"
            }
            strokeWidth="0.7"
          />
          {/* Small text mark on slip */}
          <rect
            x="-3"
            y="-20"
            width="6"
            height="1"
            rx="0.5"
            fill={
              slip.isRed ? "rgba(255,200,200,0.25)" : "rgba(150,150,150,0.2)"
            }
          />
          <rect
            x="-3"
            y="-17"
            width="4"
            height="1"
            rx="0.5"
            fill={
              slip.isRed ? "rgba(255,200,200,0.20)" : "rgba(150,150,150,0.15)"
            }
          />
        </g>
      ))}

      {/* ── Top rim (gold band – covers slip bases) ─────────────────────────── */}
      <ellipse cx="100" cy="90" rx="78" ry="15" fill="url(#rim)" />
      {/* Rim top highlight */}
      <ellipse
        cx="100"
        cy="88"
        rx="76"
        ry="12"
        fill="none"
        stroke="rgba(255,240,160,0.35)"
        strokeWidth="1.2"
      />

      {/* ── Inner opening (dark void) ───────────────────────────────────────── */}
      <ellipse cx="100" cy="90" rx="70" ry="11" fill="#060806" />
      <ellipse cx="100" cy="91" rx="62" ry="8.5" fill="#040604" />
      {/* Subtle inner glow rim */}
      <ellipse
        cx="100"
        cy="90"
        rx="70"
        ry="11"
        fill="none"
        stroke="rgba(0,0,0,0.8)"
        strokeWidth="2"
      />

      {/* ── Handles ─────────────────────────────────────────────────────────── */}
      {/* Left handle */}
      <path
        d="M 25 114 Q 4 90 25 66"
        stroke="url(#band)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <circle
        cx="25"
        cy="114"
        r="5"
        fill="url(#band)"
        stroke="#6A5010"
        strokeWidth="0.8"
      />
      <circle
        cx="25"
        cy="66"
        r="5"
        fill="url(#band)"
        stroke="#6A5010"
        strokeWidth="0.8"
      />
      {/* Left handle inner shadow line */}
      <path
        d="M 25 114 Q 4 90 25 66"
        stroke="rgba(0,0,0,0.3)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Right handle */}
      <path
        d="M 175 114 Q 196 90 175 66"
        stroke="url(#band)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <circle
        cx="175"
        cy="114"
        r="5"
        fill="url(#band)"
        stroke="#6A5010"
        strokeWidth="0.8"
      />
      <circle
        cx="175"
        cy="66"
        r="5"
        fill="url(#band)"
        stroke="#6A5010"
        strokeWidth="0.8"
      />
      <path
        d="M 175 114 Q 196 90 175 66"
        stroke="rgba(0,0,0,0.3)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

      {/* ── Phase-reactive inner glow (drawing state) ───────────────────────── */}
      {phase === "drawing" && (
        <ellipse
          cx="100"
          cy="90"
          rx="68"
          ry="10"
          fill="rgba(220,60,20,0.08)"
          filter="url(#glow)"
        />
      )}

      {/* Inline CSS for slip float animations */}
      <style>{`
        @keyframes slipFloat0 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-2.5px)} }
        @keyframes slipFloat1 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-2px)} }
        @keyframes slipFloat2 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-3px)} }
        @keyframes slipFloat3 { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-1.5px)} }
      `}</style>
    </svg>
  );
}

// ─── Floating atmosphere particles ───────────────────────────────────────────

function AtmosphereParticles({ active }: { active: boolean }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        left: `${8 + ((i * 9) % 84)}%`,
        size: 2 + (i % 3),
        delay: `${(i * 0.38) % 3.2}s`,
        dur: `${3.5 + (i % 4) * 0.8}s`,
        opacity: 0.15 + (i % 5) * 0.04,
      })),
    [],
  );

  if (!active) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-red-500"
          style={{
            left: p.left,
            bottom: "15%",
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `particleRise ${p.dur} ease-in ${p.delay} infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes particleRise {
          0%   { transform: translateY(0)   scale(1);   opacity: var(--op, 0.18); }
          70%  { transform: translateY(-140px) scale(1.2); opacity: var(--op, 0.18); }
          100% { transform: translateY(-200px) scale(0);   opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Draw Button ──────────────────────────────────────────────────────────────

function DrawButton({
  phase,
  onDraw,
}: {
  phase: GamePhase;
  onDraw: () => void;
}) {
  const isDrawing = phase === "drawing";
  const isDisabled = phase !== "ready" && phase !== "result";

  return (
    <div className="relative flex items-center justify-center">
      {/* Pulsing outer glow (only when ready) */}
      {phase === "ready" && (
        <>
          <motion.div
            className="absolute rounded-2xl bg-red-600/20 pointer-events-none"
            style={{ inset: -8 }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-2xl bg-red-700/15 pointer-events-none"
            style={{ inset: -16 }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.25, 0.5, 0.25] }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4,
            }}
          />
        </>
      )}

      <motion.button
        whileHover={!isDisabled ? { scale: 1.04, y: -2 } : {}}
        whileTap={!isDisabled ? { scale: 0.96 } : {}}
        onClick={onDraw}
        disabled={isDisabled}
        className="relative overflow-hidden rounded-2xl px-10 py-4 font-bold text-lg text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 select-none"
        style={{ minWidth: 220 }}
      >
        {/* Base gradient */}
        <div className="absolute inset-0 bg-linear-to-r from-red-800 via-red-700 to-red-800" />
        {/* Hover gradient layer */}
        <div className="absolute inset-0 bg-linear-to-r from-red-700 via-red-600 to-red-700 opacity-0 hover:opacity-100 transition-opacity duration-300" />
        {/* Top edge highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-red-300/40 to-transparent" />
        {/* Bottom edge shadow */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-black/30" />

        {/* Content */}
        <span className="relative flex items-center justify-center gap-2.5">
          {isDrawing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>กำลังล้วง...</span>
            </>
          ) : (
            <span>ล้วงสลาก</span>
          )}
        </span>
      </motion.button>
    </div>
  );
}

// ─── History Strip ────────────────────────────────────────────────────────────

function HistoryStrip({ history }: { history: DrawResult[] }) {
  const recent = history.slice(-10).reverse();

  if (recent.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-white/25 text-xs tracking-wider uppercase">
        ประวัติการจับ
      </p>
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        <AnimatePresence mode="popLayout">
          {recent.map((draw, i) => (
            <motion.div
              key={draw.timestamp + i}
              layout
              initial={{ opacity: 0, x: -20, scale: 0.6 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className={`relative px-2 h-6 rounded-md border flex items-center justify-center shrink-0 ${
                draw.type === "red"
                  ? "bg-red-700/80 border-red-500/50"
                  : "bg-zinc-800/80 border-zinc-600/40"
              }`}
              title={draw.type === "red" ? "ใบแดง" : "ใบดำ"}
            >
              <span className={`text-[9px] font-bold ${draw.type === "red" ? "text-red-100" : "text-white"}`}>
                {draw.type === "red" ? "แดง" : "ดำ"}
              </span>
              {/* Recency fade: newest (i=0) is fully opaque */}
              <div
                className="absolute inset-0 rounded-md bg-black pointer-events-none"
                style={{ opacity: Math.min(i * 0.06, 0.45) }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {/* Red/Black count summary */}
      {recent.length >= 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 text-xs text-white/30"
        >
          <span className="text-red-400/60">
            ใบแดง: {recent.filter((d) => d.type === "red").length}
          </span>
          <span className="text-white/15">|</span>
          <span className="text-zinc-400/60">
            ใบดำ: {recent.filter((d) => d.type === "black").length}
          </span>
        </motion.div>
      )}
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ bucketState }: { bucketState: BucketState }) {
  const { redRemaining, blackRemaining, totalRemaining, initialTotal } =
    bucketState;
  const pctLeft =
    initialTotal > 0 ? Math.round((totalRemaining / initialTotal) * 100) : 0;

  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
        <span className="text-white/50 text-sm">
          ใบแดง <span className="text-red-400 font-bold">{redRemaining}</span>
        </span>
      </div>
      <div className="w-px h-4 bg-white/10" />
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
        <span className="text-white/50 text-sm">
          ใบดำ <span className="text-zinc-300 font-bold">{blackRemaining}</span>
        </span>
      </div>
      <div className="w-px h-4 bg-white/10" />
      <div className="flex items-center gap-1.5">
        <span className="text-white/30 text-sm">
          เหลือ{" "}
          <span className="text-white/60 font-bold">{totalRemaining}</span> ใบ (
          {pctLeft}%)
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BucketScene({
  bucketState,
  phase,
  onDraw,
  onReset,
}: BucketSceneProps) {
  const { totalRemaining, initialTotal, drawHistory } = bucketState;

  // Slip count: how many slips visually poke out of bucket
  const slipCount = useMemo(() => {
    if (initialTotal <= 0 || totalRemaining <= 0) return 0;
    return Math.max(1, Math.round((totalRemaining / initialTotal) * 12));
  }, [totalRemaining, initialTotal]);

  // Last draw result for glow coloring
  const lastDraw = drawHistory[drawHistory.length - 1];
  const isLastRed = lastDraw?.type === "red";

  // ── Bucket container animation variants ────────────────────────────────────
  const bucketAnimate = (() => {
    if (phase === "drawing") {
      return {
        x: [-7, 7, -6, 6, -4, 4, -2, 2, 0],
        rotate: [-4, 4, -3, 3, -2, 2, -1, 1, 0],
      };
    }
    if (phase === "ready") {
      return { rotate: [-0.7, 0.7] };
    }
    return { x: 0, rotate: 0 };
  })();

  const bucketTransition = (() => {
    if (phase === "drawing") {
      return { duration: 0.45, repeat: 2, repeatType: "loop" as const };
    }
    if (phase === "ready") {
      return {
        duration: 3.2,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut" as const,
      };
    }
    return { duration: 0.35, ease: "easeOut" as const };
  })();

  // ── Background glow color ───────────────────────────────────────────────────
  const glowClass = (() => {
    if (phase === "empty") return "bg-zinc-700/15";
    if (phase === "revealing" || (phase === "result" && isLastRed))
      return "bg-red-700/30";
    if (phase === "result" && !isLastRed) return "bg-zinc-700/20";
    return "bg-red-950/25";
  })();

  return (
    <div className="relative flex flex-col items-center gap-6 w-full select-none">
      {/* ── Background atmosphere glow ────────────────────────────────────── */}
      <motion.div
        className={`absolute rounded-full blur-3xl pointer-events-none transition-colors duration-700 ${glowClass}`}
        style={{
          width: "130%",
          height: "70%",
          left: "-15%",
          top: "5%",
          zIndex: 0,
        }}
        animate={{ scale: phase === "drawing" ? [1, 1.08, 1] : 1 }}
        transition={{
          duration: 0.45,
          repeat: phase === "drawing" ? Infinity : 0,
        }}
      />

      {/* Floating particles (shown when active/ready/result) */}
      <AtmosphereParticles active={phase === "ready" || phase === "result"} />

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: phase === "selecting" ? 0.3 : 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative z-10 w-full"
      >
        <StatsBar bucketState={bucketState} />
      </motion.div>

      {/* ── Bucket ─────────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full flex justify-center">
        <motion.div
          animate={bucketAnimate}
          transition={bucketTransition}
          className="relative"
          style={{ width: "min(280px, 72vw)", aspectRatio: "200/264" }}
        >
          <MilitaryBucket slipCount={slipCount} phase={phase} />

          {/* 'empty' bucket overlay – dark film over opening */}
          <AnimatePresence>
            {phase === "empty" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-end justify-center pb-[38%] pointer-events-none"
              >
                <div className="bg-black/30 rounded-full px-3 py-1">
                  <span className="text-white/40 text-xs font-medium">
                    ว่างเปล่า
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Draw button / Phase actions ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="relative z-10 w-full flex flex-col items-center gap-3"
      >
        <AnimatePresence mode="wait">
          {/* SELECTING – placeholder */}
          {phase === "selecting" && (
            <motion.div
              key="selecting-msg"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="px-6 py-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm text-center"
            >
              <p className="text-white/40 text-sm leading-relaxed">
                กรุณาเลือกจังหวัดและอำเภอก่อน
                <br />
                <span className="text-white/25 text-xs">
                  เพื่อเริ่มจำลองการเกณฑ์ทหาร
                </span>
              </p>
            </motion.div>
          )}

          {/* READY / DRAWING / RESULT – draw button */}
          {(phase === "ready" ||
            phase === "drawing" ||
            phase === "revealing" ||
            phase === "result") && (
            <motion.div
              key="draw-btn"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-3 w-full"
            >
              <DrawButton phase={phase} onDraw={onDraw} />
              {/* Result sub-action: reset / draw again */}
              {phase === "result" && (
                <motion.button
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onReset}
                  className="flex items-center gap-2 text-white/35 hover:text-white/60 text-sm border border-white/10 hover:border-white/20 rounded-xl px-5 py-2 transition-all duration-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  เริ่มใหม่ทั้งหมด
                </motion.button>
              )}
            </motion.div>
          )}

          {/* EMPTY – all slips drawn */}
          {phase === "empty" && (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-4 px-6 py-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl text-center"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-800/80 border border-white/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-500/80" />
              </div>
              <div>
                <p className="text-white font-bold text-lg mb-1">
                  สลากหมดแล้ว!
                </p>
                <p className="text-white/40 text-sm">
                  การเกณฑ์ทหารรอบนี้สิ้นสุดแล้ว
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onReset}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/25 text-white font-medium rounded-xl px-6 py-2.5 transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                เริ่มการเกณฑ์ใหม่
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Draw history strip ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {drawHistory.length > 0 && phase !== "selecting" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 w-full"
          >
            <HistoryStrip history={drawHistory} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
