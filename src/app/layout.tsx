import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "מעון קודשך",
  description: "אפליקציית בית הכנסת"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he">
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
