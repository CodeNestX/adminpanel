/**
 * کامپوننت مدیریت دسته‌بندی‌ها (CategoryManager)
 * 
 * کاربرد: یک مودال (پاپ‌آپ) یکپارچه برای ساخت، ویرایش و حذف دسته‌بندی‌های سایت.
 * این کامپوننت مستقیماً در صفحه مدیریت مقالات فراخوانی می‌شود.
 * 
 * ویژگی‌های کلیدی (بر اساس معماری دیتابیس):
 * - ساختار چندزبانه (پدر و فرزندی): امکان ساخت "والد خنثی" (Base Category) به عنوان یک پوشه اصلی، 
 *   و سپس ساخت "ترجمه‌ها" (Sub Category) برای زبان‌های مختلف (فارسی/انگلیسی) زیرمجموعه آن والد.
 * - ویرایش درجا (Inline Editing): امکان تغییر نام و نامک (Slug) مستقیماً درون لیست.
 * - متصل به بک‌اند: تمامی عملیات با APIهای واقعی (createBaseCategory, createCategoryTranslation و...) همگام است.
 * - توسعه‌پذیر: برای افزودن زبان جدید (مثلاً فرانسوی)، فقط کافیست کد آن را به آرایه `SUPPORTED_LANGUAGES` اضافه کنید.
 */

"use client";

import { useState, useEffect } from "react";
import {
  getBaseCategories,
  getAllCategoryTranslations,
  createBaseCategory,
  createCategoryTranslation,
  updateBaseCategory,
  updateCategoryTranslation,
  deleteBaseCategory,
  deleteCategoryTranslation,
} from "@/api/categories";
import { toFa } from "@/lib/fa";

// اگر زبان جدیدی نیاز شد فقط به این لیست اضافه کنید
export const SUPPORTED_LANGUAGES = [
  { code: "fa", name: "فارسی" },
  { code: "en", name: "انگلیسی" },
];

export type Category = {
  id: number | string;
  name: string;
  lang: string | null;
  parentId: number | string | null;
  slug: string;
};

