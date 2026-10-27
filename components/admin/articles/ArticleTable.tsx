"use client";

import React from "react";
import { toFa } from "@/lib/fa";

const FALLBACK_COVER = "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=85";

const statusMeta: Record<string, { label: string }> = {
  published: { label: "منتشر شده" },
  draft: { label: "پیش‌نویس" },
  archived: { label: "آرشیو" },
};

export interface RealArticle {
  id: number; title: string; slug: string; language: string; excerpt: string;
  reading_time_minutes: number; status: string; view_count?: number; image?: string; 
  category_name?: string; category_translation_id?: number; created_at: string;
}

interface ArticleTableProps {
  loading: boolean;
  articles: RealArticle[];
  transCats: { id: number | string; name: string }[];
  onEdit: (article: RealArticle) => void;
  onDeleteRequest: (articleId: number) => void;
}

export default function ArticleTable({ loading, articles, transCats, onEdit, onDeleteRequest }: ArticleTableProps) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#071018] shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-right text-xs">
          <thead className="bg-white/[0.02]">
            <tr className="border-b border-white/5 text-[11px] text-white/40">
              <th className="px-6 py-5 font-bold">مشخصات مقاله</th>
              <th className="px-6 py-5 font-bold">زبان</th>
              <th className="px-6 py-5 font-bold">دسته‌بندی</th>
              <th className="px-6 py-5 font-bold">بازدید</th>
              <th className="px-6 py-5 font-bold">وضعیت</th>
              <th className="px-6 py-5 font-bold">اقدام</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={6}>
                  <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
                     <span className="relative flex h-4 w-4">
                       <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39f77b] opacity-60"></span>
                       <span className="relative inline-flex h-4 w-4 rounded-full bg-[#39f77b]"></span>
                     </span>
                     <p className="text-xs font-bold tracking-widest text-white/40">در حال دریافت مقالات...</p>
                  </div>
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  {/* طراحی بسیار شیک برای زمانی که مقاله‌ای یافت نشد */}
                  <div className="flex flex-col items-center justify-center py-24 opacity-70">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.02] border border-white/5">
                        <svg className="h-8 w-8 text-white/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <p className="text-sm font-black text-white/60">هیچ مقاله‌ای یافت نشد.</p>
                    <p className="mt-2 text-xs font-bold text-white/30">برای شروع، یک مقاله جدید بنویسید یا فیلترها را تغییر دهید.</p>
                  </div>
                </td>
              </tr>
            ) : (
              articles.map((a) => {
                const st = statusMeta[a.status] ?? statusMeta.draft;
                const catName = transCats.find((t) => String(t.id) === String(a.category_translation_id))?.name || "نامشخص";
                
                return (
                  <tr key={a.id} className="group transition-colors duration-300 hover:bg-white/[0.02]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-xl border border-white/5 bg-[#050b11]">
                          <div className="absolute inset-0 z-10 bg-[#39f77b]/20 opacity-0 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-100"></div>
                          <img src={a.image || FALLBACK_COVER} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        </div>
                        <span className="min-w-0">
                          <span className="block max-w-[280px] truncate text-[13px] font-black text-white/90 transition-colors group-hover:text-white">
                            {a.title}
                          </span>
                          <span className="mt-1.5 block truncate text-[10px] font-bold text-white/30" dir="ltr">
                            /{a.slug}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase ${a.language === "fa" ? "border-[#39f77b]/20 bg-[#39f77b]/10 text-[#39f77b]" : "border-[#00c8ff]/20 bg-[#00c8ff]/10 text-[#00c8ff]"}`}>
                        {a.language === "fa" ? "FA" : "EN"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-white/50">{catName}</td>
                    <td className="px-6 py-4 font-black text-white/70" dir="ltr">{toFa(a.view_count || 0)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[10px] font-black transition-all ${
                          a.status === "published" 
                            ? "border-[#39f77b]/20 bg-[#39f77b]/10 text-[#39f77b]" 
                            : a.status === "archived"
                            ? "border-white/10 bg-white/5 text-white/50"
                            : "border-[#00c8ff]/20 bg-[#00c8ff]/10 text-[#00c8ff]"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${a.status === "published" ? "bg-[#39f77b] shadow-[0_0_5px_#39f77b]" : a.status === "archived" ? "bg-white/40" : "bg-[#00c8ff] shadow-[0_0_5px_#00c8ff]"}`}></span>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => onEdit(a)} className="rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2 font-bold text-white/70 transition-all hover:border-[#00c8ff]/30 hover:bg-[#00c8ff]/10 hover:text-[#00c8ff]">
                          ویرایش
                        </button>
                        <button onClick={() => onDeleteRequest(a.id)} className="rounded-xl border border-white/10 bg-[#0b1722] px-3 py-2 font-bold text-white/70 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400">
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}