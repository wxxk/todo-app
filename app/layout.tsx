import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Sidebar from "@/components/layout/Sidebar";
import { getSessionUser } from "@/lib/auth";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "할 일 관리",
  description: "할 일 · 주간 계획 · 1년 목표 연동 관리 앱",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getSessionUser();
  return (
    <html lang="ko" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-canvas text-ink sm:flex-row">
        <Sidebar user={user ? { username: user.username, avatarUrl: user.avatarUrl } : null} />
        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </body>
    </html>
  );
}
