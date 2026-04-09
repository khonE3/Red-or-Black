'use client'

import { useEffect } from 'react'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion'
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Target,
  Layers,
  Flame,
  ShieldCheck,
} from 'lucide-react'

// ─── Props ────────────────────────────────────────────────────────────────────
interface OddsDisplayProps {
  redRemaining: number
  blackRemaining: number
  totalRemaining: number
  initialTotal: number
}

// ─── Animated percentage that smoothly transitions on value change ────────────
interface AnimatedPercentProps {
  value: number
  className?: string
  decimals?: number
}

function AnimatedPercent({ value, className, decimals = 1 }: AnimatedPercentProps) {
  const motionVal = useMotionValue(0)
  const display = useTransform(motionVal, (v) => v.toFixed(decimals) + '%')

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1],
    })
    return controls.stop
  }, [value, motionVal])

  return <motion.span className={className}>{display}</motion.span>
}

// ─── Animated integer count ───────────────────────────────────────────────────
interface AnimatedCountProps {
  value: number
  className?: string
}

function AnimatedCount({ value, className }: AnimatedCountProps) {
  const motionVal = useMotionValue(0)
  const display = useTransform(motionVal, (v) =>
    Math.round(v).toLocaleString('th-TH')
  )

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    })
    return controls.stop
  }, [value, motionVal])

  return <motion.span className={className}>{display}</motion.span>
}

// ─── Circular arc progress (SVG) ─────────────────────────────────────────────
interface CircularOddsProps {
  blackOdds: number   // 0-100
  redOdds: number     // 0-100
  size?: number
}

