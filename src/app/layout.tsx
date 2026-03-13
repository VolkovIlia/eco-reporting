import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ЭкоОтчёт — Экологическая отчетность",
  description: "Автоматизация экологической отчетности для российских предприятий: ПЭК, 2-ТП, НВОС",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
