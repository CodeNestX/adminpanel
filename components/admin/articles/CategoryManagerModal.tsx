"use client";

/**
 * کامپوننت CategoryManagerModal
 * این فایل وظیفه نمایش پاپ‌آپ (مدال) مدیریت دسته‌بندی‌ها را بر عهده دارد.
 * 
 * مسئولیت‌های اصلی:
 * ۱. ایجاد دسته‌بندی والد (پایه) و زیردسته‌های ترجمه‌شده (فارسی، انگلیسی).
 * ۲. نمایش لیست درختی دسته‌بندی‌ها (والدین و فرزندانشان).
 * ۳. ویرایش نام و نامک (Slug) درجا (Inline Edit) برای هر دسته‌بندی.
 * ۴. تایید و حذف دسته‌بندی‌ها و تماس با سرور به صورت کاملاً مستقل.
 */

import React, { useState, useEffect } from "react";
import { 
  getBaseCategories, 
  getAllCategoryTranslations,
  createBaseCategory,
  updateBaseCategory,
  deleteBaseCategory,
  createCategoryTranslation,
  updateCategoryTranslation,
  deleteCategoryTranslation
} from "@/api/categories";
import { slugify } from "@/lib/articleBlocks"; 

const SUPPORTED_LANGUAGES = [
  { code: "fa", name: "فارسی" },
  { code: "en", name: "انگلیسی" },
];

export interface CategoryItem {
  id: number | string;
  name: string;
  lang: string | null;
  parentId: number | string | null;
  slug: string;
}

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  // این تابع بعد از هر تغییر (ساخت/ویرایش/حذف) صدا زده می‌شود تا لیست مقالات در صفحه اصلی رفرش شود
  onCategoriesUpdated: () => void; 
}

