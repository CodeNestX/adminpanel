"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getPendingComments, getApprovedComments, updateCommentStatus, deleteComment } from "@/api/comments";
import { toFa } from "@/lib/fa";

// استیت وضعیت‌ها بر اساس بک‌اند
type Tab = "pending" | "approved";

const tabs = [
  { id: "pending" as Tab, label: "در انتظار تایید" },
  { id: "approved" as Tab, label: "تایید شده" },
];

const tabStyle: Record<Tab, string> = {
  pending: "bg-amber-400/10 text-amber-300",
  approved: "bg-[#39f77b]/10 text-[#39f77b]",
};

// تایپ داده‌های واقعی دریافتی از بک‌اند شما
interface RealComment {
  id: number;
  article_id: number;
  user_id: number;
  content: string;
  status: string;
  created_at: string;
  user_name: string;
  user_email: string;
  articleTitle: string;
  articleSlug: string;
}

export default function CommentsPage() {
  const [list, setList] = useState<RealComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("pending");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  // لود کردن کامنت‌ها براساس تب فعال
  const fetchComments = async (currentTab: Tab) => {
    try {
      setLoading(true);
      const res = currentTab === "pending" ? await getPendingComments() : await getApprovedComments();
      setList(res.data || []);
    } catch (error) {
      console.error("خطا در دریافت نظرات:", error);
    } finally {
      setLoading(false);
    }
  };

  // هر بار که تب عوض شود دیتای مربوطه لود می‌شود
  useEffect(() => {
    fetchComments(tab);
  }, [tab]);

  // تغییر وضعیت کامنت (تایید کردن یا برگرداندن به حالت انتظار)
  const setStatus = async (id: number, newStatus: "approved" | "pending") => {
    try {
      await updateCommentStatus(id, newStatus);
      // پس از تغییر وضعیت موفق، کامنت را از لیست تب فعلی حذف می‌کنیم تا به تب دیگر برود
      setList((prev) => prev.filter((c) => c.id !== id));
    } catch (error: any) {
      alert(error.message || "خطا در تغییر وضعیت نظر");
    }
  };

  // حذف دائمی کامنت
  const removeComment = async (id: number) => {
    try {
      await deleteComment(id);
      setList((prev) => prev.filter((c) => c.id !== id));
      setConfirmDelete(null);
    } catch (error: any) {
      alert(error.message || "خطا در حذف نظر");
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
            {/* تعداد فقط وقتی نمایش داده می‌شود که در همان تب باشیم */}
            {tab === t.id && ` (${toFa(list.length)})`}
          </button>
        ))}
        <p className="ms-auto text-[11px] text-white/40">
          دیدگاه‌ها را تایید کنید تا در سایت نمایش داده شوند.
        </p>
      </div>

      {/* لیست کامنت‌ها */}
      <div className="space-y-3">
        {loading && <p className="ev-card rounded-2xl p-10 text-center text-xs text-white/40">در حال دریافت نظرات...</p>}
        
        {!loading && list.map((c) => (
          <article key={c.id} className="ev-card rounded-2xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00c8ff]/70 to-[#39f77b]/70 text-sm font-extrabold text-[#041009]">
                  {c.user_name ? c.user_name.trim().charAt(0) : "U"}
                </span>
                <span>
                  <span className="block text-sm font-bold text-white">{c.user_name || "کاربر سایت"}</span>
                  <span className="mt-0.5 block text-[11px] text-white/40">
                    {new Date(c.created_at).toLocaleDateString("fa-IR")} • مقاله:{" "}
                    <Link
                      href={`/articles/${encodeURIComponent(c.articleSlug)}`}
                      className="text-[#00c8ff] hover:underline"
                    >
                      {c.articleTitle}
                    </Link>
                  </span>
                </span>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${tabStyle[tab]}`}>
                {tabs.find((t) => t.id === tab)?.label}
              </span>
            </div>

            <p className="mt-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-sm leading-8 text-white/75">
              {c.content}
            </p>

            {/* دکمه‌های اکشن */}
            <div className="mt-3 flex flex-wrap gap-2">
              {c.status !== "approved" && (
                <button
                  type="button"
                  onClick={() => setStatus(c.id, "approved")}
                  className="rounded-xl bg-[#39f77b] px-5 py-2 text-[11px] font-extrabold text-[#031008] transition hover:brightness-110"
                >
                  تایید و نمایش
                </button>
              )}
              {c.status !== "pending" && (
                <button
                  type="button"
                  onClick={() => setStatus(c.id, "pending")}
                  className="rounded-xl border border-white/10 px-5 py-2 text-[11px] font-bold text-white/60 transition hover:text-white"
                >
                  برگشت به انتظار
                </button>
              )}
              <button
                type="button"
                onClick={() => setConfirmDelete(c.id)}
                className="rounded-xl border border-white/10 px-5 py-2 text-[11px] font-bold text-white/60 transition hover:border-red-400/40 hover:text-red-300"
              >
                حذف دائم
              </button>
            </div>
          </article>
        ))}
        
        {!loading && list.length === 0 && (
          <p className="ev-card rounded-2xl p-10 text-center text-xs text-white/40">
            دیدگاهی در این بخش نیست.
          </p>
        )}
      </div>

      {/* مودال تایید حذف */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="ev-card w-full max-w-sm rounded-3xl p-6 text-center">
            <p className="text-sm font-bold text-white">این دیدگاه برای همیشه حذف شود؟</p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => removeComment(confirmDelete)}
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