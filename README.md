# 🎖️ Red or Black Destiny — ระบบจำลองการเกณฑ์ทหาร

> ระบบจำลองการจับสลากเกณฑ์ทหารของประเทศไทย สร้างขึ้นด้วย **Next.js 16** และ **Tailwind CSS v4**  
> สำหรับการศึกษาและทำความเข้าใจกระบวนการสุ่มเกณฑ์ทหารอย่างโปร่งใส

---

## 📌 ภาพรวมโปรเจกต์

**Red or Black Destiny** คือแอปพลิเคชันจำลองการเกณฑ์ทหาร (Military Conscription Simulation) ที่ช่วยให้ผู้ใช้สามารถ:

- **เลือกจังหวัดและอำเภอ** เพื่อดูข้อมูลโควตาการเกณฑ์ทหารในพื้นที่นั้น ๆ
- **จำลองการล้วงสลาก** แบบ Real-time พร้อม Animation สุดเร้าใจ
- **ดูสถิติและโอกาส** ของใบแดง (เกณฑ์) และใบดำ (ได้รับการยกเว้น) แบบ Live
- **กำหนดโควตาเอง** เพื่อทดสอบหรือจำลองสถานการณ์อื่น ๆ

> ⚠️ ข้อมูลในระบบนี้เป็น **ข้อมูลจำลอง** ไม่ใช่ข้อมูลจริงจากกองทัพบก

---

## ✨ ฟีเจอร์หลัก

### 🗺️ เลือกพื้นที่
- รองรับ **13 จังหวัด** (กรุงเทพฯ, เชียงใหม่, ขอนแก่น, อุดรธานี, นครราชสีมา, ชลบุรี, ระยอง ฯลฯ)
- ค้นหาจังหวัดและอำเภอได้ทันที
- โหมด **อิงข้อมูลจำลอง** สำหรับข้อมูลพื้นที่จริง
- โหมด **กำหนดโควตาเอง** สำหรับทดสอบเองอิสระ

### 🪣 จำลองการจับสลาก
- Animation ถังสลากสมจริงพร้อมสลิปเด้งออกมา
- เสียง **เขย่าถัง** เวลากดจับสลาก
- แสดงผล **ใบแดง / ใบดำ** พร้อม Animation เฉลิมฉลอง/ตกใจ
- ติดตาม **ประวัติการจับสลาก** รอบนี้แบบ Real-time

### 📊 แสดงสถิติ
- วงกลมแสดง **โอกาสได้ใบแดง** (%) แบบ Animated Gauge
- **กราฟแท่งแบ่งส่วน** ใบแดง vs ใบดำ ที่เหลืออยู่
- **สถิติระดับชาติ** จากระบบ API พร้อม Auto-refresh ทุก 12 วินาที

### 🎨 UI/UX
- ดีไซน์แบบ **Dark Mode / Glassmorphism** โทนสีทองแดง
- ฟอนต์ **Inter + Noto Sans Thai** เพื่อรองรับภาษาไทยสวยงาม
- **Responsive Design** รองรับทั้ง Desktop และ Mobile
- เสียง **Click Effect** เวลากดปุ่มเมนูต่าง ๆ (Web Audio API)
- **Floating Action Button** กลับหน้าแรกได้ทุกเมื่อ
- คลิกที่ **โลโก้โล่** ใน Header เพื่อกลับหน้าเลือกพื้นที่

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript 5 |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Animation | [Framer Motion 12](https://www.framer.com/motion/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Sound FX | Web Audio API (ไม่ใช้ไฟล์เสียงภายนอก) |
| Package Manager | [Bun](https://bun.sh/) |
| Deployment | [Vercel](https://vercel.com/) |

---

## 🗂️ โครงสร้างโปรเจกต์

```
Red-or-Black/
├── src/
│   ├── app/
│   │   ├── api/stats/          # API endpoint สถิติระดับชาติ
│   │   ├── layout.tsx          # Root layout + metadata + favicon
│   │   └── page.tsx            # หน้าหลัก (game controller)
│   ├── components/
│   │   ├── Header.tsx          # Header bar + นาฬิกา + โลโก้
│   │   ├── ProvinceSelector.tsx # ระบบเลือกจังหวัด/อำเภอ
│   │   ├── BucketScene.tsx     # ถังสลาก + ปุ่มล้วง + ประวัติ
│   │   ├── OddsDisplay.tsx     # กราฟโอกาส + วงเกจ + สถิติ
│   │   ├── SlipReveal.tsx      # Animation เฉลิมฉลองผลจับ
│   │   └── StatsBoard.tsx      # สถิติระดับชาติ
│   ├── data/
│   │   └── provinces.ts        # ฐานข้อมูลจังหวัดและอำเภอ
│   ├── types/                  # TypeScript type definitions
│   ├── utils/
│   │   └── audio.ts            # Web Audio API utilities
│   └── lib/                    # Helper functions
├── public/
│   └── icon.svg                # Favicon
├── vercel.json                 # Vercel deploy config
└── package.json
```

---

## 🚀 เริ่มต้นใช้งาน (Local Development)

### ความต้องการของระบบ
- [Node.js](https://nodejs.org/) >= 18 หรือ [Bun](https://bun.sh/) >= 1.0

### ติดตั้งและรัน

```bash
# Clone โปรเจกต์
git clone https://github.com/your-username/Red-or-Black.git
cd Red-or-Black

# ติดตั้ง dependencies
bun install

# รัน dev server (port 3001)
bun run dev
```

จากนั้นเปิดเบราว์เซอร์ไปที่ [http://localhost:3001](http://localhost:3001)

---

## ☁️ การ Deploy ขึ้น Vercel

โปรเจกต์นี้มี `vercel.json` ที่ตั้งค่าพร้อมแล้ว:

```json
{
  "version": 2,
  "framework": "nextjs",
  "installCommand": "bun install",
  "buildCommand": "bun run build"
}
```

### วิธี Deploy

1. Push โค้ดขึ้น GitHub
2. ไปที่ [vercel.com](https://vercel.com) และ Import Repository
3. กด **Deploy** ได้เลย — Vercel จะอ่านค่าจาก `vercel.json` อัตโนมัติ

---

## 📍 ข้อมูลจังหวัดที่รองรับ

ระบบนี้ได้บรรจุข้อมูลโครงสร้าง **ครบทั้ง 77 จังหวัด และกว่า 900 อำเภอทั่วประเทศไทย** โดยอัตราโควตาและจำนวนคนเข้ารับการตรวจเลือกในแต่ละพื้นที่จะถูกตั้งค่าแบบสุ่มอัตโนมัติ (Mock Data) สำหรับการจำลองสถานการณ์เท่านั้น

---

## ⚠️ ข้อจำกัดและข้อควรทราบ

- ข้อมูลทั้งหมดในระบบเป็น **ข้อมูลจำลอง** ไม่ใช่ข้อมูลจริงจากกองทัพบก
- ตัวเลขโควตาและจำนวนผู้เข้ารับการตรวจเป็นการประมาณการเพื่อการศึกษาเท่านั้น
- ยังไม่มี Public API จากกองทัพบกไทยให้ดึงข้อมูลจริงแบบ Real-time

---

## 🤝 Contributing

ยินดีรับ Pull Requests สำหรับ:
- เพิ่มข้อมูลจังหวัดและอำเภอที่ยังขาดอยู่
- ปรับปรุง UX/UI
- แก้ไข Bug ต่าง ๆ

---

## 📄 License

MIT License — สร้างขึ้นเพื่อการศึกษาและทดสอบ ไม่มีวัตถุประสงค์เชิงพาณิชย์