// کامپوننت سطر برای هر دسته‌بندی
function SubRow({
  cat,
  editingId,
  editName,
  setEditName,
  editSlug,
  setEditSlug,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  confirmId,
  setConfirmId,
  onRemove,
  onError,
}: {
  cat: Category;
  editingId: string | number | null;
  editName: string;
  setEditName: (v: string) => void;
  editSlug: string;
  setEditSlug: (v: string) => void;
  onStartEdit: (c: Category) => void;
  onSaveEdit: (c: Category) => void;
  onCancelEdit: () => void;
  confirmId: string | number | null;
  setConfirmId: (v: string | number | null) => void;
  onRemove: (c: Category) => void;
  onError: (v: string | null) => void;
}) {
  const isEditing = editingId === cat.id;
  const isParent = cat.parentId === null;

  return (
    <li
      className={`flex items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.02] px-3 py-2.5 ${
        !isParent ? "ms-6 border-r-2 border-r-[#00c8ff]/30" : ""
      }`}
    >
      {isEditing ? (
        <>
          <span className="min-w-0 flex-1 space-y-1.5">
            <input
              value={editName}
              onChange={(e) => {
                setEditName(e.target.value);
                onError(null);
              }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSaveEdit(cat);
                }
                if (e.key === "Escape") onCancelEdit();
              }}
              placeholder="نام جدید"
              className="w-full rounded-lg border border-[#39f77b]/40 bg-white/[0.03] px-3 py-1.5 text-xs text-white outline-none placeholder:text-white/30"
            />
            {!isParent && (
              <input
                value={editSlug}
                onChange={(e) => {
                  setEditSlug(e.target.value);
                  onError(null);
                }}
                placeholder="نامک (slug)"
                dir="ltr"
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-left text-[11px] text-white outline-none placeholder:text-white/30"
              />
            )}
          </span>
          <button
            type="button"
            onClick={() => onSaveEdit(cat)}
            className="shrink-0 rounded-lg bg-[#39f77b] px-3 py-1.5 text-[10px] font-extrabold text-[#031008]"
          >
            ذخیره
          </button>
          <button
            type="button"
            onClick={onCancelEdit}
            className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-[10px] font-bold text-white/60"
          >
            انصراف
          </button>
        </>
      ) : (
        <>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-bold text-white">
              {!isParent && <span className="text-[#00c8ff]">↳ </span>}
              {cat.name}
            </span>
            <span className="mt-1 flex items-center gap-1.5 text-[10px] text-white/35">
              {isParent ? (
                <span className="rounded bg-white/10 px-1.5 py-0.5 font-bold text-white/55">
                  والد • غیرقابل انتخاب
                </span>
              ) : (
                <>
                  <span
                    className={`rounded px-1.5 py-0.5 font-bold ${
                      cat.lang === "fa" ? "bg-[#39f77b]/10 text-[#39f77b]" : "bg-[#00c8ff]/10 text-[#00c8ff]"
                    }`}
                  >
                    {SUPPORTED_LANGUAGES.find((l) => l.code === cat.lang)?.name || cat.lang}
                  </span>
                  <span dir="ltr" className="rounded bg-white/5 px-1.5 py-0.5 font-mono">
                    /{cat.slug}
                  </span>
                </>
              )}
            </span>
          </span>
          {confirmId === cat.id ? (
            <span className="flex shrink-0 gap-1.5">
              <button
                type="button"
                onClick={() => onRemove(cat)}
                className="rounded-lg bg-red-500 px-2.5 py-1 text-[10px] font-extrabold text-white"
              >
                حذف قطعی
              </button>
              <button
                type="button"
                onClick={() => setConfirmId(null)}
                className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60"
              >
                نه
              </button>
            </span>
          ) : (
            <span className="flex shrink-0 gap-1.5">
              <button
                type="button"
                onClick={() => onStartEdit(cat)}
                className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60 transition hover:border-[#00c8ff]/40 hover:text-[#00c8ff]"
              >
                ویرایش
              </button>
              <button
                type="button"
                onClick={() => {
                  onError(null);
                  onCancelEdit();
                  setConfirmId(cat.id);
                }}
                className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60 transition hover:border-red-400/40 hover:text-red-300"
              >
                حذف
              </button>
            </span>
          )}
        </>
      )}
    </li>
  );
}

