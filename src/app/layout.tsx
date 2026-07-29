import type { Metadata, Viewport } from "next";
import { Geist_Mono, Noto_Kufi_Arabic } from "next/font/google";
import Script from "next/script";
import AgeGate from "@/components/AgeGate";
import "./globals.css";

const notoKufiArabic = Noto_Kufi_Arabic({
  variable: "--font-kurdish",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "کوردیش تیوب — KurdishTube",
    template: "%s | کوردیش تیوب",
  },
  description: "کوردیش تیوب، پلاتفۆرمی هاوبەشکردنی ڤیدیۆ بۆ کۆمەڵگەی کوردی.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ckb"
      dir="rtl"
      className={`${notoKufiArabic.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <Script src="https://js.puter.com/v2/" strategy="beforeInteractive" />
      </head>
      <body className="flex min-h-full flex-col bg-black text-white">
        <AgeGate />
        {children}
      </body>
    </html>
  );
}