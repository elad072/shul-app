import "./globals.css";
import { Heebo } from "next/font/google";
import type { Viewport } from "next";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-heebo",
});

export const metadata = {
  title: "בית הכנסת מעון קודשך - אפליקציה",
  description: "מערכת לניהול בית כנסת מעון קודשך - שכונת כרמים",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "מעון קודשך",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { Toaster } from "sonner";

// ...

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${heebo.className} bg-slate-50 text-slate-900`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
