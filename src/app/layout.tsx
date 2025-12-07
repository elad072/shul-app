import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Shul App",
  description: "Community management platform",
  direction: "rtl",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
