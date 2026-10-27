/**
 * کامپوننت سایدبار پنل ادمین (AdminSidebar)
 * 
 * کاربرد: منوی اصلی ناوبری پنل مدیریت که در سمت راست (در حالت دسکتاپ) قرار می‌گیرد.
 * 
 * ویژگی‌ها:
 * - دریافت داده‌های زنده (Props): تعداد پیام‌ها و کامنت‌های در انتظار تایید به صورت داینامیک نمایش داده می‌شوند.
 * - تعاملی (Responsive): دارای دکمه‌ی خروج و نمایش نام کاربری وارد شده (`useAdminAuth`).
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminLogo from "./AdminLogo";
import { useAdminAuth } from "@/context/AdminAuthContext";

const manageLinks = [
  {
    href: "/admin/dashboard",
    title: "داشبورد",
    desc: "نمای کلی سیستم",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/admin/articles",
    title: "مقالات",
    desc: "مدیریت محتوا",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 4h14v12H9l-4 4V4Z" strokeLinejoin="round" />
        <path d="M9 8h6M9 11h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/admin/messages",
    title: "پیام‌ها",
    desc: "صندوق ورودی",
    badgeKey: "messages",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/admin/comments",
    title: "کامنت‌ها",
    desc: "تایید دیدگاه‌ها",
    badgeKey: "comments",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 5h16v11H9l-5 4V5Z" strokeLinejoin="round" />
        <path d="M8 9h8M8 12h5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/admin/users",
    title: "کاربران",
    desc: "اعضای سایت",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="3.4" />
        <path d="M5 20c.8-3.4 3.4-5 7-5s6.2 1.6 7 5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const systemLinks = [
  {
    href: "/admin/admins",
    title: "ادمین‌ها",
    desc: "سطح دسترسی",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5" strokeLinecap="round" />
        <path d="M16 8.5a3 3 0 1 0 0 .01M17.5 14.7c1.7.6 2.7 1.9 3 4.3" strokeLinecap="round" />
      </svg>
    ),
  },
  
];

function NavLink({
  href,
  title,
  desc,
  icon,
  active,
  badge,
  onNavigate,
}: {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  active: boolean;
  badge?: number;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group flex items-center gap-3 rounded-2xl border px-3.5 py-3 transition-all duration-200 ${
        active
          ? "border-[#39f77b]/30 bg-[#39f77b]/10"
          : "border-transparent hover:border-[#39f77b]/15 hover:bg-[#39f77b]/5"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
          active ? "bg-[#39f77b]/15 text-[#39f77b]" : "bg-white/5 text-[#91a0ad] group-hover:text-[#39f77b]"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`flex items-center gap-2 text-sm font-bold ${active ? "text-white" : "text-gray-300"}`}>
          {title}
          {badge !== undefined && badge > 0 && (
            <span className="rounded-full bg-[#39f77b] px-2 py-0.5 text-[10px] font-extrabold text-[#06100a]">
              {badge}
            </span>
          )}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-white/35">{desc}</span>
      </span>
      <span className={`text-sm transition ${active ? "text-[#39f77b]" : "text-white/15 group-hover:text-[#39f77b]"}`}>
        ‹
      </span>
    </Link>
  );
}

export default function AdminSidebar({
  unread,
  commentPending,
  onNavigate,
}: {
  unread: number;
  commentPending: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();

  return (
    <div className="flex h-full flex-col">
      {/* لوگو و اسم */}
      <Link href="/admin/dashboard" onClick={onNavigate} className="flex items-center gap-3 px-2 pb-6">
        <AdminLogo size={42} />
        <span>
          <span className="block text-lg font-extrabold leading-6">
            <span className="text-white">Electro</span>
            <span className="text-[#39f77b]">Car</span>
          </span>
          <span className="mt-1 block text-[11px] font-medium text-white/40">پنل مدیریت</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-6 overflow-y-auto pb-4">
        <div>
          <p className="mb-2 px-3 text-[11px] font-bold tracking-wide text-white/30">مدیریت</p>
          <div className="space-y-1.5">
            {manageLinks.map((l) => (
              <NavLink
                key={l.href}
                href={l.href}
                title={l.title}
                desc={l.desc}
                icon={l.icon}
                active={pathname === l.href || (l.href === "/admin/dashboard" && pathname === "/admin")}
                badge={l.badgeKey === "messages" ? unread : l.badgeKey === "comments" ? commentPending : undefined}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 px-3 text-[11px] font-bold tracking-wide text-white/30">سیستم</p>
          <div className="space-y-1.5">
            {systemLinks.map((l) => (
              <NavLink
                key={l.href}
                href={l.href}
                title={l.title}
                desc={l.desc}
                icon={l.icon}
                active={pathname === l.href}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>

        <Link
          href="/"
          className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-3.5 py-3 transition hover:border-[#00c8ff]/30"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00c8ff]/10 text-[#00c8ff]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 11 12 4l9 7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 10v10h14V10" strokeLinejoin="round" />
            </svg>
          </span>
          <span>
            <span className="block text-sm font-bold text-gray-200">مشاهده سایت</span>
            <span className="mt-0.5 block text-[11px] text-white/35">بازگشت به ElectroCar</span>
          </span>
        </Link>
      </nav>

      {/* اسم ادمین واردشده */}
      <div className="mt-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00c8ff] to-[#39f77b] text-sm font-extrabold text-[#041009]">
            {user?.name?.trim().charAt(0) ?? "م"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-white">{user?.name ?? "ادمین"}</span>
            <span className="mt-0.5 block text-[11px] text-white/40">
              {user?.role === "super" ? "مدیر ارشد" : "ویراستار"} • آنلاین
            </span>
          </span>
          <button
            type="button"
            onClick={logout}
            title="خروج"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-white/50 transition hover:border-red-400/40 hover:text-red-300"
          >
            <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M14 4H6v16h8" strokeLinejoin="round" />
              <path d="m10 12 11 0M18 8l3 4-3 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
