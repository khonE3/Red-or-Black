"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star } from "lucide-react";
import type { DrawResult } from "@/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface SlipRevealProps {
  result: DrawResult | null;
  isVisible: boolean;
  onClose: () => void;
  isRed: boolean;
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.28, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.35, ease: "easeIn" as const, delay: 0.05 },
  },
};

const cardVariants = {
  hidden: {
    scale: 0.22,
    opacity: 0,
    y: 140,
    rotateX: 55,
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: "spring" as const,
      stiffness: 175,
      damping: 17,
      delay: 0.12,
    },
  },
  exit: {
    scale: 0.75,
    opacity: 0,
    y: -50,
    rotateX: -25,
    transition: { duration: 0.28, ease: "easeIn" as const },
  },
};

const slipGraphicVariants = {
  hidden: { scale: 0, rotate: -20, opacity: 0 },
  visible: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 220,
      damping: 16,
      delay: 0.32,
    },
  },
};

const staggerContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.62,
    },
  },
};

const staggerItemVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.88 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 280,
      damping: 22,
    },
  },
};

// ─── Particle System ──────────────────────────────────────────────────────────

interface ParticleData {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  rotate: number;
  shape: "circle" | "square" | "star";
}

function useParticles(count: number): ParticleData[] {
  return useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      // Spread deterministically across x/y from center
      x: ((i * 53 + 19) % 260) - 130,
      y: -(((i * 79 + 37) % 90) / 90) * 320 - 40,
      delay: (i * 0.065) % 1.0,
      duration: 1.3 + (i % 7) * 0.22,
      size: 4 + (i % 5) * 2.5,
      opacity: 0.35 + (i % 6) * 0.1,
      rotate: (i * 41) % 360,
      shape: (["circle", "square", "star"] as const)[i % 3],
    }));
  }, [count]);
}

function Particles({
  particles,
  color,
  active,
}: {
  particles: ParticleData[];
  color: string;
  active: boolean;
}) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={
            p.shape === "square"
              ? "absolute rounded-sm"
              : "absolute rounded-full"
          }
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: color,
            x: 0,
            y: 0,
            position: "absolute",
          }}
          animate={{
            x: [0, p.x * 0.4, p.x],
            y: [0, p.y * 0.5, p.y],
            opacity: [0, p.opacity, p.opacity * 0.6, 0],
            scale: [0, 1.3, 0.9, 0.2],
            rotate: [0, p.rotate],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay + 0.35,
            ease: [0.2, 0, 0.8, 1],
            repeat: Infinity,
            repeatDelay: 2.0 + (p.id % 5) * 0.35,
          }}
        />
      ))}
    </div>
  );
}

// ─── Slip Paper Graphic ───────────────────────────────────────────────────────

function SlipPaper({ isRed }: { isRed: boolean }) {
  const borderColor = isRed ? "rgba(252,165,165,0.5)" : "rgba(234,179,8,0.6)";
  const bgGradient = isRed
    ? "linear-gradient(160deg, #DC2626 0%, #991B1B 55%, #7F1D1D 100%)"
    : "linear-gradient(160deg, #18181B 0%, #09090B 55%, #030712 100%)";
  const innerColor = isRed ? "rgba(255,180,180,0.18)" : "rgba(234,179,8,0.12)";
  const lineColor = isRed ? "rgba(255,200,200,0.3)" : "rgba(234,179,8,0.25)";
  const textColor = isRed ? "rgba(255,220,220,0.9)" : "rgba(234,179,8,0.9)";
  const glowColor = isRed
    ? "0 0 60px rgba(220,38,38,0.7), 0 12px 40px rgba(0,0,0,0.8)"
    : "0 0 60px rgba(234,179,8,0.5), 0 12px 40px rgba(0,0,0,0.9)";

  return (
    <motion.div
      variants={slipGraphicVariants}
      style={{
        width: 100,
        height: 136,
        borderRadius: 14,
        border: `2px solid ${borderColor}`,
        background: bgGradient,
        boxShadow: glowColor,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        flexShrink: 0,
      }}
    >
      {/* Corner fold effect */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 20,
          height: 20,
          background: `linear-gradient(225deg, rgba(0,0,0,0.4) 50%, transparent 50%)`,
        }}
      />
      {/* Inner glow layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 35% 30%, ${innerColor} 0%, transparent 65%)`,
        }}
      />
      {/* Decorative lines */}
      <div style={{ position: "absolute", left: 10, right: 10, top: 18 }}>
        {[0, 1, 2, 3, 4].map((n) => (
          <div
            key={n}
            style={{
              height: 1,
              background: lineColor,
              borderRadius: 1,
              marginBottom: n === 2 ? 8 : 5,
              width: n === 2 ? "80%" : n % 2 === 0 ? "90%" : "65%",
            }}
          />
        ))}
      </div>
      {/* Central star icon */}
      <Star
        style={{
          width: 24,
          height: 24,
          color: textColor,
          fill: textColor,
          marginTop: 28,
          flexShrink: 0,
        }}
      />
      {/* Thai text on slip */}
      <p
        style={{
          color: textColor,
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: 1,
          lineHeight: 1,
          textAlign: "center",
          textShadow: isRed
            ? "0 1px 8px rgba(255,100,100,0.6)"
            : "0 1px 8px rgba(234,179,8,0.5)",
        }}
      >
        {isRed ? "ใบแดง" : "ใบดำ"}
      </p>
    </motion.div>
  );
}