function CircularOdds({ blackOdds, redOdds, size = 140 }: CircularOddsProps) {
  const radius = (size - 18) / 2
  const circumference = 2 * Math.PI * radius
  const cx = size / 2
  const cy = size / 2

  // Black arc goes clockwise from top; red fills the rest
  const blackDash = (blackOdds / 100) * circumference
  const redDash   = (redOdds   / 100) * circumference

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="drop-shadow-lg"
      style={{ transform: 'rotate(-90deg)' }}
    >
      {/* Track */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="#18181b"
        strokeWidth={14}
      />

      {/* Black arc */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="url(#blackGrad)"
        strokeWidth={14}
        strokeLinecap="butt"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - blackDash }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
      />

      {/* Red arc – starts after black portion */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="url(#redGrad)"
        strokeWidth={14}
        strokeLinecap="butt"
        strokeDasharray={`${redDash} ${circumference}`}
        initial={{ strokeDashoffset: 0 }}
        animate={{ strokeDashoffset: -blackDash }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
      />

      <defs>
        <linearGradient id="blackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#52525b" />
          <stop offset="100%" stopColor="#a1a1aa" />
        </linearGradient>
        <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#991b1b" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ─── Horizontal split probability bar ─────────────────────────────────────────
interface SplitBarProps {
  blackOdds: number
  redOdds: number
  isWarning: boolean
}

function SplitBar({ blackOdds, redOdds, isWarning }: SplitBarProps) {
  return (
    <div className="relative h-4 bg-zinc-800/80 rounded-full overflow-hidden">
      {/* Black portion (left) */}
      <motion.div
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-zinc-600 via-zinc-500 to-zinc-400 rounded-l-full"
        initial={{ width: 0 }}
        animate={{ width: `${blackOdds}%` }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
      />
      {/* Red portion (right) */}
      <motion.div
        className={`absolute inset-y-0 right-0 rounded-r-full ${
          isWarning
            ? 'bg-gradient-to-l from-red-500 via-red-600 to-red-700'
            : 'bg-gradient-to-l from-red-800 via-red-700 to-red-900'
        }`}
        initial={{ width: 0 }}
        animate={{ width: `${redOdds}%` }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
      />
      {/* Divider glow at split point */}
      <motion.div
        className="absolute inset-y-0 w-0.5 bg-zinc-950/80"
        animate={{ left: `${blackOdds}%` }}
        transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-20 rounded-xl
                 bg-zinc-900/60 border border-zinc-800 text-center gap-4"
    >
      <motion.div
        animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
        transition={{ duration: 1.5, delay: 0.3, ease: 'easeInOut' }}
        className="text-6xl"
      >
        🪣
      </motion.div>
      <div>
        <p className="text-xl font-bold text-zinc-200">ถังสลากว่างเปล่าแล้ว</p>
        <p className="text-zinc-500 text-sm mt-1">All slips have been drawn</p>
      </div>
      <div className="flex items-center gap-2 bg-zinc-800/60 border border-zinc-700/50 rounded-full px-4 py-1.5">
        <Layers className="w-4 h-4 text-zinc-500" />
        <span className="text-zinc-400 text-xs font-medium">การจับสลากสิ้นสุดแล้ว</span>
      </div>
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function OddsDisplay({
  redRemaining,
  blackRemaining,
  totalRemaining,
  initialTotal,
}: OddsDisplayProps) {
  const isEmpty      = totalRemaining === 0
  const blackOdds    = isEmpty ? 0 : (blackRemaining / totalRemaining) * 100
  const redOdds      = isEmpty ? 0 : (redRemaining   / totalRemaining) * 100
  const isRedWarning = redOdds > 30
  const isBlackGreat = blackOdds > 80
  const usedCount    = initialTotal - totalRemaining
  const usedPct      = initialTotal > 0 ? (usedCount / initialTotal) * 100 : 0
  const remainPct    = 100 - usedPct

  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className="w-full space-y-4"
    >
      {/* ── Section header ── */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-700/20">
          <Target className="w-4 h-4 text-amber-500" />
        </div>
        <h2 className="text-base sm:text-lg font-bold text-zinc-100 tracking-wide">
          โอกาสสลาก
        </h2>
        <span className="hidden sm:inline text-zinc-600 text-xs tracking-wider">
          Live Odds Calculator
        </span>
      </div>

      {/* ── Main content with AnimatePresence ── */}
      <AnimatePresence mode="wait">
        {isEmpty ? (
          <EmptyState key="empty-state" />
        ) : (
          <motion.div
            key="odds-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
          >
            {/* ── Red warning banner ── */}
            <AnimatePresence>
              {isRedWarning && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2.5 bg-red-950/50 border border-red-700/50
                                  rounded-xl px-4 py-3">
                    <Flame className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
                    <div>
                      <p className="text-red-300 text-sm font-bold">
                        ⚠ คำเตือน: โอกาสได้ใบแดงสูงกว่า 30%
                      </p>
                      <p className="text-red-400/60 text-xs mt-0.5">
                        Red slip probability exceeds safe threshold
                      </p>
                    </div>
                    <div className="ml-auto shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-500 animate-bounce" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Two main probability cards + circle ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">

              {/* ── Black (safe) card ── */}
              <motion.div
                layout
                className="relative overflow-hidden rounded-xl bg-zinc-900/80 backdrop-blur-sm
                           border border-amber-900/30 p-5 flex flex-col gap-4"
              >
                {/* Subtle top accent */}
                <div className="absolute top-0 left-0 right-0 h-[1px]
                                bg-gradient-to-r from-transparent via-amber-700/30 to-transparent" />
                {/* Corner glow */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-zinc-700/5 rounded-full
                                translate-x-10 translate-y-10" />

                {/* Card header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-zinc-700/30 rounded-lg border border-zinc-700/30">
                      <TrendingDown className="w-4 h-4 text-zinc-300" />
                    </div>
                    <div>
                      <p className="text-zinc-200 text-sm font-bold leading-none">
                        โอกาสได้ใบดำ
                      </p>
                      <p className="text-zinc-500 text-[11px] mt-0.5">รอด · Black Slip</p>
                    </div>
                  </div>

                  {/* "ดีกว่าค่าเฉลี่ย" badge */}
                  <AnimatePresence>
                    {isBlackGreat && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.7, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                        className="inline-flex items-center gap-1 bg-emerald-900/50 border
                                   border-emerald-700/50 text-emerald-400 text-[10px] font-bold
                                   px-2 py-1 rounded-full shrink-0"
                      >
                        <CheckCircle className="w-3 h-3" />
                        ดีกว่าค่าเฉลี่ย
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Large percentage */}
                <div className="flex items-end gap-2">
                  <AnimatedPercent
                    value={blackOdds}
                    decimals={1}
                    className="text-5xl sm:text-6xl font-black text-zinc-100 leading-none tabular-nums"
                  />
                  <ShieldCheck className={`w-6 h-6 mb-1 ${isBlackGreat ? 'text-emerald-500' : 'text-zinc-600'}`} />
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-zinc-600 via-zinc-500 to-zinc-300 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${blackOdds}%` }}
                      transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>

                {/* Count pill */}
                <div className="flex items-center gap-1.5 bg-zinc-800/50 border border-zinc-700/40
                                rounded-lg px-3 py-2 w-fit">
                  <span className="inline-block w-3 h-3 rounded-sm bg-zinc-700 border border-amber-800/30 shrink-0" />
                  <span className="text-zinc-400 text-xs">เหลือใบดำ</span>
                  <AnimatedCount
                    value={blackRemaining}
                    className="text-zinc-200 text-xs font-bold tabular-nums"
                  />
                  <span className="text-zinc-500 text-xs">ใบ</span>
                </div>
              </motion.div>

              {/* ── Center circular gauge ── */}
              <div className="flex flex-col items-center justify-center gap-2 px-2
                              lg:min-w-[160px]">
                <div className="relative">
                  <CircularOdds blackOdds={blackOdds} redOdds={redOdds} size={148} />
                  {/* Center overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest leading-none">
                      รวม
                    </span>
                    <AnimatedCount
                      value={totalRemaining}
                      className="text-xl font-black text-zinc-300 leading-tight tabular-nums"
                    />
                    <span className="text-[10px] text-zinc-600 leading-none">ใบ</span>
                  </div>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-zinc-500 inline-block" />
                    ดำ
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                    แดง
                  </span>
                </div>
              </div>

              {/* ── Red (drafted) card ── */}
              <motion.div
                layout
                className={`relative overflow-hidden rounded-xl backdrop-blur-sm p-5
                            flex flex-col gap-4 transition-colors duration-500
                            ${isRedWarning
                              ? 'bg-red-950/50 border border-red-700/60'
                              : 'bg-zinc-900/80 border border-red-900/20'
                            }`}
              >
                {/* Pulsing overlay when warning */}
                <AnimatePresence>
                  {isRedWarning && (
                    <motion.div
                      key="pulse-overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.06, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute inset-0 bg-red-500 pointer-events-none rounded-xl"
                    />
                  )}
                </AnimatePresence>

                {/* Top accent */}
                <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r
                                from-transparent to-transparent transition-colors duration-500
                                ${isRedWarning ? 'via-red-600/60' : 'via-red-900/30'}`} />

                {/* Card header */}
                <div className="flex items-start justify-between relative">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border
                                    ${isRedWarning
                                      ? 'bg-red-700/30 border-red-600/40'
                                      : 'bg-red-900/20 border-red-900/30'
                                    }`}>
                      <TrendingUp className={`w-4 h-4 ${isRedWarning ? 'text-red-400 animate-pulse' : 'text-red-600'}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold leading-none
                                    ${isRedWarning ? 'text-red-200' : 'text-red-400/80'}`}>
                        โอกาสได้ใบแดง
                      </p>
                      <p className={`text-[11px] mt-0.5
                                    ${isRedWarning ? 'text-red-400/60' : 'text-red-500/40'}`}>
                        เกณฑ์ · Red Slip
                      </p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isRedWarning && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        className="inline-flex items-center gap-1 bg-red-900/60 border
                                   border-red-600/50 text-red-300 text-[10px] font-bold
                                   px-2 py-1 rounded-full shrink-0"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        อันตราย
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Large percentage */}
                <div className="flex items-end gap-2 relative">
                  <AnimatedPercent
                    value={redOdds}
                    decimals={1}
                    className={`text-5xl sm:text-6xl font-black leading-none tabular-nums
                                ${isRedWarning ? 'text-red-400' : 'text-red-600/70'}`}
                  />
                  <Flame className={`w-6 h-6 mb-1 ${isRedWarning ? 'text-red-500 animate-pulse' : 'text-red-900'}`} />
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 relative">
                  <div className="h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        isRedWarning
                          ? 'bg-gradient-to-r from-red-800 via-red-600 to-red-400'
                          : 'bg-gradient-to-r from-red-950 to-red-800'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${redOdds}%` }}
                      transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>

                {/* Count pill */}
                <div className={`flex items-center gap-1.5 rounded-lg px-3 py-2 w-fit border
                                ${isRedWarning
                                  ? 'bg-red-900/30 border-red-700/40'
                                  : 'bg-zinc-800/50 border-red-900/30'
                                }`}>
                  <span className="inline-block w-3 h-3 rounded-sm bg-red-800 border border-red-600/40 shrink-0" />
                  <span className={`text-xs ${isRedWarning ? 'text-red-400/80' : 'text-zinc-500'}`}>
                    เหลือใบแดง
                  </span>
                  <AnimatedCount
                    value={redRemaining}
                    className={`text-xs font-bold tabular-nums ${isRedWarning ? 'text-red-300' : 'text-red-500'}`}
                  />
                  <span className={`text-xs ${isRedWarning ? 'text-red-500/60' : 'text-zinc-600'}`}>ใบ</span>
                </div>
              </motion.div>
            </div>

            {/* ── Split probability bar (full width) ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.45 }}
              className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 space-y-3"
            >
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-zinc-500 inline-block" />
                  <span className="text-zinc-300 font-semibold">
                    ใบดำ{' '}
                    <AnimatedPercent value={blackOdds} decimals={1} className="tabular-nums" />
                  </span>
                </div>
                <span className="text-zinc-600 tracking-wider">สัดส่วนที่เหลือ</span>
                <div className="flex items-center gap-1.5">
                  <span className={`font-semibold ${isRedWarning ? 'text-red-400' : 'text-red-500/80'}`}>
                    ใบแดง{' '}
                    <AnimatedPercent value={redOdds} decimals={1} className="tabular-nums" />
                  </span>
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-700 inline-block" />
                </div>
              </div>

              <SplitBar blackOdds={blackOdds} redOdds={redOdds} isWarning={isRedWarning} />

              <div className="flex justify-between text-[11px] text-zinc-600">
                <span>{blackRemaining.toLocaleString('th-TH')} ใบ</span>
                <span>{redRemaining.toLocaleString('th-TH')} ใบ</span>
              </div>
            </motion.div>

            {/* ── Progress used + remaining ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.45 }}
              className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-4"
            >
              <div className="grid grid-cols-3 gap-4 items-center">
                {/* Remaining */}
                <div className="text-center">
                  <p className="text-zinc-600 text-[11px] mb-1 uppercase tracking-wider">
                    คงเหลือในถัง
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <AnimatedCount
                      value={totalRemaining}
                      className="text-2xl font-black text-zinc-200 tabular-nums"
                    />
                    <span className="text-zinc-500 text-xs">ใบ</span>
                  </div>
                  <p className="text-zinc-700 text-[10px] mt-0.5">
                    {remainPct.toFixed(1)}% คงเหลือ
                  </p>
                </div>

                {/* Bar + labels */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-zinc-700">
                    <span>ดึงไปแล้ว</span>
                    <span>คงเหลือ</span>
                  </div>
                  <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${remainPct}%` }}
                      transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-600">
                    <span>{usedPct.toFixed(1)}%</span>
                    <span>{remainPct.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Used */}
                <div className="text-center">
                  <p className="text-zinc-600 text-[11px] mb-1 uppercase tracking-wider">
                    ใช้ไปแล้ว
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <AnimatedCount
                      value={usedCount}
                      className="text-2xl font-black text-zinc-500 tabular-nums"
                    />
                    <span className="text-zinc-600 text-xs">ใบ</span>
                  </div>
                  <p className="text-zinc-700 text-[10px] mt-0.5">
                    {usedPct.toFixed(1)}% ดึงแล้ว
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
