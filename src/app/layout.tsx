import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Red or Black Destiny | ชะตากรรม: ระบบจำลองการตรวจเลือกทหาร",
  description:
    "จำลองประสบการณ์การเกณฑ์ทหารแบบเสมือนจริง — ล้วงสลากใบแดงหรือใบดำ คำนวณโอกาสแบบ Real-time และติดตามสถิติทั่วประเทศ",
  keywords: [
    "เกณฑ์ทหาร",
    "ใบแดง",
    "ใบดำ",
    "จับสลาก",
    "ระบบจำลอง",
    "military draft",
    "Thailand army",
    "red or black",
  ],
  authors: [{ name: "Red or Black Destiny" }],
  openGraph: {
    title: "Red or Black Destiny | ชะตากรรม: ระบบจำลองการตรวจเลือกทหาร",
    description:
      "จำลองประสบการณ์การเกณฑ์ทหารแบบเสมือนจริง — ล้วงสลากใบแดงหรือใบดำ",
    type: "website",
    locale: "th_TH",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${inter.variable} ${notoSansThai.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 overflow-x-hidden font-thai">
        {children}
      </body>
    </html>
  );
}