export default function CategoryManagerModal({
  isOpen,
  onClose,
  onCategoriesUpdated
}: CategoryManagerModalProps) {
  
  // استیت‌های داخلیِ مختصِ دسته‌بندی
  const [catList, setCatList] = useState<CategoryItem[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catNameInput, setCatNameInput] = useState("");
  const [catKind, setCatKind] = useState<"parent" | "sub">("sub");
  const [catNewLang, setCatNewLang] = useState<string>("fa");
  const [catNewParent, setCatNewParent] = useState<string>("");
  const [catNewSlug, setCatNewSlug] = useState("");
  const [catError, setCatError] = useState<string | null>(null);
  
  const [catConfirmId, setCatConfirmId] = useState<string | number | null>(null);
  const [catEditingId, setCatEditingId] = useState<string | number | null>(null);
  const [catEditName, setCatEditName] = useState("");
  const [catEditSlug, setCatEditSlug] = useState("");

  // دریافت اطلاعات دسته‌بندی‌ها از سرور
  const fetchCategoriesFull = async () => {
    try {
      setCatLoading(true);
      const [baseRes, transRes] = await Promise.all([
        getBaseCategories(),
        getAllCategoryTranslations(),
      ]);

      const baseArr: CategoryItem[] = (baseRes.categories || []).map((b: any) => ({
        id: b.id, name: b.name, lang: null, parentId: null, slug: "",
      }));

      const transArr: CategoryItem[] = (transRes.translations || transRes.data || []).map((t: any) => ({
        id: t.id, name: t.name, lang: t.language, parentId: t.category_id, slug: t.slug,
      }));

      const combined = [...baseArr, ...transArr];
      setCatList(combined);

      if (baseArr.length > 0 && !catNewParent) {
        setCatNewParent(String(baseArr[0].id));
      }
    } catch (err) {
      console.error("خطا در دریافت دسته‌بندی‌ها:", err);
    } finally {
      setCatLoading(false);
    }
  };

  // هر بار که مدال باز می‌شود، اطلاعات را رفرش کن
  useEffect(() => {
    if (isOpen) {
      fetchCategoriesFull();
    } else {
      setCatError(null);
      setCatEditingId(null);
      setCatConfirmId(null);
      setCatNameInput("");
    }
  }, [isOpen]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameInput.trim()) {
      return setCatError("لطفاً نام دسته‌بندی را وارد کنید.");
    }

    try {
      setCatError(null);
      if (catKind === "parent") {
        await createBaseCategory(catNameInput.trim());
      } else {
        if (!catNewParent) return setCatError("لطفاً والد را انتخاب کنید.");
        await createCategoryTranslation({
          category_id: catNewParent,
          language: catNewLang,
          name: catNameInput.trim(),
          slug: catNewSlug.trim() || slugify(catNameInput.trim()),
        });
      }
      setCatNameInput("");
      setCatNewSlug("");
      await fetchCategoriesFull();
      onCategoriesUpdated();
    } catch (err: any) {
      setCatError(err.message || "خطا در ایجاد دسته‌بندی");
    }
  };

  const handleSaveCategoryEdit = async (cat: CategoryItem) => {
    if (!catEditName.trim()) return setCatError("نام دسته‌بندی نمی‌تواند خالی باشد.");
    try {
      setCatError(null);
      if (cat.parentId === null) {
        await updateBaseCategory(cat.id, catEditName.trim());
      } else {
        await updateCategoryTranslation(cat.id, {
          name: catEditName.trim(),
          slug: catEditSlug.trim() || slugify(catEditName.trim()),
        });
      }
      setCatEditingId(null);
      await fetchCategoriesFull();
      onCategoriesUpdated();
    } catch (err: any) {
      setCatError(err.message || "خطا در ویرایش دسته‌بندی");
    }
  };

  const handleRemoveCategory = async (cat: CategoryItem) => {
    try {
      setCatError(null);
      if (cat.parentId === null) {
        await deleteBaseCategory(cat.id);
      } else {
        await deleteCategoryTranslation(cat.id);
      }
      setCatConfirmId(null);
      await fetchCategoriesFull();
      onCategoriesUpdated();
    } catch (err: any) {
      setCatError(err.message || "خطا در حذف دسته‌بندی");
    }
  };

  if (!isOpen) return null;

  const parentCategories = catList.filter((c) => c.parentId === null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="ev-card flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-bold text-white/70 transition hover:border-[#39f77b]/40 hover:text-[#39f77b]"
            >
              بازگشت &larr;
            </button>
            <h2 className="text-base font-extrabold text-white">مدیریت دسته‌بندی‌ها</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-white/50 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <form onSubmit={handleCreateCategory} className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-xs font-extrabold text-[#39f77b]">افزودن دسته‌بندی جدید</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <select
                value={catKind}
                onChange={(e) => setCatKind(e.target.value as "parent" | "sub")}
                className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2.5 text-xs text-white outline-none"
              >
                <option value="sub">زیردسته (ترجمه)</option>
                <option value="parent">والد (پایه)</option>
              </select>
              <input
                value={catNameInput}
                onChange={(e) => {
                  setCatNameInput(e.target.value);
                  setCatError(null);
                }}
                placeholder={catKind === "parent" ? "نام والد (مثلاً مقالات)" : "نام زیرمجموعه (مثلاً ماشین برقی)"}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-white outline-none focus:border-[#39f77b]/50"
              />
            </div>

            {catKind === "sub" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <select
                  value={catNewParent}
                  onChange={(e) => setCatNewParent(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2.5 text-xs text-white outline-none"
                >
                  {parentCategories.map((p) => (
                    <option key={p.id} value={String(p.id)}>والد: {p.name}</option>
                  ))}
                  {parentCategories.length === 0 && <option value="">والدی موجود نیست</option>}
                </select>
                <select
                  value={catNewLang}
                  onChange={(e) => setCatNewLang(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2.5 text-xs text-white outline-none"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
                <input
                  value={catNewSlug}
                  onChange={(e) => setCatNewSlug(e.target.value)}
                  placeholder="نامک (slug)"
                  dir="ltr"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-left text-xs text-white outline-none focus:border-[#39f77b]/50"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-[#39f77b] py-2.5 text-xs font-extrabold text-[#031008] transition hover:brightness-110"
            >
              ایجاد و ذخیره
            </button>

            {catError && (
              <p className="text-center text-[11px] font-bold text-red-400">{catError}</p>
            )}
          </form>

          <div className="space-y-3">
            <p className="text-xs font-extrabold text-white/70">لیست دسته‌بندی‌های موجود</p>
            {catLoading ? (
              <p className="text-center text-xs text-white/40">در حال دریافت...</p>
            ) : (
              <ul className="space-y-2">
                {parentCategories.map((parent) => {
                  const children = catList.filter((c) => String(c.parentId) === String(parent.id));
                  return (
                    <div key={parent.id} className="space-y-2">
                      <li className="flex items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
                        {catEditingId === parent.id ? (
                          <>
                            <input
                              value={catEditName}
                              onChange={(e) => setCatEditName(e.target.value)}
                              autoFocus
                              className="flex-1 rounded-lg border border-[#39f77b]/40 bg-white/[0.03] px-3 py-1.5 text-xs text-white outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveCategoryEdit(parent)}
                              className="rounded-lg bg-[#39f77b] px-3 py-1.5 text-[10px] font-extrabold text-[#031008]"
                            >
                              ذخیره
                            </button>
                            <button
                              type="button"
                              onClick={() => setCatEditingId(null)}
                              className="rounded-lg border border-white/10 px-3 py-1.5 text-[10px] font-bold text-white/60"
                            >
                              انصراف
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs font-bold text-white">{parent.name}</span>
                              <span className="mt-1 block text-[10px] text-white/35">والد • پایه</span>
                            </span>
                            {catConfirmId === parent.id ? (
                              <span className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCategory(parent)}
                                  className="rounded-lg bg-red-500 px-2.5 py-1 text-[10px] font-extrabold text-white"
                                >
                                  حذف قطعی
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCatConfirmId(null)}
                                  className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60"
                                >
                                  خیر
                                </button>
                              </span>
                            ) : (
                              <span className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCatEditingId(parent.id);
                                    setCatEditName(parent.name);
                                  }}
                                  className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60 hover:text-[#00c8ff]"
                                >
                                  ویرایش
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCatConfirmId(parent.id)}
                                  className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60 hover:text-red-300"
                                >
                                  حذف
                                </button>
                              </span>
                            )}
                          </>
                        )}
                      </li>

                      {children.map((child) => (
                        <li key={child.id} className="ms-6 flex items-center gap-2 rounded-2xl border border-r-2 border-r-[#00c8ff]/30 border-white/5 bg-white/[0.02] px-3 py-2.5">
                          {catEditingId === child.id ? (
                            <span className="min-w-0 flex-1 space-y-1.5">
                              <input
                                value={catEditName}
                                onChange={(e) => setCatEditName(e.target.value)}
                                autoFocus
                                className="w-full rounded-lg border border-[#39f77b]/40 bg-white/[0.03] px-3 py-1.5 text-xs text-white outline-none"
                              />
                              <input
                                value={catEditSlug}
                                onChange={(e) => setCatEditSlug(e.target.value)}
                                placeholder="نامک (slug)"
                                dir="ltr"
                                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-left text-[11px] text-white outline-none"
                              />
                              <span className="flex gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleSaveCategoryEdit(child)}
                                  className="rounded-lg bg-[#39f77b] px-3 py-1 text-[10px] font-extrabold text-[#031008]"
                                >
                                  ذخیره
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCatEditingId(null)}
                                  className="rounded-lg border border-white/10 px-3 py-1 text-[10px] font-bold text-white/60"
                                >
                                  انصراف
                                </button>
                              </span>
                            </span>
                          ) : (
                            <>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-xs font-bold text-white">
                                  <span className="text-[#00c8ff]">↳ </span>{child.name}
                                </span>
                                <span className="mt-1 flex items-center gap-1.5 text-[10px] text-white/35">
                                  <span className={`rounded px-1.5 py-0.5 font-bold ${child.lang === "fa" ? "bg-[#39f77b]/10 text-[#39f77b]" : "bg-[#00c8ff]/10 text-[#00c8ff]"}`}>
                                    {SUPPORTED_LANGUAGES.find((l) => l.code === child.lang)?.name || child.lang}
                                  </span>
                                  <span dir="ltr" className="rounded bg-white/5 px-1.5 py-0.5 font-mono">/{child.slug}</span>
                                </span>
                              </span>
                              {catConfirmId === child.id ? (
                                <span className="flex gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCategory(child)}
                                    className="rounded-lg bg-red-500 px-2.5 py-1 text-[10px] font-extrabold text-white"
                                  >
                                    حذف قطعی
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCatConfirmId(null)}
                                    className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60"
                                  >
                                    خیر
                                  </button>
                                </span>
                              ) : (
                                <span className="flex gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCatEditingId(child.id);
                                      setCatEditName(child.name);
                                      setCatEditSlug(child.slug || "");
                                    }}
                                    className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60 hover:text-[#00c8ff]"
                                  >
                                    ویرایش
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCatConfirmId(child.id)}
                                    className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60 hover:text-red-300"
                                  >
                                    حذف
                                  </button>
                                </span>
                              )}
                            </>
                          )}
                        </li>
                      ))}
                    </div>
                  );
                })}
                {parentCategories.length === 0 && (
                  <p className="py-6 text-center text-xs text-white/40">هیچ دسته‌بندی والدی ثبت نشده است.</p>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}