export default function CategoryManager({ onClose }: { onClose: () => void }) {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [kind, setKind] = useState<"parent" | "sub">("sub");
  const [newLang, setNewLang] = useState<string>(SUPPORTED_LANGUAGES[0].code);
  const [newParent, setNewParent] = useState<string>("");
  const [newSlug, setNewSlug] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | number | null>(null);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // دریافت موازیِ هم پایه‌ها و هم ترجمه‌ها
      const [baseRes, transRes] = await Promise.all([
        getBaseCategories(),
        getAllCategoryTranslations(),
      ]);

      const baseCats = (baseRes.categories || []).map((c: any) => ({
        id: `base_${c.id}`, // برای تفکیک در لیست لوکال
        realId: c.id,
        name: c.name,
        lang: null,
        parentId: null,
        slug: "",
      }));

      const transCats = (transRes.data || transRes.translations || []).map((t: any) => ({
        id: `trans_${t.id}`,
        realId: t.id,
        name: t.name,
        lang: t.language,
        parentId: `base_${t.category_id}`,
        slug: t.slug,
      }));

      setCats([...baseCats, ...transCats]);
    } catch (err: any) {
      setError(err.message || "خطا در لود دسته‌بندی‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const parents = cats.filter((c) => c.parentId === null);
  const getSubs = (parentId: string | number) => cats.filter((c) => c.parentId === parentId);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("نام دسته‌بندی الزامی است.");

    try {
      if (kind === "parent") {
        await createBaseCategory(name);
      } else {
        if (!newParent) return setError("انتخاب والد الزامی است.");
        if (!newSlug.trim()) return setError("نامک (Slug) الزامی است.");
        // شناسه اصلی بک‌اند را از آیدی لوکال جدا می‌کنیم
        const realParentId = newParent.replace("base_", "");
        await createCategoryTranslation({
          category_id: realParentId,
          language: newLang,
          name: name,
          slug: newSlug,
        });
      }
      
      setError(null);
      setName("");
      setNewSlug("");
      fetchCategories();
    } catch (err: any) {
      setError(err.message || "خطا در ذخیره دسته‌بندی.");
    }
  };

  const remove = async (c: Category) => {
    try {
      const realId = String(c.id).split("_")[1];
      if (c.parentId === null) {
        await deleteBaseCategory(realId);
      } else {
        await deleteCategoryTranslation(realId);
      }
      
      setConfirmId(null);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || "خطا در حذف دسته‌بندی.");
    }
  };

  const saveEdit = async (c: Category) => {
    if (!editName.trim()) return setError("نام نمی‌تواند خالی باشد.");
    try {
      const realId = String(c.id).split("_")[1];
      
      if (c.parentId === null) {
        await updateBaseCategory(realId, editName);
      } else {
        await updateCategoryTranslation(realId, { name: editName, slug: editSlug });
      }
      
      setError(null);
      setEditingId(null);
      setEditName("");
      setEditSlug("");
      fetchCategories();
    } catch (err: any) {
      setError(err.message || "خطا در ویرایش دسته‌بندی.");
    }
  };

  const rowProps = {
    editingId,
    editName,
    setEditName,
    editSlug,
    setEditSlug,
    onStartEdit: (c: Category) => {
      setError(null);
      setConfirmId(null);
      setEditingId(c.id);
      setEditName(c.name);
      setEditSlug(c.slug || "");
    },
    onSaveEdit: saveEdit,
    onCancelEdit: () => setEditingId(null),
    confirmId,
    setConfirmId,
    onRemove: remove,
    onError: setError,
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="ev-card w-full max-w-md rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-white">مدیریت دسته‌بندی‌ها</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-white/50 transition hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-2.5">
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder={kind === "parent" ? "نام والد جدید..." : "نام زیردسته جدید..."}
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#39f77b]/50"
            />
            {kind === "sub" && (
              <input
                 value={newSlug}
                 onChange={(e) => setNewSlug(e.target.value)}
                 placeholder="اسلاگ (انگلیسی)"
                 dir="ltr"
                 className="w-1/3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[11px] text-white outline-none focus:border-[#39f77b]/50"
              />
            )}
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-[#39f77b] px-5 py-2.5 text-xs font-extrabold text-[#031008] transition hover:brightness-110"
            >
              + افزودن
            </button>
          </div>
          <div className="flex gap-2">
            <select
              value={kind}
              onChange={(e) => {
                setKind(e.target.value as "parent" | "sub");
                setNewParent("");
              }}
              className="flex-1 rounded-xl border border-white/10 bg-[#0b1722] px-3 py-2 text-[11px] text-white outline-none"
            >
              <option value="sub">زیردسته (با زبان)</option>
              <option value="parent">والد خنثی (بدون زبان)</option>
            </select>
            {kind === "sub" && (
              <>
                <select
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-[#0b1722] px-3 py-2 text-[11px] text-white outline-none"
                >
                  {SUPPORTED_LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
                <select
                  value={newParent}
                  onChange={(e) => setNewParent(e.target.value)}
                  className="flex-[2] rounded-xl border border-white/10 bg-[#0b1722] px-3 py-2 text-[11px] text-white outline-none"
                >
                  <option value="">— انتخاب والد —</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
          {kind === "parent" && (
            <p className="text-[11px] leading-5 text-white/35">
              والد فقط ظرفی برای گروه‌بندی است و در مقالات قابل انتخاب نیست؛ زبان را موقع ساخت زیردسته تعیین می‌کنید.
            </p>
          )}
        </form>

        {error && (
          <p className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-[11px] font-bold text-red-300">
            {error}
          </p>
        )}

        <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
          {loading ? (
             <p className="py-5 text-center text-xs text-white/40">در حال دریافت...</p>
          ) : parents.length === 0 ? (
            <p className="rounded-xl bg-white/[0.02] px-3 py-4 text-center text-[11px] text-white/30">
              هنوز والدی ساخته نشده است.
            </p>
          ) : (
            <ul className="space-y-2">
              {parents.flatMap((p) => [p, ...getSubs(p.id)]).map((c) => (
                <SubRow key={c.id} cat={c} {...rowProps} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}