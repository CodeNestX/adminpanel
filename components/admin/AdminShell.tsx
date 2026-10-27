/**
 * کامپوننت پوسته یا قالب اصلی پنل ادمین (AdminShell)
 * 
 * کاربرد: این فایل به عنوان یک Wrapper (لایه دربرگیرنده) برای تمام صفحات پنل ادمین عمل می‌کند.
 * سایدبار، نوار بالایی (Topbar) و فوتر در این فایل مدیریت می‌شوند و محتوای هر صفحه به عنوان `children` در وسط آن رندر می‌گردد.
 * 
 * ویژگی‌ها:
 * - بررسی دسترسی (Auth Guard): اگر کاربر لاگین نکرده باشد، اجازه مشاهده محتوا را نمی‌دهد و او را به صفحه لاگین می‌فرستد.
 * - دریافت داده‌های سراسری: وضعیت پیام‌های نخوانده و کامنت‌های در انتظار را از بک‌اند می‌گیرد و به سایدبار می‌فرستد.
 * - واکنش‌گرا (Responsive): مدیریت باز و بسته شدن سایدبار در نسخه‌ی موبایل.
 */

"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import { useAdminAuth } from "@/context/AdminAuthContext";
// این ایمپورت را اضافه کنید
import { getUnreadMessages } from "@/api/messages";
import { getPendingComments } from "@/api/comments";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/admin/dashboard": { title: "داشبورد", subtitle: "نمایی کلی از وضعیت سایت" },
  "/admin/articles": { title: "مقالات", subtitle: "ساخت، ویرایش و انتشار محتوا" },
  "/admin/messages": { title: "پیام‌ها", subtitle: "صندوق ورودی ارتباط با کاربران" },
  "/admin/comments": { title: "کامنت‌ها", subtitle: "بررسی و تایید دیدگاه‌ها" },
  "/admin/settings": { title: "تنظیمات", subtitle: "پیکربندی عمومی سایت" },
  "/admin/admins": { title: "ادمین‌ها", subtitle: "مدیریت حساب‌ها و سطح دسترسی" },
  "/admin/users": { title: "کاربران", subtitle: "اعضای ثبت‌نام‌کرده سایت" },
};

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAdminAuth();
  const [drawer, setDrawer] = useState(false);

  // استیت‌های جدید برای عددهای واقعی
  const [unread, setUnread] = useState(0);
  const [commentPending, setCommentPending] = useState(0);

  const isLogin = pathname === "/admin/login";

  // گرفتن دیتای واقعی برای سایدبار
  useEffect(() => {
    if (user && !isLogin) {
      getUnreadMessages().then(res => setUnread(res.data?.length || 0)).catch(() => {});
      getPendingComments().then(res => setCommentPending(res.data?.length || 0)).catch(() => {});
    }
  }, [user, isLogin, pathname]); // با هر بار تغییر صفحه آپدیت می‌شود

  useEffect(() => {
    if (!loading && !user && !isLogin) router.replace("/admin/login");
  }, [loading, user, isLogin, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (isLogin) return <>{children}</>;

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050b11]">
        <p className="animate-pulse text-sm text-white/50">در حال بررسی دسترسی...</p>
      </div>
    );
  }

  const meta = titles[pathname] ?? { title: "پنل مدیریت", subtitle: "ElectroCar" };

  return (
    <div className="min-h-screen bg-[#050b11] text-white">
      <div className="flex min-h-screen">
        {/* سایدبار دسکتاپ */}
        <aside className="sticky top-0 hidden h-screen w-[290px] shrink-0 border-l border-white/10 bg-[#071019] p-4 lg:block">
          <AdminSidebar unread={unread} commentPending={commentPending} />
        </aside>

        {/* ستون محتوا */}
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar title={meta.title} subtitle={meta.subtitle} onMenu={() => setDrawer(true)} />
          <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
          <footer className="border-t border-white/5 px-6 py-4 text-center text-[11px] text-white/30">
            پنل مدیریت ElectroCar • طراحی خودروهای برقی
          </footer>
        </div>
      </div>

      {/* دراور موبایل */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition lg:hidden ${
          drawer ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setDrawer(false)}
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[86%] max-w-xs border-l border-white/10 bg-[#071019] p-4 shadow-2xl transition-transform duration-300 lg:hidden ${
          drawer ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <AdminSidebar unread={unread} commentPending={commentPending} onNavigate={() => setDrawer(false)} />
      </aside>
    </div>
  );
}