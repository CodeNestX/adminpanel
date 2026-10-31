"use client";

import React from "react";
import BlockEditor from "@/components/admin/BlockEditor";
import { estimateReadingTime, slugify, ArticleBlock } from "@/lib/articleBlocks";

export interface ArticleForm {
  title: string;
  slug: string;
  lang: "fa" | "en";
  parentId: string; 
  subId: string; 
  imageFile?: File | null;
  imageUrl: string;
  coverAlt: string;    // فقط آلت برای کاور
  excerpt: string;
  status: string;
  readingTime: string | number;
  blocks: ArticleBlock[];
}

interface ArticleFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  form: ArticleForm | null;
  setForm: React.Dispatch<React.SetStateAction<ArticleForm | null>>;
  formError: string | null;
  isBusy: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  baseCats: any[];
  getSubs: (parentId: string, lang: string) => any[];
}

export default function ArticleFormModal({
  isOpen,
  isEditing,
  form,
  setForm,
  formError,
  isBusy,
  onSubmit,
  onClose,
  baseCats,
  getSubs,
}: ArticleFormModalProps) {
  if (!isOpen || !form) return null;

  const formDir = form.lang === "en" ? "ltr" : "rtl";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <form onSubmit={onSubmit} className="ev-card flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl">
        
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h2 className="text-base font-bold text-white">
            {isEditing ? "ویرایش مقاله" : "مقاله جدید"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-white/60">زبان مقاله *</label>
              <select
                value={form.lang}
                onChange={(e) => {
                  const lang = e.target.value as "fa" | "en";
                  const subs = getSubs(form.parentId, lang);
                  setForm({ ...form, lang, subId: subs[0]?.id ? String(subs[0].id) : "" });
                }}
                className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2 text-sm text-white outline-none"
              >
                <option value="fa">فارسی</option>
                <option value="en">انگلیسی</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-white/60">دسته‌بندی والد *</label>
              <select
                value={form.parentId}
                onChange={(e) => {
                  const parentId = e.target.value;
                  const subs = getSubs(parentId, form.lang);
                  setForm({ ...form, parentId, subId: subs[0]?.id ? String(subs[0].id) : "" });
                }}
                className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2 text-sm text-white outline-none"
              >
                {baseCats.map((p) => (
                  <option key={p.id} value={p.id}>والد: {p.name}</option>
                ))}
                {baseCats.length === 0 && <option value="">بدون والد</option>}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-white/60">دسته‌بندی فرعی *</label>
              <select
                value={form.subId}
                onChange={(e) => setForm({ ...form, subId: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2 text-sm text-white outline-none"
              >
                {getSubs(form.parentId, form.lang).map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
                {getSubs(form.parentId, form.lang).length === 0 && (
                  <option value="">— ترجمه‌ای ثبت نشده —</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold text-white/60">عنوان مقاله *</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              dir={formDir}
              className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2 text-sm text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-white/60">نامک (Slug)</label>
              <div className="flex gap-2">
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  dir="ltr"
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2 text-left text-sm text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, slug: slugify(form.title || `article-${Date.now()}`) })}
                  className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/60 hover:text-white"
                >
                  خودکار
                </button>
              </div>
            </div>
            
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-white/60">وضعیت انتشار *</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2 text-sm text-white outline-none"
              >
                <option value="published">منتشرشده</option>
                <option value="draft">پیش‌نویس</option>
                <option value="archived">آرشیو</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4">
            <label className="mb-2 block text-[11px] font-bold text-white/60">عکس کاور مقاله</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setForm({ ...form, imageFile: file, imageUrl: URL.createObjectURL(file) });
              }}
              className="w-full text-sm text-white/50 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
            />
            {form.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.imageUrl} alt="cover" className="mt-3 h-40 w-full rounded-xl object-cover" />
            )}
            
            {/* فقط فیلد آلت برای کاور */}
            <div className="mt-4">
              <label className="mb-1.5 block text-[11px] font-bold text-white/60">متن جایگزین کاور (Alt سئو) *</label>
              <input
                value={form.coverAlt || ""}
                onChange={(e) => setForm({ ...form, coverAlt: e.target.value })}
                placeholder="توضیح عکس برای موتورهای جستجو..."
                className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-white/60">زمان مطالعه (دقیقه)</label>
              <input
                type="number"
                value={form.readingTime}
                onChange={(e) => setForm({ ...form, readingTime: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2 text-sm text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-bold text-white/60">خلاصه مقاله (توضیحات کوتاه برای نمایش در لیست‌ها)</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={3}
              dir={formDir}
              className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2 text-sm leading-7 text-white outline-none"
            />
          </div>

          <div dir={formDir} className="pt-2">
            <label className="mb-2 block text-sm font-bold text-white">محتوای اصلی مقاله</label>
            <BlockEditor 
              blocks={form.blocks} 
              onChange={(blocks) => {
                const calculatedTime = estimateReadingTime(blocks);
                setForm({ ...form, blocks, readingTime: calculatedTime });
              }} 
            />
          </div>
        </div>

        {/* اضافه شدن دکمه انصراف به صورت کاملاً واضح */}
        <div className="border-t border-white/5 px-6 py-4 bg-[#071018]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="rounded-xl border border-white/10 bg-[#0b1722] px-8 py-3 text-sm font-bold text-white/70 transition-all hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isBusy}
              className="flex-1 rounded-xl bg-[#00c8ff] py-3 text-sm font-bold text-[#050b11] transition hover:brightness-110 disabled:opacity-50"
            >
              {isBusy ? "در حال ذخیره‌سازی..." : "ذخیره مقاله"}
            </button>
          </div>
          {formError && (
            <p className="mt-3 text-center text-xs font-bold text-red-400">
              {formError}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}