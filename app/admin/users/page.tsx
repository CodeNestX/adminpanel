"use client";

import { useEffect, useMemo, useState } from "react";
import { toFa } from "@/lib/fa"; // توابع تبدیل اعداد به فارسی که داشتید حفظ شده است
import { getUsersList, updateUserStatus } from "@/api/users"; // اتصال به بک‌اند

// تطبیق با دیتابیس واقعی شما
interface RealUser {
  id: number | string;
  first_name: string | null;
  last_name: string | null;
  mobile: string | null;
  email: string | null;
  status: string; // معمولا 'active' یا 'blocked'
  created_at: string;
}

export default function UsersPage() {
  const [list, setList] = useState<RealUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // دریافت اطلاعات کاربران از بک‌اند
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsersList();
      // بک‌اند شما دیتا را در فیلد data برمی‌گرداند (طبق userController.js)
      setList(res.data || []);
    } catch (error) {
      console.error("خطا در دریافت لیست کاربران:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // هندل کردن تغییر وضعیت کاربر در دیتابیس
  const handleToggleStatus = async (user: RealUser) => {
    try {
      const newStatus = user.status === "active" ? "blocked" : "active";
      await updateUserStatus(user.id, newStatus);
      
      // آپدیت لیست لوکال برای سرعت بیشتر بدون نیاز به لودینگ مجدد
      setList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
    } catch (error: any) {
      alert(error.message || "خطایی رخ داد");
    }
  };

  // فیلتر کردن هوشمند برای باکس جستجو
  const filtered = useMemo(() => {
    const t = q.trim();
    if (!t) return list;
    return list.filter((u) => {
      const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim();
      return (
        fullName.includes(t) ||
        (u.email && u.email.includes(t)) ||
        (u.mobile && u.mobile.includes(t))
      );
    });
  }, [list, q]);

  return (
    <div className="space-y-4">
      <div className="ev-card flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجو نام، ایمیل یا موبایل..."
          className="w-full flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#39f77b]/50 sm:max-w-xs"
        />
        <p className="text-[11px] text-white/40 sm:ms-auto">
          مجموع: {toFa(list.length)} کاربر • {toFa(list.filter((u) => u.status === "active").length)} فعال
        </p>
      </div>

      <div className="ev-card overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          {loading ? (
             <p className="p-10 text-center text-xs text-white/50">در حال دریافت کاربران...</p>
          ) : (
            <table className="w-full min-w-[760px] text-right text-xs">
              <thead>
                <tr className="border-b border-white/5 text-white/40">
                  <th className="px-5 py-3 font-bold">کاربر</th>
                  <th className="px-5 py-3 font-bold">تماس</th>
                  <th className="px-5 py-3 font-bold">تاریخ عضویت</th>
                  <th className="px-5 py-3 font-bold">وضعیت</th>
                  <th className="px-5 py-3 font-bold">اقدام</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim() || "بدون نام";
                  
                  return (
                    <tr key={u.id} className="border-b border-white/5 last:border-0">
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00c8ff]/70 to-[#39f77b]/70 text-xs font-extrabold text-[#041009]">
                            {fullName.charAt(0)}
                          </span>
                          <span className="font-bold text-white">{fullName}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3 text-white/55">
                        <span className="block" dir="ltr">
                          {u.email || "—"}
                        </span>
                        <span className="mt-1 block text-[10px] text-white/35" dir="ltr">
                          {u.mobile || "—"}
                        </span>
                      </td>
                      {/* تاریخ عضویت را فعلا ساده نمایش می‌دهیم، می‌توانید بعدا تبدیل به شمسی کنید */}
                      <td className="px-5 py-3 text-white/55">
                        {new Date(u.created_at).toLocaleDateString("fa-IR") || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            u.status === "active"
                              ? "bg-[#39f77b]/10 text-[#39f77b]"
                              : "bg-red-500/10 text-red-300"
                          }`}
                        >
                          {u.status === "active" ? "فعال" : "مسدود"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          className={`rounded-lg border px-3 py-1.5 font-bold transition ${
                            u.status === "active"
                              ? "border-white/10 text-white/70 hover:border-red-400/40 hover:text-red-300"
                              : "border-[#39f77b]/30 text-[#39f77b] hover:bg-[#39f77b]/10"
                          }`}
                        >
                          {u.status === "active" ? "مسدود" : "رفع مسدودی"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-white/40">
                      کاربری پیدا نشد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}