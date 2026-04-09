"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  ChevronRight,
  Users,
  Shield,
  Search,
  ArrowLeft,
  Target,
  Percent,
} from "lucide-react";
import { provinces } from "@/data/provinces";
import type { Province, District } from "@/types";

interface ProvinceSelectorProps {
  onSelect: (province: Province, district: District) => void;
  selectedProvince: Province | null;
  selectedDistrict: District | null;
}

// ─── Small sub-components ────────────────────────────────────────────────────

function RedBlackBar({ redPct }: { redPct: number }) {
  return (
    <div className="flex items-center gap-1.5 flex-1 min-w-0">
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full bg-linear-to-r from-red-700 to-red-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${redPct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" as const, delay: 0.1 }}
        />
      </div>
      <span className="text-red-400/80 text-xs font-medium tabular-nums shrink-0">
        {redPct}%
      </span>
    </div>
  );
}

function SummaryStatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: "red" | "black" | "amber" | "blue";
}) {
  const accentMap = {
    red: "border-red-500/30 bg-red-950/30",
    black: "border-zinc-600/30 bg-zinc-950/40",
    amber: "border-amber-500/30 bg-amber-950/20",
    blue: "border-blue-500/30 bg-blue-950/20",
  };
  const borderBg = accent ? accentMap[accent] : "border-white/10 bg-white/5";

  return (
    <div className={`rounded-xl p-3 border ${borderBg}`}>
      <div className="flex items-center gap-1.5 mb-1.5">{icon}</div>
      <p className="text-white/45 text-xs leading-tight mb-0.5">{label}</p>
      <p className="text-white font-bold text-base leading-tight">
        {value}
        {sub && (
          <span className="text-xs font-normal text-white/50 ml-1">{sub}</span>
        )}
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProvinceSelector({
  onSelect,
  selectedProvince,
  selectedDistrict,
}: ProvinceSelectorProps) {
  const [step, setStep] = useState<"province" | "district">("province");
  const [search, setSearch] = useState("");
  const [localProvince, setLocalProvince] = useState<Province | null>(
    selectedProvince,
  );
  const [localDistrict, setLocalDistrict] = useState<District | null>(
    selectedDistrict,
  );
  const [isChanging, setIsChanging] = useState(false);
  
  const [mode, setMode] = useState<"real" | "custom">("real");
  const [customTotal, setCustomTotal] = useState<string>("200");
  const [customRed, setCustomRed] = useState<string>("50");

  // ── Derived state ──────────────────────────────────────────────────────────
  const showSummary =
    localProvince !== null && localDistrict !== null && !isChanging;

  const filteredProvinces = useMemo(() => {
    if (!search.trim()) return provinces;
    const q = search.trim().toLowerCase();
    return provinces.filter(
      (p) => p.nameTh.includes(q) || p.nameEn.toLowerCase().includes(q),
    );
  }, [search]);

  const filteredDistricts = useMemo(() => {
    if (!localProvince) return [];
    if (!search.trim()) return localProvince.districts;
    const q = search.trim().toLowerCase();
    return localProvince.districts.filter(
      (d) => d.nameTh.includes(q) || d.nameEn.toLowerCase().includes(q),
    );
  }, [localProvince, search]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleProvinceSelect = (province: Province) => {
    setLocalProvince(province);
    setLocalDistrict(null);
    setStep("district");
    setSearch("");
  };

  const handleDistrictSelect = (district: District) => {
    setLocalDistrict(district);
    setIsChanging(false);
  };

  const handleBack = () => {
    setStep("province");
    setSearch("");
    setLocalDistrict(null);
  };

  const handleChange = () => {
    setIsChanging(true);
    setStep("province");
    setSearch("");
    setLocalDistrict(null);
  };

  const handleConfirmStart = () => {
    if (localProvince && localDistrict) {
      onSelect(localProvince, localDistrict);
    }
  };

  const handleConfirmCustom = () => {
    const total = parseInt(customTotal) || 0;
    const red = parseInt(customRed) || 0;

    if (total <= 0) return alert("โปรดระบุผู้เข้ารับการตรวจมากกว่า 0 คน");
    if (red < 0 || red > total) return alert("โควตาใบแดงต้องไม่เกินจำนวนผู้เข้ารับการตรวจ");

    const customProv: Province = {
      id: "custom-p",
      nameTh: "กำหนดเอง",
      nameEn: "Custom Mode",
      districts: [],
    };
    const customDist: District = {
      id: "custom-d",
      nameTh: "โควตาพิเศษ",
      nameEn: "Custom Quota",
      eligibleCount: total,
      quota: red,
    };
    onSelect(customProv, customDist);
  };

  // ── Summary calculations ───────────────────────────────────────────────────
  const summaryData = useMemo(() => {
    if (!localDistrict) return null;
    const total = localDistrict.eligibleCount;
    const red = localDistrict.quota;
    const black = total - red;
    const redPct = total > 0 ? Math.round((red / total) * 100) : 0;
    const blackPct = 100 - redPct;
    return { total, red, black, redPct, blackPct };
  }, [localDistrict]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: SUMMARY CARD
  // ─────────────────────────────────────────────────────────────────────────
  if (showSummary && summaryData) {
    return (
      <motion.div
        key="summary"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md mx-auto"
      >
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/50 backdrop-blur-2xl shadow-2xl">
          {/* Background radial glow */}
          <div className="pointer-events-none absolute -top-20 -left-10 w-80 h-60 rounded-full bg-red-900/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 w-60 h-40 rounded-full bg-red-950/20 blur-2xl" />

          <div className="relative p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-white/50 text-xs tracking-wide uppercase">
                    สถานที่เกณฑ์ทหาร
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white leading-tight">
                  {localProvince!.nameTh}
                </h3>
                <p className="text-red-400 font-semibold text-sm mt-0.5">
                  อำเภอ{localDistrict!.nameTh}
                </p>
              </div>
              <button
                onClick={handleChange}
                className="flex items-center gap-1 text-white/90 font-medium hover:text-white bg-white/15 hover:bg-white/25 text-xs border border-white/20 hover:border-white/40 rounded-lg px-3 py-1.5 transition-all duration-200 shrink-0 shadow-md shadow-black/50 active:scale-95"
              >
                <ArrowLeft className="w-3 h-3" />
                เปลี่ยนที่
              </button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <SummaryStatCard
                icon={<Users className="w-3.5 h-3.5 text-blue-400" />}
                label="ผู้เข้ารับการตรวจ"
                value={summaryData.total.toLocaleString()}
                sub="คน"
                accent="blue"
              />
              <SummaryStatCard
                icon={<Shield className="w-3.5 h-3.5 text-amber-400" />}
                label="โควตาทหาร"
                value={summaryData.red.toString()}
                sub="นาย"
                accent="amber"
              />
              <SummaryStatCard
                icon={
                  <div className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
                }
                label="ใบแดง"
                value={`${summaryData.red} ใบ`}
                sub={`(${summaryData.redPct}%)`}
                accent="red"
              />
              <SummaryStatCard
                icon={
                  <div className="w-3 h-3 rounded-full bg-zinc-500 shrink-0" />
                }
                label="ใบดำ"
                value={`${summaryData.black} ใบ`}
                sub={`(${summaryData.blackPct}%)`}
                accent="black"
              />
            </div>

            {/* Odds bar */}
            <div className="mb-5">
              <div className="flex justify-between text-xs text-white/40 mb-1.5">
                <span className="flex items-center gap-1">
                  <Percent className="w-3 h-3" /> โอกาสได้ใบแดง
                </span>
                <span className="font-medium text-white/60">
                  {summaryData.redPct}% จาก {summaryData.blackPct}%
                </span>
              </div>
              <div className="h-3 rounded-full overflow-hidden bg-white/5 border border-white/10 flex">
                <motion.div
                  className="h-full bg-linear-to-r from-red-800 to-red-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${summaryData.redPct}%` }}
                  transition={{
                    duration: 0.7,
                    ease: "easeOut" as const,
                    delay: 0.2,
                  }}
                />
                <motion.div
                  className="h-full flex-1 bg-linear-to-r from-zinc-800 to-zinc-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-red-400/60">ใบแดง</span>
                <span className="text-xs text-zinc-500">ใบดำ</span>
              </div>
            </div>

            {/* Start button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleConfirmStart}
              className="relative w-full py-3.5 rounded-xl font-bold text-white text-base overflow-hidden group"
            >
              {/* Layered button background */}
              <div className="absolute inset-0 bg-linear-to-r from-red-800 via-red-700 to-red-800 transition-all duration-300" />
              <div className="absolute inset-0 bg-linear-to-r from-red-700 via-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 shadow-lg" />
              <span className="relative flex items-center justify-center gap-2">
                <Target className="w-4 h-4" />
                เริ่มจำลองการเกณฑ์ทหาร
              </span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: SELECTOR (Province or District step)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-md mx-auto">
      {/* ── Mode Toggle ── */}
      <div className="flex bg-black/40 rounded-xl p-1.5 border border-white/10 mb-4 backdrop-blur-md">
        <button
          onClick={() => setMode("real")}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
            mode === "real" ? "bg-white/15 text-white shadow text-red-50" : "text-white/40 hover:text-white/70"
          }`}
        >
          อิงข้อมูลจริง
        </button>
        <button
          onClick={() => setMode("custom")}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
            mode === "custom" ? "bg-white/15 text-white shadow" : "text-white/40 hover:text-white/70"
          }`}
        >
          กำหนดโควตาเอง
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {mode === "real" ? (
          <motion.div
            key="real-mode"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl overflow-hidden"
          >
        {/* Panel header */}
        <div className="px-5 pt-5 pb-3 border-b border-white/8">
          <AnimatePresence mode="wait">
            {step === "province" ? (
              <motion.div
                key="header-province"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
              >
                <h2 className="text-lg font-bold text-white">เลือกจังหวัด</h2>
                <p className="text-white/40 text-sm mt-0.5">
                  {provinces.length} จังหวัดทั่วประเทศไทย
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="header-district"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.22 }}
                className="flex items-center gap-3"
              >
                <button
                  onClick={handleBack}
                  className="flex items-center justify-center w-8 h-8 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/25 transition-all duration-200 shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-white leading-tight truncate">
                    {localProvince?.nameTh}
                  </h2>
                  <p className="text-white/40 text-sm">
                    {localProvince?.districts.length} อำเภอ
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search bar */}
        <div className="px-4 py-3 border-b border-white/8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            <input
              key={step}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                step === "province" ? "ค้นหาจังหวัด..." : "ค้นหาอำเภอ..."
              }
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-red-500/40 focus:bg-white/8 transition-all duration-200"
            />
          </div>
        </div>

        {/* List area */}
        <div
          className="overflow-y-auto px-3 py-3 space-y-1.5"
          style={{ maxHeight: "380px" }}
        >
          <AnimatePresence mode="wait">
            {step === "province" ? (
              <motion.div
                key="list-province"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="space-y-1.5"
              >
                {filteredProvinces.length === 0 ? (
                  <div className="py-10 text-center text-white/30 text-sm">
                    ไม่พบจังหวัดที่ค้นหา
                  </div>
                ) : (
                  filteredProvinces.map((province, i) => (
                    <motion.button
                      key={province.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: Math.min(i * 0.025, 0.3),
                        duration: 0.2,
                      }}
                      onClick={() => handleProvinceSelect(province)}
                      className="w-full flex items-center justify-between rounded-xl border border-white/8 bg-white/3 hover:bg-white/8 hover:border-red-500/30 px-3.5 py-3 transition-all duration-200 group text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-red-900/30 flex items-center justify-center shrink-0 transition-colors duration-200">
                          <MapPin className="w-3.5 h-3.5 text-red-400/70 group-hover:text-red-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm leading-tight truncate">
                            {province.nameTh}
                          </p>
                          <p className="text-white/35 text-xs truncate">
                            {province.nameEn}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-white/30 text-xs">
                          {province.districts.length} อำเภอ
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all duration-200" />
                      </div>
                    </motion.button>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div
                key="list-district"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="space-y-1.5"
              >
                {filteredDistricts.length === 0 ? (
                  <div className="py-10 text-center text-white/30 text-sm">
                    ไม่พบอำเภอที่ค้นหา
                  </div>
                ) : (
                  filteredDistricts.map((district, i) => {
                    const redPct =
                      district.eligibleCount > 0
                        ? Math.round(
                            (district.quota / district.eligibleCount) * 100,
                          )
                        : 0;
                    return (
                      <motion.button
                        key={district.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: Math.min(i * 0.03, 0.3),
                          duration: 0.2,
                        }}
                        onClick={() => handleDistrictSelect(district)}
                        className="w-full rounded-xl border border-white/8 bg-white/3 hover:bg-white/8 hover:border-red-500/30 px-3.5 py-3 transition-all duration-200 group text-left"
                      >
                        {/* District name row */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-red-900/30 flex items-center justify-center shrink-0 transition-colors duration-200">
                              <Target className="w-3 h-3 text-red-400/60 group-hover:text-red-400" />
                            </div>
                            <span className="text-white font-medium text-sm truncate">
                              อ.{district.nameTh}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-red-400 shrink-0 ml-2 transition-colors duration-200" />
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center gap-3 pl-9">
                          <span className="flex items-center gap-1 text-xs text-white/35 shrink-0">
                            <Users className="w-3 h-3" />
                            {district.eligibleCount.toLocaleString()} คน
                          </span>
                          <span className="flex items-center gap-1 text-xs text-amber-500/70 shrink-0">
                            <Shield className="w-3 h-3" />
                            {district.quota} นาย
                          </span>
                          <RedBlackBar redPct={redPct} />
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      ) : (
        <motion.div
           key="custom-mode"
           initial={{ opacity: 0, x: 10 }}
           animate={{ opacity: 1, x: 0 }}
           exit={{ opacity: 0, x: 10 }}
           className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl overflow-hidden p-6"
        >
          <div className="text-center mb-6 mt-2">
            <h2 className="text-xl font-bold text-white mb-2">จำลองโควตาเอง</h2>
            <p className="text-white/40 text-sm">ระบุจำนวนคนและสลากแดงเพื่อทดสอบระบบดึงสลาก</p>
          </div>
          
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-white/70 text-sm mb-1.5 font-medium ml-1">จำนวนผู้เข้ารับการตรวจ (คน)</label>
              <input
                type="number"
                min="1"
                value={customTotal}
                onChange={(e) => setCustomTotal(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold focus:outline-none focus:border-red-500/40 focus:bg-white/10 transition-all text-center"
              />
            </div>
            <div>
               <label className="block text-red-400/80 text-sm mb-1.5 font-medium ml-1">โควตาใบแดง (ใบ)</label>
               <input
                type="number"
                min="0"
                value={customRed}
                onChange={(e) => setCustomRed(e.target.value)}
                className="w-full bg-red-950/20 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-lg font-bold focus:outline-none focus:border-red-500/40 focus:bg-red-950/30 transition-all text-center"
               />
               {parseInt(customTotal) > 0 && (
                 <p className="text-center text-xs text-red-500/60 mt-2">
                   โอกาสได้ใบแดง: {((parseInt(customRed) || 0) / (parseInt(customTotal) || 1) * 100).toFixed(1)}%
                 </p>
               )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleConfirmCustom}
            className="w-full py-4 rounded-xl font-bold text-white text-base bg-linear-to-r from-red-800 to-red-600 shadow-lg flex items-center justify-center gap-2 border border-red-500/30"
          >
            <Target className="w-5 h-5" /> ตกลงทดสอบสลาก
          </motion.button>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Breadcrumb hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-white/20 text-xs mt-3"
      >
        {step === "province"
          ? "เลือกจังหวัดเพื่อดูข้อมูลอำเภอ"
          : `${localProvince?.nameTh} › เลือกอำเภอ`}
      </motion.p>
    </div>
  );
}