// ─── Countdown Ring ───────────────────────────────────────────────────────────

function CountdownRing({
  isRed,
  duration,
}: {
  isRed: boolean;
  duration: number;
}) {
  const strokeColor = isRed ? "#EF4444" : "#EAB308";
  const r = 18;
  const circ = 2 * Math.PI * r;

  return (
    <div className="relative w-10 h-10 flex items-center justify-center">
      <svg
        width="40"
        height="40"
        className="-rotate-90"
        style={{ position: "absolute" }}
      >
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="2.5"
        />
        <motion.circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: circ }}
          transition={{ duration, ease: "linear" }}
          style={{ opacity: 0.7 }}
        />
      </svg>
      <span className="relative text-white/40 text-xs font-medium">ปิด</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const AUTO_CLOSE_MS = 5000;

export default function SlipReveal({
  result,
  isVisible,
  onClose,
  isRed,
}: SlipRevealProps) {
  const particles = useParticles(26);

  // Auto-close timer
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isVisible) {
      timerRef.current = setTimeout(onClose, AUTO_CLOSE_MS);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isVisible, onClose]);

  // ── Theming ──────────────────────────────────────────────────────────────
  const particleColor = isRed ? "#EF4444" : "#EAB308";
  const glowBg = isRed ? "rgba(127,0,0,0.65)" : "rgba(8,8,14,0.80)";
  const cardBorderColor = isRed
    ? "rgba(239,68,68,0.55)"
    : "rgba(234,179,8,0.5)";
  const cardBgGradient = isRed
    ? "linear-gradient(170deg, #3B0000 0%, #1A0000 45%, #0D0000 100%)"
    : "linear-gradient(170deg, #141414 0%, #0A0A0A 45%, #050505 100%)";
  const outerGlow = isRed
    ? "0 0 120px rgba(220,38,38,0.35), 0 0 60px rgba(220,38,38,0.25)"
    : "0 0 120px rgba(234,179,8,0.20), 0 0 60px rgba(234,179,8,0.15)";

  const slipTypeLabelColor = isRed ? "#FECACA" : "#FDE047";
  const slipTypeShadow = isRed
    ? "0 0 60px rgba(239,68,68,0.9), 0 0 20px rgba(239,68,68,0.5)"
    : "0 0 60px rgba(234,179,8,0.8), 0 0 20px rgba(234,179,8,0.5)";

  const consequenceText = isRed ? "คุณต้องรับราชการทหาร" : "คุณได้รับการยกเว้น";
  const consequenceEmoji = isRed ? "⚔️" : "✅";
  const quote = isRed
    ? '"ชาติจะมั่นคง เมื่อลูกผู้ชายไม่ย่อท้อ"'
    : '"โชคดีที่สุดในวันนี้"';

  const closeBtnStyle: React.CSSProperties = {
    background: isRed ? "rgba(220,38,38,0.2)" : "rgba(234,179,8,0.15)",
    border: `1px solid ${isRed ? "rgba(239,68,68,0.45)" : "rgba(234,179,8,0.4)"}`,
    color: isRed ? "rgba(252,165,165,0.9)" : "rgba(253,224,71,0.9)",
  };

  return (
    <AnimatePresence>
      {isVisible && result && (
        <>
          {/* ── Screen flash (red result only) ──────────────────────────── */}
          {isRed && (
            <motion.div
              key="flash"
              className="fixed inset-0 pointer-events-none"
              style={{ backgroundColor: "#DC2626", zIndex: 55 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.22, 0.08, 0] }}
              transition={{
                duration: 0.5,
                times: [0, 0.25, 0.6, 1],
                delay: 0.1,
              }}
            />
          )}

          {/* ── Main overlay ─────────────────────────────────────────────── */}
          <motion.div
            key="slip-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 flex items-center justify-center p-4 sm:p-6"
            style={{
              backgroundColor: glowBg,
              backdropFilter: "blur(14px) saturate(1.2)",
              WebkitBackdropFilter: "blur(14px) saturate(1.2)",
              zIndex: 50,
            }}
            onClick={onClose}
          >
            {/* ── Particle burst ─────────────────────────────────────────── */}
            <Particles
              particles={particles}
              color={particleColor}
              active={true}
            />

            {/* ── Large ambient glow behind card ─────────────────────────── */}
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 380,
                height: 380,
                background: isRed
                  ? "radial-gradient(circle, rgba(220,38,38,0.25) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(234,179,8,0.18) 0%, transparent 70%)",
              }}
              animate={{
                scale: [0.8, 1.1, 0.9, 1.0],
                opacity: [0, 1, 0.8, 0.9],
              }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />

            {/* ── Card ───────────────────────────────────────────────────── */}
            <motion.div
              key="slip-card"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-xs sm:max-w-sm mx-auto rounded-3xl overflow-hidden"
              style={{
                border: `1.5px solid ${cardBorderColor}`,
                background: cardBgGradient,
                boxShadow: outerGlow + ", 0 30px 80px rgba(0,0,0,0.9)",
                perspective: 1000,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Corner decoration top-left */}
              <div
                className="absolute top-0 left-0 w-28 h-28 rounded-br-full pointer-events-none"
                style={{
                  background: isRed
                    ? "radial-gradient(circle at top left, rgba(239,68,68,0.18) 0%, transparent 70%)"
                    : "radial-gradient(circle at top left, rgba(234,179,8,0.12) 0%, transparent 70%)",
                }}
              />
              {/* Corner decoration bottom-right */}
              <div
                className="absolute bottom-0 right-0 w-28 h-28 rounded-tl-full pointer-events-none"
                style={{
                  background: isRed
                    ? "radial-gradient(circle at bottom right, rgba(239,68,68,0.14) 0%, transparent 70%)"
                    : "radial-gradient(circle at bottom right, rgba(234,179,8,0.10) 0%, transparent 70%)",
                }}
              />

              {/* Top bar with status */}
              <div
                className="relative flex items-center justify-between px-5 py-3 border-b"
                style={{
                  borderColor: isRed
                    ? "rgba(239,68,68,0.15)"
                    : "rgba(234,179,8,0.12)",
                }}
              >
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: particleColor }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  />
                  <span className="text-white/30 text-xs tracking-widest uppercase font-medium">
                    ผลการจับสลาก
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CountdownRing
                    isRed={isRed}
                    duration={AUTO_CLOSE_MS / 1000}
                  />
                  <button
                    onClick={onClose}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: "rgba(255,255,255,0.07)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.14)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.07)";
                    }}
                  >
                    <X className="w-3.5 h-3.5 text-white/50" />
                  </button>
                </div>
              </div>

              {/* Main content */}
              <div className="relative px-6 pt-8 pb-7 flex flex-col items-center gap-6">
                {/* ── Slip paper graphic ─────────────────────────────────── */}
                <SlipPaper isRed={isRed} />

                {/* ── Staggered text reveals ─────────────────────────────── */}
                <motion.div
                  variants={staggerContainerVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col items-center gap-4 w-full"
                >
                  {/* BIG slip type label */}
                  <motion.div
                    variants={staggerItemVariants}
                    className="flex flex-col items-center"
                  >
                    <p
                      className="font-black leading-none tracking-tight"
                      style={{
                        fontSize: 56,
                        color: slipTypeLabelColor,
                        textShadow: slipTypeShadow,
                        lineHeight: 1,
                      }}
                    >
                      {isRed ? "ใบแดง" : "ใบดำ"}
                    </p>
                  </motion.div>

                  {/* Consequence text */}
                  <motion.div
                    variants={staggerItemVariants}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <span className="text-3xl leading-none">
                      {consequenceEmoji}
                    </span>
                    <p
                      className="font-bold text-lg text-center leading-snug"
                      style={{
                        color: isRed ? "#FECACA" : "#FEF08A",
                        textShadow: isRed
                          ? "0 0 20px rgba(239,68,68,0.4)"
                          : "0 0 20px rgba(234,179,8,0.4)",
                      }}
                    >
                      {consequenceText}
                    </p>
                  </motion.div>

                  {/* Divider */}
                  <motion.div
                    variants={staggerItemVariants}
                    className="w-16 h-px"
                    style={{
                      background: isRed
                        ? "rgba(239,68,68,0.35)"
                        : "rgba(234,179,8,0.3)",
                    }}
                  />

                  {/* Quote */}
                  <motion.div variants={staggerItemVariants}>
                    <p
                      className="text-sm text-center italic leading-relaxed px-2"
                      style={{ color: "rgba(255,255,255,0.38)" }}
                    >
                      {quote}
                    </p>
                  </motion.div>

                  {/* Close button */}
                  <motion.div
                    variants={staggerItemVariants}
                    className="w-full pt-1"
                  >
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={onClose}
                      className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200"
                      style={closeBtnStyle}
                    >
                      ปิด
                    </motion.button>
                  </motion.div>
                </motion.div>
              </div>

              {/* Bottom edge accent line */}
              <div
                className="h-0.5 w-full"
                style={{
                  background: isRed
                    ? "linear-gradient(90deg, transparent, rgba(239,68,68,0.5), transparent)"
                    : "linear-gradient(90deg, transparent, rgba(234,179,8,0.45), transparent)",
                }}
              />
            </motion.div>

            {/* ── Tap anywhere to close hint ──────────────────────────────── */}
            <motion.p
              className="absolute bottom-6 left-0 right-0 text-center text-white/18 text-xs pointer-events-none"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.4 }}
            >
              แตะที่ใดก็ได้เพื่อปิด
            </motion.p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
