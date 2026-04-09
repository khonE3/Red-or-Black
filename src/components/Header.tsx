"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Star, Activity, Sword } from "lucide-react";

const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const THAI_DAYS = [
  "อาทิตย์",
  "จันทร์",
  "อังคาร",
  "พุธ",
  "พฤหัสบดี",
  "ศุกร์",
  "เสาร์",
];

function getThaiDate(date: Date): string {
  const beYear = date.getFullYear() + 543;
  const day = date.getDate();
  const month = THAI_MONTHS[date.getMonth()];
  const dayOfWeek = THAI_DAYS[date.getDay()];
  return `${dayOfWeek}ที่ ${day} ${month} พ.ศ. ${beYear}`;
}

function getThaiTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds} น.`;
}

// Staggered letter animation for the title
const titleLetterVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3 + i * 0.04,
      duration: 0.4,
      ease: "easeOut" as const,
    },
  }),
};

function AnimatedTitle() {
  const red = "RED".split("");
  const or = " OR ".split("");
  const black = "BLACK".split("");
  const destiny = " DESTINY".split("");

  return (
    <div className="flex items-center justify-center flex-wrap">
      {red.map((char, i) => (
        <motion.span
          key={`r-${i}`}
          custom={i}
          variants={titleLetterVariants}
          initial="hidden"
          animate="visible"
          className="text-red-500 font-black"
        >
          {char}
        </motion.span>
      ))}
      {or.map((char, i) => (
        <motion.span
          key={`o-${i}`}
          custom={red.length + i}
          variants={titleLetterVariants}
          initial="hidden"
          animate="visible"
          className="text-zinc-400 font-black"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
      {black.map((char, i) => (
        <motion.span
          key={`b-${i}`}
          custom={red.length + or.length + i}
          variants={titleLetterVariants}
          initial="hidden"
          animate="visible"
          className="text-zinc-100 font-black"
        >
          {char}
        </motion.span>
      ))}
      {destiny.map((char, i) => (
        <motion.span
          key={`d-${i}`}
          custom={red.length + or.length + black.length + i}
          variants={titleLetterVariants}
          initial="hidden"
          animate="visible"
          className="text-amber-400 font-black"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </div>
  );
}

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date>(new Date());

  // Hydration-safe clock
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // setMounted on mount is intentional — suppressing lint false-positive

  const thaiDate = mounted ? getThaiDate(now) : "";
  const thaiTime = mounted ? getThaiTime(now) : "";

  return (
    <motion.header
      initial={{ opacity: 0, y: -70 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden select-none"
    >
      {/* ── Layered background ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-zinc-950 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(220,38,38,0.18),transparent)]" />
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* ── Top accent line (animated shimmer) ── */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent" />
      <motion.div
        className="absolute top-0 left-0 h-[2px] w-32 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
        animate={{ left: ["-10%", "110%"] }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 2,
        }}
      />

      {/* ── Bottom accent line ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      {/* ── Main content ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
        {/* ── LEFT: Emblem + unit label ── */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center gap-3 shrink-0"
        >
          {/* Emblem stack */}
          <div className="relative w-12 h-12 shrink-0">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full border border-red-700/40 bg-gradient-to-br from-red-950/80 to-zinc-950/80 shadow-[0_0_20px_rgba(220,38,38,0.15)]" />
            <Shield
              className="absolute inset-0 m-auto w-8 h-8 text-red-600"
              strokeWidth={1.5}
            />
            <Star
              className="absolute inset-0 m-auto w-3.5 h-3.5 text-amber-400 fill-amber-400"
              strokeWidth={1}
            />
          </div>

          {/* Unit text */}
          <div className="hidden sm:flex flex-col gap-0.5">
            <span className="text-amber-500 text-[10px] font-bold tracking-[0.2em] uppercase leading-none">
              Kingdom of Thailand
            </span>
            <span className="text-zinc-300 text-xs font-semibold leading-none">
              กองทัพบกไทย
            </span>
            <span className="text-zinc-600 text-[10px] leading-none tracking-wide">
              Royal Thai Army
            </span>
          </div>
        </motion.div>

        {/* ── CENTER: Title block ── */}
        <div className="flex flex-col items-center text-center gap-1 flex-1 min-w-0">
          {/* LIVE badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.25,
              duration: 0.4,
              type: "spring",
              stiffness: 200,
            }}
            className="flex items-center gap-2"
          >
            <span className="flex items-center gap-1.5 bg-red-950/60 border border-red-800/60 rounded-full px-3 py-0.5">
              {/* Pulsing dot */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
              </span>
              <span className="text-red-400 text-[10px] font-black tracking-[0.25em] uppercase">
                Live Simulation
              </span>
            </span>
          </motion.div>

          {/* Main title with staggered letters */}
          <div className="text-2xl sm:text-3xl md:text-[2.15rem] lg:text-4xl tracking-[0.12em] leading-none">
            <AnimatedTitle />
          </div>

          {/* Thai sub-title */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.45 }}
            className="text-amber-400/90 text-sm sm:text-base font-bold tracking-wider leading-none"
          >
            ชะตากรรม: ใบแดงหรือใบดำ
          </motion.p>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="text-zinc-500 text-[11px] sm:text-xs tracking-widest uppercase"
          >
            ระบบจำลองการตรวจเลือกทหาร
          </motion.p>

          {/* Decorative divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-2 mt-0.5"
          >
            <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-red-700/60" />
            <Sword className="w-3 h-3 text-amber-600/60 rotate-90" />
            <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-red-700/60" />
          </motion.div>
        </div>

        {/* ── RIGHT: Date + time ── */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-end gap-1 shrink-0"
        >
          {/* Activity icon + label */}
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-amber-500 text-[10px] font-bold tracking-widest uppercase">
              วันที่ปัจจุบัน
            </span>
          </div>

          {/* Thai date */}
          <span className="text-zinc-200 text-xs sm:text-sm font-semibold text-right leading-snug">
            {thaiDate}
          </span>

          {/* Live clock */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-amber-500/80 text-xs tracking-wider">
              {thaiTime}
            </span>
          </div>

          {/* BE label */}
          <span className="text-zinc-600 text-[10px] tracking-wider">
            Buddhist Era Calendar
          </span>
        </motion.div>
      </div>
    </motion.header>
  );
}
