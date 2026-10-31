/**
 * کامپوننت ArticleFormModal
 * این فایل وظیفه نمایش پاپ‌آپ (مدال) ایجاد و ویرایش مقالات را بر عهده دارد.
 * 
 * مسئولیت‌های اصلی:
 * ۱. مدیریت فرم اطلاعات پایه مقاله (عنوان، نامک، زبان، کاور، و وضعیت انتشار).
 * ۲. فیلتر و بارگذاری خودکار زیردسته‌ها بر اساس زبان و دسته‌بندی والدِ انتخاب‌شده.
 * ۳. یکپارچگی با ویرایشگر متن (BlockEditor) و محاسبه خودکار زمان مطالعه.
 * ۴. مدیریت اعتبارسنجی فرم و حالت‌های در حال پردازش (Loading/Busy) پیش از ارسال به سرور.
 */

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

          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder={form.lang === "fa" ? "عنوان مقاله *" : "Article title *"}
            dir={formDir}
            className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2 text-sm text-white outline-none focus:border-[#00c8ff]/50"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex gap-2">
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="نامک (slug)"
                dir="ltr"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2 text-left text-sm text-white outline-none focus:border-[#00c8ff]/50"
              />
              <button
                type="button"
                onClick={() => setForm({ ...form, slug: slugify(form.title || `article-${Date.now()}`) })}
                className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/60 hover:text-white"
              >
                خودکار
              </button>
            </div>
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

          <div>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setForm({ ...form, imageFile: file, imageUrl: URL.createObjectURL(file) });
              }}
              className="w-full text-sm text-white/50 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-white/20"
            />
            {form.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.imageUrl} alt="cover" className="mt-2 h-40 w-full rounded-xl object-cover" />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              type="number"
              value={form.readingTime}
              onChange={(e) => setForm({ ...form, readingTime: e.target.value })}
              placeholder="زمان مطالعه (دقیقه)"
              className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2 text-sm text-white outline-none focus:border-[#00c8ff]/50"
            />
          </div>

          <textarea
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            placeholder="خلاصه مقاله (توضیحات کوتاه)"
            rows={3}
            dir={formDir}
            className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2 text-sm leading-7 text-white outline-none focus:border-[#00c8ff]/50"
          />

          <div dir={formDir}>
            <p className="mb-2 text-sm font-bold text-white">محتوای مقاله</p>
            <BlockEditor 
              blocks={form.blocks} 
              onChange={(blocks) => {
                const calculatedTime = estimateReadingTime(blocks);
                setForm({ ...form, blocks, readingTime: calculatedTime });
              }} 
            />
          </div>
        </div>

        <div className="border-t border-white/5 px-6 py-4">
          <button
            type="submit"
            disabled={isBusy}
            className="w-full rounded-xl bg-[#00c8ff] py-3 text-sm font-bold text-[#050b11] transition hover:brightness-110 disabled:opacity-50"
          >
            {isBusy ? "در حال ذخیره‌سازی..." : "ذخیره مقاله"}
          </button>
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