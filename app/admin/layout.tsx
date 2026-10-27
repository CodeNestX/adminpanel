import type { Metadata } from "next";
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "پنل مدیریت",
  description: "پنل مدیریت ElectroCar",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <div dir="rtl" lang="fa">
        <AdminShell>{children}</AdminShell>
      </div>
    </AdminAuthProvider>
  );
}
