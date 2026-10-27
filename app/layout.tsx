import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "ElectroCar | پنل مدیریت",
  description: "سیستم مدیریت خودروهای برقی",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="bg-[#050b11] text-white antialiased">
        {children}
      </body>
    </html>
  );
}