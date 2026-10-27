"use client";

import { useEffect, useState } from "react";
import { getUnreadMessages, getReadMessages, updateMessageStatus, deleteMessage } from "@/api/messages";
import { toFa } from "@/lib/fa";

type Tab = "unread" | "read";

const tabs = [
  { id: "unread" as Tab, label: "خوانده نشده" },
  { id: "read" as Tab, label: "خوانده شده" },
];

const tabStyle: Record<Tab, string> = {
  unread: "bg-[#00c8ff]/10 text-[#00c8ff]",
  read: "bg-white/5 text-white/50",
};

// ساختار دیتای واقعی پیام‌ها بر اساس بک‌اند
interface RealMessage {
  id: number;
  name: string;
  email: string | null;
  mobile: string | null;
  subject: string;
  message: string;
  status: string; // 'read' | 'unread'
  created_at: string;
}

export default function MessagesPage() {
  const [list, setList] = useState<RealMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("unread");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  // دریافت اطلاعات از بک‌اند بر اساس تب فعال
  const fetchMessages = async (currentTab: Tab) => {
    try {
      setLoading(true);
      const res = currentTab === "unread" ? await getUnreadMessages() : await getReadMessages();
      setList(res.data || []);
    } catch (error) {
      console.error("خطا در دریافت پیام‌ها:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(tab);
  }, [tab]);

  // تغییر وضعیت خوانده شده / نشده
  const setStatus = async (id: number, newStatus: "read" | "unread") => {
    try {
      await updateMessageStatus(id, newStatus);
      // حذف از لیست تب فعلی (چون وضعیتش تغییر کرده و به تب دیگر می‌رود)
      setList((prev) => prev.filter((m) => m.id !== id));
    } catch (error: any) {
      alert(error.message || "خطا در تغییر وضعیت پیام");
    }
  };

  // حذف دائم
  const remove = async (id: number) => {
    try {
      await deleteMessage(id);
      setList((prev) => prev.filter((m) => m.id !== id));
      setConfirmDelete(null);
    } catch (error: any) {
      alert(error.message || "خطا در حذف پیام");
    }
  };

  return (
    <div className="space-y-4">
      {/* هدر و تب‌ها */}
      <div className="ev-card flex flex-wrap items-center gap-2 rounded-2xl p-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              tab === t.id ? tabStyle[t.id] : "bg-white/[0.03] text-white/50 hover:text-white"
            }`}
          >
            {t.label} 
            {tab === t.id && ` (${toFa(list.length)})`}
          </button>
        ))}
        <p className="ms-auto text-[11px] text-white/40">
          پیام‌های ارسالی از فرم تماس با ما
        </p>
      </div>

      {/* لیست پیام‌ها */}
      <div className="space-y-3">
        {loading && <p className="ev-card rounded-2xl p-10 text-center text-xs text-white/40">در حال دریافت پیام‌ها...</p>}

        {!loading && list.map((m) => (
          <article key={m.id} className="ev-card rounded-2xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00c8ff]/70 to-[#39f77b]/70 text-sm font-extrabold text-[#041009]">
                  {m.name.trim().charAt(0)}
                </span>
                <div>
                  <span className="block text-sm font-bold text-white">{m.name}</span>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-white/40">
                    <span dir="ltr">{m.mobile || "—"}</span>
                    <span>•</span>
                    <span dir="ltr">{m.email || "—"}</span>
                    <span>•</span>
                    <span>{new Date(m.created_at).toLocaleDateString("fa-IR")}</span>
                  </div>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${tabStyle[tab]}`}>
                {tabs.find((t) => t.id === tab)?.label}
              </span>
            </div>

            <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
              <p className="text-xs font-extrabold text-[#39f77b]">{m.subject}</p>
              <p className="mt-2 text-sm leading-8 text-white/75">{m.message}</p>
            </div>

            {/* دکمه‌های اکشن */}
            <div className="mt-3 flex flex-wrap gap-2">
              {m.status === "unread" && (
                <button
                  type="button"
                  onClick={() => setStatus(m.id, "read")}
                  className="rounded-xl bg-[#00c8ff] px-5 py-2 text-[11px] font-extrabold text-[#031008] transition hover:brightness-110"
                >
                  علامت به عنوان خوانده شده
                </button>
              )}
              {m.status === "read" && (
                <button
                  type="button"
                  onClick={() => setStatus(m.id, "unread")}
                  className="rounded-xl border border-white/10 px-5 py-2 text-[11px] font-bold text-white/60 transition hover:text-white"
                >
                  علامت به عنوان خوانده نشده
                </button>
              )}
              <button
                type="button"
                onClick={() => setConfirmDelete(m.id)}
                className="rounded-xl border border-white/10 px-5 py-2 text-[11px] font-bold text-white/60 transition hover:border-red-400/40 hover:text-red-300"
              >
                حذف پیام
              </button>
            </div>
          </article>
        ))}

        {!loading && list.length === 0 && (
          <p className="ev-card rounded-2xl p-10 text-center text-xs text-white/40">
            پیامی در این بخش وجود ندارد.
          </p>
        )}
      </div>

      {/* مودال تایید حذف */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="ev-card w-full max-w-sm rounded-3xl p-6 text-center">
            <p className="text-sm font-bold text-white">این پیام برای همیشه حذف شود؟</p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => remove(confirmDelete)}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-extrabold text-white"
              >
                حذف
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-bold text-white/60"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}