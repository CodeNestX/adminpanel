"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
// وارد کردن صحیح توابع از فایل admin.ts
import { getAdminsList, createAdmin, updateAdmin, deleteAdmin } from "@/api/admin";

type AdminRole = "super_admin" | "editor" | "admin";

// تایپ‌ها دقیقاً با ساختار دیتابیس شما هماهنگ شده است
interface AdminUser {
  id: number;
  admin_name: string;
  role: AdminRole;
  created_at?: string;
}

const roleLabel: Record<string, string> = { 
  super_admin: "مدیر ارشد", 
  editor: "ویراستار", 
  admin: "مدیر" 
};

export default function AdminsPage() {
  const { user } = useAdminAuth();
  
  const [list, setList] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | { editing: AdminUser | null }>(null);
  
  // فیلدهای فرم دقیقاً مطابق فیلدهای بک‌اند شماست
  const [form, setForm] = useState({ admin_name: "", password: "", role: "editor" as AdminRole });

  // دریافت اطلاعات با جلوگیری قطعی از ارور .map
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await getAdminsList();
      
      // استخراج هوشمندانه آرایه (برای حل مشکل map.)
      const adminsArray = Array.isArray(res?.data) ? res.data : 
                          Array.isArray(res?.admins) ? res.admins : 
                          Array.isArray(res) ? res : [];
                          
      setList(adminsArray); 
    } catch (error) {
      console.error("خطا در دریافت لیست مدیران:", error);
      setList([]); // در صورت بروز ارور، لیست خالی می‌شود تا برنامه کرش نکند
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // محافظت از صفحه برای سوپر ادمین
  if (user?.role !== "super_admin" && user?.role !== "admin") {
    return (
      <div className="ev-card rounded-2xl p-10 text-center">
        <p className="text-sm font-extrabold text-white">دسترسی محدود است</p>
        <p className="mt-2 text-xs leading-6 text-white/45">
          مدیریت ادمین‌ها فقط برای مدیر ارشد فعال است.
        </p>
      </div>
    );
  }

  const openCreate = () => {
    setForm({ admin_name: "", password: "", role: "editor" });
    setModal({ editing: null });
  };

  const openEdit = (a: AdminUser) => {
    setForm({ admin_name: a.admin_name, password: "", role: a.role });
    setModal({ editing: a });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.admin_name.trim()) return;

    try {
      if (modal?.editing) {
        // آپدیت ادمین با استفاده از فایل api
        await updateAdmin(modal.editing.id, { 
          admin_name: form.admin_name, 
          password: form.password || undefined, 
          role: form.role 
        });
      } else {
        if (!form.password.trim()) {
           alert("برای ساخت ادمین جدید، رمز عبور الزامی است.");
           return;
        }
        // ایجاد ادمین با استفاده از فایل api
        await createAdmin(form);
      }
      
      setModal(null);
      fetchAdmins(); // رفرش لیست
    } catch (error: any) {
      alert(error.message || "خطایی رخ داد");
    }
  };

  const removeAdmin = async (id: number) => {
    if(!confirm("آیا از حذف این ادمین مطمئن هستید؟")) return;
    try {
      await deleteAdmin(id);
      fetchAdmins();
    } catch (error: any) {
      alert(error.message || "خطا در حذف ادمین");
    }
  };

  return (
    <div className="space-y-4">
      <div className="ev-card flex items-center rounded-2xl p-4">
        <p className="text-xs text-white/45">فقط مدیر ارشد می‌تواند ادمین اضافه یا ویرایش کند.</p>
        <button
          type="button"
          onClick={openCreate}
          className="ms-auto rounded-xl bg-[#39f77b] px-5 py-2.5 text-xs font-extrabold text-[#031008] transition hover:brightness-110"
        >
          + ادمین جدید
        </button>
      </div>

      <div className="ev-card overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          {loading ? (
            <p className="p-10 text-center text-xs text-white/50">در حال دریافت اطلاعات...</p>
          ) : (
            <table className="w-full min-w-[720px] text-right text-xs">
              <thead>
                <tr className="border-b border-white/5 text-white/40">
                  <th className="px-5 py-3 font-bold">نام کاربری</th>
                  <th className="px-5 py-3 font-bold">شناسه سیستم</th>
                  <th className="px-5 py-3 font-bold">نقش</th>
                  <th className="px-5 py-3 font-bold">تاریخ ایجاد</th>
                  <th className="px-5 py-3 font-bold">اقدام</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(list) && list.length > 0 ? (
                  list.map((a) => (
                    <tr key={a.id} className="border-b border-white/5 last:border-0">
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#00c8ff] to-[#39f77b] text-xs font-extrabold text-[#041009]">
                            {a.admin_name?.trim().charAt(0).toUpperCase() || "A"}
                          </span>
                          <span className="block font-bold text-white">{a.admin_name}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3 text-white/55" dir="ltr">
                        {a.id}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            a.role === "super_admin" ? "bg-violet-400/10 text-violet-300" : "bg-[#00c8ff]/10 text-[#00c8ff]"
                          }`}
                        >
                          {roleLabel[a.role] || "مدیر"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-white/55" dir="ltr">
                        {a.created_at ? new Date(a.created_at).toLocaleDateString('fa-IR') : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(a)}
                            className="rounded-lg border border-white/10 px-3 py-1.5 font-bold text-white/70 transition hover:border-[#00c8ff]/40 hover:text-[#00c8ff]"
                          >
                            ویرایش
                          </button>
                          {a.role !== "super_admin" && String(a.id) !== String(user?.id) && (
                            <button
                                type="button"
                                onClick={() => removeAdmin(a.id)}
                                className="rounded-lg border border-white/10 px-3 py-1.5 font-bold text-white/70 transition hover:border-red-400/40 hover:text-red-300"
                            >
                                حذف
                            </button>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-white/40">
                      هیچ ادمینی یافت نشد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form onSubmit={submit} className="ev-card w-full max-w-sm rounded-3xl p-6">
            <h2 className="text-base font-extrabold text-white">{modal.editing ? "ویرایش ادمین" : "ادمین جدید"}</h2>
            <div className="mt-4 space-y-3">
              <input
                value={form.admin_name}
                onChange={(e) => setForm({ ...form, admin_name: e.target.value })}
                placeholder="نام کاربری (الزامی)"
                dir="ltr"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-left text-sm text-white outline-none placeholder:text-white/30 focus:border-[#39f77b]/50"
              />
              <input
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={modal.editing ? "رمز جدید (اختیاری)" : "رمز عبور (الزامی)"}
                dir="ltr"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-left text-sm text-white outline-none placeholder:text-white/30 focus:border-[#39f77b]/50"
              />
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as AdminRole })}
                className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2.5 text-sm text-white outline-none"
              >
                <option value="editor">ویراستار</option>
                <option value="admin">مدیر</option>
                {user?.role === "super_admin" && (
                    <option value="super_admin">مدیر ارشد</option>
                )}
              </select>
            </div>
            <div className="mt-5 flex gap-2">
              <button type="submit" className="flex-1 rounded-xl bg-[#39f77b] py-3 text-sm font-extrabold text-[#031008] transition hover:brightness-110">
                ذخیره
              </button>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-bold text-white/60"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}