"use client";

/**
 * فایل اصلی صفحه مدیریت مقالات (Controller)
 * وظیفه: 
 * ۱. مدیریت Stateهای کلان (جستجو، فیلترهای وضعیت و دسته‌بندی‌ها).
 * ۲. ارتباط با API برای دریافت لیست مقالات، ذخیره و حذف مقاله.
 * ۳. هماهنگ‌سازی (Orchestration) بین کامپوننت‌های UI (جدول، مدال‌ها).
 * مزیت: به لطف معماری کامپوننت‌محور، این فایل بسیار سبک و خواناست.
 */

import { useEffect, useMemo, useState, useRef } from "react";
import {
  getAllArticles,
  createArticle,
  updateArticleData,
  updateArticleStatus,
  deleteArticle,
  syncArticleBlocks,
  getArticleBlocks,
  searchArticlesApi,
} from "@/api/articles";
import { 
  getBaseCategories, 
  getAllCategoryTranslations 
} from "@/api/categories";
import { toFa } from "@/lib/fa";

import ArticleTable, { RealArticle } from "@/components/admin/articles/ArticleTable";
import ArticleFormModal, { ArticleForm } from "@/components/admin/articles/ArticleFormModal";
import CategoryManagerModal from "@/components/admin/articles/CategoryManagerModal";

const statusFilters = ["all", "published", "draft", "archived"] as const;

export default function ArticlesPage() {
  const [list, setList] = useState<RealArticle[]>([]);
  const [baseCats, setBaseCats] = useState<any[]>([]);
  const [transCats, setTransCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof statusFilters)[number]>("all");
  const [catFilter, setCatFilter] = useState<string>("all");

  const [modal, setModal] = useState<null | { editing: RealArticle | null }>(null);
  const [form, setForm] = useState<ArticleForm | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const [catOpen, setCatOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const isFirstRender = useRef(true); 

  const fetchData = async () => {
    try {
      setLoading(true);
      const [artRes, baseRes, transRes] = await Promise.all([
        q.trim() ? searchArticlesApi(q.trim()) : getAllArticles(),
        getBaseCategories(),
        getAllCategoryTranslations(),
      ]);
      setList(artRes.data || artRes.articles || []);
      setBaseCats(baseRes.categories || []);
      setTransCats(transRes.translations || transRes.data || []);
    } catch (error) {
      console.error("خطا دریافت اطلاعات:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticlesOnly = async (searchQuery: string) => {
    setLoading(true);
    try {
      const res = searchQuery.trim()
        ? await searchArticlesApi(searchQuery.trim())
        : await getAllArticles();
      setList(res.data || res.articles || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const delay = setTimeout(() => {
      fetchArticlesOnly(q);
    }, 500);
    return () => clearTimeout(delay);
  }, [q]);

  const filtered = useMemo(() => {
    return list.filter((a) => {
      if (filter !== "all" && a.status !== filter) return false;
      if (catFilter !== "all" && String(a.category_translation_id) !== catFilter) return false;
      return true;
    });
  }, [list, filter, catFilter]);

  const catCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of list) {
      const cId = String(a.category_translation_id);
      m.set(cId, (m.get(cId) ?? 0) + 1);
    }
    return m;
  }, [list]);

  const getSubs = (parentId: string, lang: string) => {
    return transCats.filter((t) => String(t.category_id) === String(parentId) && t.language === lang);
  };

  const openCreate = async () => {
    try {
      const [baseRes, transRes] = await Promise.all([
        getBaseCategories(),
        getAllCategoryTranslations(),
      ]);
      const fetchedBases = baseRes.categories || [];
      const fetchedTrans = transRes.translations || transRes.data || [];
      
      setBaseCats(fetchedBases);
      setTransCats(fetchedTrans);

      const firstParent = fetchedBases[0]?.id ? String(fetchedBases[0].id) : "";
      const subs = fetchedTrans.filter((t: any) => String(t.category_id) === firstParent && t.language === "fa");
      const firstSub = subs[0]?.id ? String(subs[0].id) : "";

      setFormError(null);
      setForm({
        title: "", slug: `article-${Date.now().toString(36)}`, lang: "fa", parentId: firstParent, subId: firstSub,
        imageFile: null, imageUrl: "", excerpt: "", status: "published", readingTime: "1",
        blocks: [{ id: Date.now().toString(), type: "paragraph", text_content: "" }],
      });
      setModal({ editing: null });
    } catch (e) {
      console.error(e);
    }
  };

  const openEdit = async (a: RealArticle) => {
    try {
      setLoading(true);
      const [blocksRes, baseRes, transRes] = await Promise.all([
        getArticleBlocks(a.id), getBaseCategories(), getAllCategoryTranslations(),
      ]);

      const fetchedBases = baseRes.categories || [];
      const fetchedTrans = transRes.translations || transRes.data || [];
      setBaseCats(fetchedBases);
      setTransCats(fetchedTrans);

      const serverBlocks = (blocksRes.data || []).map((b: any) => ({
        id: String(b.id), type: b.type, text_content: b.text_content || "",
        url: b.media_url || "", alt: b.alt_text || "", caption: b.caption || "",
      }));

      const trans = fetchedTrans.find((t: any) => String(t.id) === String(a.category_translation_id));
      const parentId = trans ? String(trans.category_id) : (fetchedBases[0]?.id ? String(fetchedBases[0].id) : "");

      setFormError(null);
      setForm({
        title: a.title, slug: a.slug, lang: (a.language as "fa" | "en") || "fa", parentId: parentId, subId: String(a.category_translation_id || ""),
        imageFile: null, imageUrl: a.image || "", excerpt: a.excerpt || "", status: a.status || "published", readingTime: a.reading_time_minutes || "1",
        blocks: serverBlocks.length > 0 ? serverBlocks : [{ id: Date.now().toString(), type: "paragraph", text_content: "" }],
      });
      setModal({ editing: a });
    } catch (error) {
      alert("خطا دریافت بلاک‌های مقاله");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !form.title.trim()) return;
    if (!form.subId) return setFormError("انتخاب دسته‌بندی الزامی است.");

    try {
      setIsBusy(true);
      setFormError(null);
      let articleIdToSave = modal?.editing?.id;

      if (!modal?.editing) {
        if (!form.imageFile) {
          setIsBusy(false);
          return setFormError("انتخاب تصویر کاور الزامی است.");
        }
        const fd = new FormData();
        fd.append("category_translation_id", form.subId);
        fd.append("language", form.lang);
        fd.append("title", form.title);
        fd.append("slug", form.slug || `article-${Date.now()}`);
        fd.append("excerpt", form.excerpt);
        fd.append("reading_time_minutes", String(form.readingTime || 1));
        fd.append("caption", "کاور مقاله");
        fd.append("alt_text", form.title);
        fd.append("cover", form.imageFile);
        
        const res = await createArticle(fd);
        articleIdToSave = res.articleId;
      } else {
        await updateArticleData(articleIdToSave!, {
          category_translation_id: form.subId, language: form.lang, title: form.title,
          slug: form.slug, excerpt: form.excerpt, reading_time_minutes: form.readingTime || 1,
        });
        if (form.status !== modal.editing.status) {
          await updateArticleStatus(articleIdToSave!, form.status);
        }
      }

      const blocksFd = new FormData();
      const blocksDataForServer = form.blocks.map((b, index) => ({
        type: b.type, text_content: b.text_content, caption: b.caption, alt_text: b.alt, sort_order: index,
      }));
      blocksFd.append("blocks", JSON.stringify(blocksDataForServer));
      form.blocks.forEach((b, index) => {
        if (b.type === "image" && b.file) blocksFd.append(`block_file_${index}`, b.file);
      });
      await syncArticleBlocks(articleIdToSave!, blocksFd);

      setModal(null);
      setForm(null);
      fetchData(); 
    } catch (error: any) {
      setFormError(error.message || "خطا در ارتباط با سرور");
    } finally {
      setIsBusy(false);
    }
  };

  const remove = async (id: number) => {
    try {
      await deleteArticle(id);
      setConfirmDelete(null);
      fetchData();
    } catch (error: any) {
      alert(error.message || "خطا در حذف مقاله");
    }
  };

  return (
    <div className="space-y-6 relative z-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        
        {/* گروه سمت راست: جستجو + تب‌های وضعیت */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 flex-1">
          
          {/* ۱. جستجو */}
          <div className="w-full lg:w-[320px] shrink-0">
            <div className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-[#071018] px-4 py-3 shadow-inner transition-all focus-within:border-[#39f77b]/50 focus-within:bg-[#0a151f]">
              <svg className="h-5 w-5 shrink-0 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="جستجوی عنوان مقاله..."
                className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/30"
              />
            </div>
          </div>

          {/* ۲. تب‌های وضعیت (حالا کنار جستجو در سمت راست قرار دارند) */}
          <div className="flex w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
            <div className="flex items-center gap-1 rounded-[16px] border border-white/5 bg-[#071018] p-1.5 shadow-inner">
              <button 
                onClick={() => setFilter("all")} 
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-black transition-all ${
                  filter === "all" ? "bg-[#39f77b]/10 text-[#39f77b] shadow-sm" : "text-white/40 hover:bg-white/5 hover:text-white"
                }`}
              >
                 <span className={`h-1.5 w-1.5 rounded-full ${filter === "all" ? "bg-[#39f77b] shadow-[0_0_8px_#39f77b]" : "hidden"}`}></span>
                 همه
              </button>
              <button 
                onClick={() => setFilter("published")} 
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-black transition-all ${
                  filter === "published" ? "bg-[#39f77b]/10 text-[#39f77b] shadow-sm" : "text-white/40 hover:bg-white/5 hover:text-white"
                }`}
              >
                 <span className={`h-1.5 w-1.5 rounded-full ${filter === "published" ? "bg-[#39f77b] shadow-[0_0_8px_#39f77b]" : "hidden"}`}></span>
                 منتشرشده
              </button>
              <button 
                onClick={() => setFilter("draft")} 
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-black transition-all ${
                  filter === "draft" ? "bg-[#00c8ff]/10 text-[#00c8ff] shadow-sm" : "text-white/40 hover:bg-white/5 hover:text-white"
                }`}
              >
                 <span className={`h-1.5 w-1.5 rounded-full ${filter === "draft" ? "bg-[#00c8ff] shadow-[0_0_8px_#00c8ff]" : "hidden"}`}></span>
                 پیش‌نویس
              </button>
              <button 
                onClick={() => setFilter("archived")} 
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-black transition-all ${
                  filter === "archived" ? "bg-white/10 text-white/80 shadow-sm" : "text-white/40 hover:bg-white/5 hover:text-white"
                }`}
              >
                 <span className={`h-1.5 w-1.5 rounded-full ${filter === "archived" ? "bg-white/50 shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "hidden"}`}></span>
                 آرشیو
              </button>
            </div>
          </div>

        </div>

        {/* ۳. دکمه‌های اکشن (سمت چپ) */}
        <div className="flex w-full lg:w-auto shrink-0 justify-end gap-3">
          <button
            type="button"
            onClick={() => setCatOpen(true)}
            className="flex-1 sm:flex-none rounded-2xl border border-white/10 bg-[#071018] px-5 py-3 text-xs font-bold text-white/70 shadow-sm transition-all hover:border-white/30 hover:text-white"
          >
            دسته‌بندی‌ها
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="flex-1 sm:flex-none rounded-2xl bg-[#39f77b] px-6 py-3 text-xs font-black text-[#031008] shadow-[0_0_15px_rgba(57,247,123,0.15)] transition-all hover:shadow-[0_0_25px_rgba(57,247,123,0.3)] hover:brightness-110"
          >
            + مقاله جدید
          </button>
        </div>
      </div>

      {/* فیلتر دسته‌بندی‌ها */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCatFilter("all")}
          className={`rounded-xl border px-4 py-2.5 text-[11px] font-black transition-all duration-300 ${
            catFilter === "all"
              ? "border-[#39f77b]/30 bg-[#39f77b]/10 text-[#39f77b] shadow-[0_0_10px_rgba(57,247,123,0.1)]"
              : "border-white/5 bg-[#071018] text-white/50 hover:bg-white/5 hover:text-white"
          }`}
        >
          همه دسته‌ها <span className="mx-1 font-mono opacity-50">({toFa(list.length)})</span>
        </button>
        {transCats.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setCatFilter(String(t.id))}
            className={`rounded-xl border px-4 py-2.5 text-[11px] font-black transition-all duration-300 ${
              catFilter === String(t.id)
                ? "border-[#00c8ff]/30 bg-[#00c8ff]/10 text-[#00c8ff] shadow-[0_0_10px_rgba(0,200,255,0.1)]"
                : "border-white/5 bg-[#071018] text-white/50 hover:bg-white/5 hover:text-white"
            }`}
          >
            {t.name} <span className="mx-1 font-mono opacity-50">({toFa(catCounts.get(String(t.id)) ?? 0)})</span>
          </button>
        ))}
      </div>

      <ArticleTable
        loading={loading}
        articles={filtered}
        transCats={transCats}
        onEdit={openEdit}
        onDeleteRequest={setConfirmDelete}
      />

      <CategoryManagerModal isOpen={catOpen} onClose={() => setCatOpen(false)} onCategoriesUpdated={fetchData} />
      <ArticleFormModal isOpen={!!modal && !!form} isEditing={!!modal?.editing} form={form} setForm={setForm} formError={formError} isBusy={isBusy} onSubmit={submit} onClose={() => { setModal(null); setForm(null); }} baseCats={baseCats} getSubs={getSubs} />

      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="ev-card w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl">
            <p className="text-sm font-bold text-white">این مقاله حذف شود؟</p>
            <div className="mt-6 flex gap-2">
              <button type="button" onClick={() => remove(confirmDelete)} className="flex-1 rounded-xl bg-red-500/20 text-red-400 py-2.5 text-sm font-extrabold transition hover:bg-red-500 hover:text-white">حذف قطعی</button>
              <button type="button" onClick={() => setConfirmDelete(null)} className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-bold text-white/60 hover:text-white">انصراف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




// "use client";

// import { useEffect, useMemo, useState, useRef } from "react"; // 👈 useRef اضافه شد
// import {
//   getAllArticles,
//   createArticle,
//   updateArticleData,
//   updateArticleStatus,
//   deleteArticle,
//   syncArticleBlocks,
//   getArticleBlocks,
//   searchArticlesApi, // 👈 متد سرچ جدید اضافه شد
// } from "@/api/articles";
// import { 
//   getBaseCategories, 
//   getAllCategoryTranslations,
//   createBaseCategory,
//   updateBaseCategory,
//   deleteBaseCategory,
//   createCategoryTranslation,
//   updateCategoryTranslation,
//   deleteCategoryTranslation
// } from "@/api/categories";
// import { slugify, estimateReadingTime, ArticleBlock } from "@/lib/articleBlocks"; 
// import BlockEditor from "@/components/admin/BlockEditor";
// import { toFa } from "@/lib/fa";

// const FALLBACK_COVER = "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=85";

// const statusFilters = ["all", "published", "draft", "archived"] as const;
// const statusMeta: Record<string, { label: string; chip: string }> = {
//   published: { label: "منتشر شده", chip: "bg-[#39f77b]/10 text-[#39f77b]" },
//   draft: { label: "پیش‌نویس", chip: "bg-[#00c8ff]/10 text-[#00c8ff]" },
//   archived: { label: "آرشیو", chip: "bg-white/10 text-white/50" },
// };

// const SUPPORTED_LANGUAGES = [
//   { code: "fa", name: "فارسی" },
//   { code: "en", name: "انگلیسی" },
// ];

// export interface RealArticle {
//   id: number;
//   title: string;
//   slug: string;
//   language: string;
//   excerpt: string;
//   reading_time_minutes: number;
//   status: string;
//   views?: number;
//   image?: string; 
//   category_name?: string;
//   category_translation_id?: number;
//   created_at: string;
// }

// interface ArticleForm {
//   title: string;
//   slug: string;
//   lang: "fa" | "en";
//   parentId: string; 
//   subId: string; 
//   imageFile?: File | null;
//   imageUrl: string;
//   excerpt: string;
//   status: string;
//   readingTime: string | number;
//   blocks: ArticleBlock[];
// }

// export interface CategoryItem {
//   id: number | string;
//   name: string;
//   lang: string | null;
//   parentId: number | string | null;
//   slug: string;
// }

// export default function ArticlesPage() {
//   const [list, setList] = useState<RealArticle[]>([]);
//   const [baseCats, setBaseCats] = useState<any[]>([]);
//   const [transCats, setTransCats] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [q, setQ] = useState("");
//   const [filter, setFilter] = useState<(typeof statusFilters)[number]>("all");
//   const [catFilter, setCatFilter] = useState<string>("all");

//   const [modal, setModal] = useState<null | { editing: RealArticle | null }>(null);
//   const [form, setForm] = useState<ArticleForm | null>(null);
//   const [formError, setFormError] = useState<string | null>(null);
//   const [isBusy, setIsBusy] = useState(false);

//   const [catOpen, setCatOpen] = useState(false);
//   const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

//   const [catList, setCatList] = useState<CategoryItem[]>([]);
//   const [catLoading, setCatLoading] = useState(false);
//   const [catNameInput, setCatNameInput] = useState("");
//   const [catKind, setCatKind] = useState<"parent" | "sub">("sub");
//   const [catNewLang, setCatNewLang] = useState<string>("fa");
//   const [catNewParent, setCatNewParent] = useState<string>("");
//   const [catNewSlug, setCatNewSlug] = useState("");
//   const [catError, setCatError] = useState<string | null>(null);
//   const [catConfirmId, setCatConfirmId] = useState<string | number | null>(null);
//   const [catEditingId, setCatEditingId] = useState<string | number | null>(null);
//   const [catEditName, setCatEditName] = useState("");
//   const [catEditSlug, setCatEditSlug] = useState("");

//   const isFirstRender = useRef(true); // 👈 کنترل رندر اول برای سرچ

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const [artRes, baseRes, transRes] = await Promise.all([
//         q.trim() ? searchArticlesApi(q.trim()) : getAllArticles(),
//         getBaseCategories(),
//         getAllCategoryTranslations(),
//       ]);
//       setList(artRes.data || artRes.articles || []);
//       setBaseCats(baseRes.categories || []);
//       setTransCats(transRes.translations || transRes.data || []);
//     } catch (error) {
//       console.error("خطا در دریافت اطلاعات:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 👈 تابع مستقل فقط برای لود کردن مقالات سرچ‌شده (جلوگیری از لود مجدد دسته‌بندی‌ها)
//   const fetchArticlesOnly = async (searchQuery: string) => {
//     setLoading(true);
//     try {
//       const res = searchQuery.trim()
//         ? await searchArticlesApi(searchQuery.trim())
//         : await getAllArticles();
//       setList(res.data || res.articles || []);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCategoriesFull = async () => {
//     try {
//       setCatLoading(true);
//       const [baseRes, transRes] = await Promise.all([
//         getBaseCategories(),
//         getAllCategoryTranslations(),
//       ]);

//       const baseArr: CategoryItem[] = (baseRes.categories || []).map((b: any) => ({
//         id: b.id,
//         name: b.name,
//         lang: null,
//         parentId: null,
//         slug: "",
//       }));

//       const transArr: CategoryItem[] = (transRes.translations || transRes.data || []).map((t: any) => ({
//         id: t.id,
//         name: t.name,
//         lang: t.language,
//         parentId: t.category_id,
//         slug: t.slug,
//       }));

//       const combined = [...baseArr, ...transArr];
//       setCatList(combined);
//       setBaseCats(baseRes.categories || []);
//       setTransCats(transRes.translations || transRes.data || []);

//       if (baseArr.length > 0 && !catNewParent) {
//         setCatNewParent(String(baseArr[0].id));
//       }
//     } catch (err) {
//       console.error("خطا در دریافت دسته‌بندی‌ها:", err);
//     } finally {
//       setCatLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // 👈 افکت اختصاصی برای باکس جستجوی محلی با قابلیت ارسال ریکوئست به بک‌اند
//   useEffect(() => {
//     if (isFirstRender.current) {
//       isFirstRender.current = false;
//       return;
//     }
//     const delay = setTimeout(() => {
//       fetchArticlesOnly(q);
//     }, 500);
//     return () => clearTimeout(delay);
//   }, [q]);

//   useEffect(() => {
//     if (catOpen) {
//       fetchCategoriesFull();
//     }
//   }, [catOpen]);

//   // 👈 q از فیلترهای لوکال حذف شد چون نتیجه‌ی لیست از بک‌اند گرفته می‌شود
//   const filtered = useMemo(() => {
//     return list.filter((a) => {
//       if (filter !== "all" && a.status !== filter) return false;
//       if (catFilter !== "all" && String(a.category_translation_id) !== catFilter) return false;
//       return true;
//     });
//   }, [list, filter, catFilter]);

//   const catCounts = useMemo(() => {
//     const m = new Map<string, number>();
//     for (const a of list) {
//       const cId = String(a.category_translation_id);
//       m.set(cId, (m.get(cId) ?? 0) + 1);
//     }
//     return m;
//   }, [list]);

//   const getSubs = (parentId: string, lang: string) => {
//     return transCats.filter((t) => String(t.category_id) === String(parentId) && t.language === lang);
//   };

//   const openCreate = async () => {
//     try {
//       const [baseRes, transRes] = await Promise.all([
//         getBaseCategories(),
//         getAllCategoryTranslations(),
//       ]);
//       const fetchedBases = baseRes.categories || [];
//       const fetchedTrans = transRes.translations || transRes.data || [];
      
//       setBaseCats(fetchedBases);
//       setTransCats(fetchedTrans);

//       const firstParent = fetchedBases[0]?.id ? String(fetchedBases[0].id) : "";
//       const subs = fetchedTrans.filter((t: any) => String(t.category_id) === firstParent && t.language === "fa");
//       const firstSub = subs[0]?.id ? String(subs[0].id) : "";

//       setFormError(null);
//       setForm({
//         title: "",
//         slug: `article-${Date.now().toString(36)}`,
//         lang: "fa",
//         parentId: firstParent,
//         subId: firstSub,
//         imageFile: null,
//         imageUrl: "",
//         excerpt: "",
//         status: "published",
//         readingTime: "1",
//         blocks: [{ id: Date.now().toString(), type: "paragraph", text_content: "" }],
//       });
//       setModal({ editing: null });
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const openEdit = async (a: RealArticle) => {
//     try {
//       setIsBusy(true);
//       const [blocksRes, baseRes, transRes] = await Promise.all([
//         getArticleBlocks(a.id),
//         getBaseCategories(),
//         getAllCategoryTranslations(),
//       ]);

//       const fetchedBases = baseRes.categories || [];
//       const fetchedTrans = transRes.translations || transRes.data || [];
//       setBaseCats(fetchedBases);
//       setTransCats(fetchedTrans);

//       const serverBlocks = (blocksRes.data || []).map((b: any) => ({
//         id: String(b.id),
//         type: b.type,
//         text_content: b.text_content || "",
//         url: b.media_url || "",
//         alt: b.alt_text || "",
//         caption: b.caption || "",
//       }));

//       const trans = fetchedTrans.find((t: any) => String(t.id) === String(a.category_translation_id));
//       const parentId = trans ? String(trans.category_id) : (fetchedBases[0]?.id ? String(fetchedBases[0].id) : "");

//       setFormError(null);
//       setForm({
//         title: a.title,
//         slug: a.slug,
//         lang: (a.language as "fa" | "en") || "fa",
//         parentId: parentId,
//         subId: String(a.category_translation_id || ""),
//         imageFile: null,
//         imageUrl: a.image || FALLBACK_COVER,
//         excerpt: a.excerpt || "",
//         status: a.status || "published",
//         readingTime: a.reading_time_minutes || "1",
//         blocks: serverBlocks.length > 0 ? serverBlocks : [{ id: Date.now().toString(), type: "paragraph", text_content: "" }],
//       });
//       setModal({ editing: a });
//     } catch (error) {
//       alert("خطا در دریافت بلوک‌های مقاله");
//     } finally {
//       setIsBusy(false);
//     }
//   };

//   const submit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!form || !form.title.trim()) return;

//     if (!form.subId) {
//       setFormError("انتخاب دسته‌بندی الزامی است. لطفاً برای این زبان دسته‌بندی ایجاد کنید.");
//       return;
//     }

//     try {
//       setIsBusy(true);
//       setFormError(null);
//       let articleIdToSave = modal?.editing?.id;

//       if (!modal?.editing) {
//         if (!form.imageFile) {
//           setIsBusy(false);
//           return setFormError("انتخاب تصویر کاور الزامی است.");
//         }
        
//         const fd = new FormData();
//         fd.append("category_translation_id", form.subId);
//         fd.append("language", form.lang);
//         fd.append("title", form.title);
//         fd.append("slug", form.slug || `article-${Date.now()}`);
//         fd.append("excerpt", form.excerpt);
//         fd.append("reading_time_minutes", String(form.readingTime || 1));
//         fd.append("caption", "کاور مقاله");
//         fd.append("alt_text", form.title);
//         fd.append("cover", form.imageFile);
        
//         const res = await createArticle(fd);
//         articleIdToSave = res.articleId;
//       } else {
//         await updateArticleData(articleIdToSave!, {
//           category_translation_id: form.subId,
//           language: form.lang,
//           title: form.title,
//           slug: form.slug,
//           excerpt: form.excerpt,
//           reading_time_minutes: form.readingTime || 1,
//         });

//         if (form.status !== modal.editing.status) {
//           await updateArticleStatus(articleIdToSave!, form.status);
//         }
//       }

//       const blocksFd = new FormData();
//       const blocksDataForServer = form.blocks.map((b, index) => ({
//         type: b.type,
//         text_content: b.text_content,
//         caption: b.caption,
//         alt_text: b.alt,
//         sort_order: index,
//       }));
//       blocksFd.append("blocks", JSON.stringify(blocksDataForServer));

//       form.blocks.forEach((b, index) => {
//         if (b.type === "image" && b.file) {
//           blocksFd.append(`block_file_${index}`, b.file);
//         }
//       });

//       await syncArticleBlocks(articleIdToSave!, blocksFd);

//       setModal(null);
//       setForm(null);
//       fetchData(); 
//     } catch (error: any) {
//       setFormError(error.message || "خطا در ارتباط با سرور");
//     } finally {
//       setIsBusy(false);
//     }
//   };

//   const remove = async (id: number) => {
//     try {
//       await deleteArticle(id);
//       setConfirmDelete(null);
//       fetchData();
//     } catch (error: any) {
//       alert(error.message || "خطا در حذف مقاله");
//     }
//   };

//   const handleCreateCategory = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!catNameInput.trim()) {
//       setCatError("لطفاً نام دسته‌بندی را وارد کنید.");
//       return;
//     }

//     try {
//       setCatError(null);
//       if (catKind === "parent") {
//         await createBaseCategory(catNameInput.trim());
//       } else {
//         if (!catNewParent) {
//           setCatError("لطفاً یک والد انتخاب کنید.");
//           return;
//         }
//         await createCategoryTranslation({
//           category_id: catNewParent,
//           language: catNewLang,
//           name: catNameInput.trim(),
//           slug: catNewSlug.trim() || slugify(catNameInput.trim()),
//         });
//       }
//       setCatNameInput("");
//       setCatNewSlug("");
//       fetchCategoriesFull();
//       fetchData();
//     } catch (err: any) {
//       setCatError(err.message || "خطا در ایجاد دسته‌بندی");
//     }
//   };

//   const handleSaveCategoryEdit = async (cat: CategoryItem) => {
//     if (!catEditName.trim()) {
//       setCatError("نام دسته‌بندی نمی‌تواند خالی باشد.");
//       return;
//     }

//     try {
//       setCatError(null);
//       if (cat.parentId === null) {
//         await updateBaseCategory(cat.id, catEditName.trim());
//       } else {
//         await updateCategoryTranslation(cat.id, {
//           name: catEditName.trim(),
//           slug: catEditSlug.trim() || slugify(catEditName.trim()),
//         });
//       }
//       setCatEditingId(null);
//       setCatEditName("");
//       setCatEditSlug("");
//       fetchCategoriesFull();
//       fetchData();
//     } catch (err: any) {
//       setCatError(err.message || "خطا در ویرایش دسته‌بندی");
//     }
//   };

//   const handleRemoveCategory = async (cat: CategoryItem) => {
//     try {
//       setCatError(null);
//       if (cat.parentId === null) {
//         await deleteBaseCategory(cat.id);
//       } else {
//         await deleteCategoryTranslation(cat.id);
//       }
//       setCatConfirmId(null);
//       fetchCategoriesFull();
//       fetchData();
//     } catch (err: any) {
//       setCatError(err.message || "خطا در حذف دسته‌بندی");
//     }
//   };

//   const formDir = form && form.lang === "en" ? "ltr" : "rtl";
//   const parentCategories = catList.filter((c) => c.parentId === null);

//   return (
//     <div className="space-y-4">
//       <div className="ev-card flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center">
//         <input
//           value={q}
//           onChange={(e) => setQ(e.target.value)}
//           placeholder="جستجوی عنوان مقاله..."
//           className="w-full flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#39f77b]/50 sm:max-w-xs"
//         />
//         <div className="flex flex-wrap items-center gap-2">
//           {statusFilters.map((v) => (
//             <button
//               key={v}
//               type="button"
//               onClick={() => setFilter(v)}
//               className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
//                 filter === v ? "bg-[#39f77b]/15 text-[#39f77b]" : "bg-white/[0.03] text-white/50 hover:text-white"
//               }`}
//             >
//               {v === "all" ? "همه" : statusMeta[v]?.label}
//             </button>
//           ))}
//         </div>
//         <span className="flex gap-2 sm:ms-auto">
//           <button
//             type="button"
//             onClick={() => setCatOpen(true)}
//             className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-white/70 transition hover:border-[#00c8ff]/40 hover:text-[#00c8ff]"
//           >
//             دسته‌بندی‌ها
//           </button>
//           <button
//             type="button"
//             onClick={openCreate}
//             className="rounded-xl bg-[#39f77b] px-5 py-2.5 text-xs font-extrabold text-[#031008] transition hover:brightness-110"
//           >
//             + مقاله جدید
//           </button>
//         </span>
//       </div>

//       <div className="ev-card flex flex-wrap items-center gap-2 rounded-2xl p-3">
//         <button
//           type="button"
//           onClick={() => setCatFilter("all")}
//           className={`rounded-xl px-3.5 py-2 text-[11px] font-bold transition ${
//             catFilter === "all" ? "bg-[#39f77b]/15 text-[#39f77b]" : "bg-white/[0.03] text-white/50 hover:text-white"
//           }`}
//         >
//           همه دسته‌ها ({toFa(list.length)})
//         </button>
//         {transCats.map((t) => (
//           <button
//             key={t.id}
//             type="button"
//             onClick={() => setCatFilter(String(t.id))}
//             className={`rounded-xl px-3.5 py-2 text-[11px] font-bold transition ${
//               catFilter === String(t.id) ? "bg-[#00c8ff]/15 text-[#00c8ff]" : "bg-white/[0.03] text-white/50 hover:text-white"
//             }`}
//           >
//             {t.name} ({toFa(catCounts.get(String(t.id)) ?? 0)})
//           </button>
//         ))}
//       </div>

//       <div className="ev-card overflow-hidden rounded-2xl">
//         <div className="overflow-x-auto">
//           {loading ? (
//              <p className="p-10 text-center text-xs text-white/40">در حال دریافت مقالات...</p>
//           ) : (
//           <table className="w-full min-w-[760px] text-right text-xs">
//             <thead>
//               <tr className="border-b border-white/5 text-white/40">
//                 <th className="px-5 py-3 font-bold">مقاله</th>
//                 <th className="px-5 py-3 font-bold">زبان</th>
//                 <th className="px-5 py-3 font-bold">دسته‌بندی</th>
//                 <th className="px-5 py-3 font-bold">بازدید</th>
//                 <th className="px-5 py-3 font-bold">وضعیت</th>
//                 <th className="px-5 py-3 font-bold">اقدام</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map((a) => {
//                 const st = statusMeta[a.status] ?? statusMeta.draft;
//                 const catName = transCats.find((t) => String(t.id) === String(a.category_translation_id))?.name || "نامشخص";
                
//                 return (
//                   <tr key={a.id} className="border-b border-white/5 last:border-0">
//                     <td className="px-5 py-3">
//                       <span className="flex items-center gap-3">
//                         <img src={a.image || FALLBACK_COVER} alt="" className="h-11 w-16 shrink-0 rounded-lg object-cover" />
//                         <span className="min-w-0">
//                           <span className="block max-w-64 truncate font-bold text-white">{a.title}</span>
//                           <span className="mt-1 block text-[10px] text-white/35" dir="ltr">/{a.slug}</span>
//                         </span>
//                       </span>
//                     </td>
//                     <td className="px-5 py-3">
//                       <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${a.language === "fa" ? "bg-[#39f77b]/10 text-[#39f77b]" : "bg-[#00c8ff]/10 text-[#00c8ff]"}`}>
//                         {a.language === "fa" ? "FA" : "EN"}
//                       </span>
//                     </td>
//                     <td className="px-5 py-3 text-white/60">{catName}</td>
//                     <td className="px-5 py-3 text-white/60">{toFa(a.views || 0)}</td>
//                     <td className="px-5 py-3">
//                       <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${st.chip}`}>
//                         {st.label}
//                       </span>
//                     </td>
//                     <td className="px-5 py-3">
//                       <span className="flex items-center gap-2">
//                         <button
//                           type="button"
//                           onClick={() => openEdit(a)}
//                           className="rounded-lg border border-white/10 px-3 py-1.5 font-bold text-white/70 transition hover:border-[#00c8ff]/40 hover:text-[#00c8ff]"
//                         >
//                           ویرایش
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => setConfirmDelete(a.id)}
//                           className="rounded-lg border border-white/10 px-3 py-1.5 font-bold text-white/70 transition hover:border-red-400/40 hover:text-red-300"
//                         >
//                           حذف
//                         </button>
//                       </span>
//                     </td>
//                   </tr>
//                 );
//               })}
//               {filtered.length === 0 && (
//                 <tr>
//                   <td colSpan={6} className="px-5 py-10 text-center text-white/40">
//                     مقاله‌ای یافت نشد.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//           )}
//         </div>
//       </div>

//       {catOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
//           <div className="ev-card flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl">
//             <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
//               <div className="flex items-center gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setCatOpen(false)}
//                   className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-bold text-white/70 transition hover:border-[#39f77b]/40 hover:text-[#39f77b]"
//                 >
//                   بازگشت →
//                 </button>
//                 <h2 className="text-base font-extrabold text-white">مدیریت دسته‌بندی‌ها</h2>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setCatOpen(false)}
//                 className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-white/50 hover:text-white"
//               >
//                 ✕
//               </button>
//             </div>

//             <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
//               <form onSubmit={handleCreateCategory} className="space-y-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
//                 <p className="text-xs font-extrabold text-[#39f77b]">افزودن دسته‌بندی جدید</p>
//                 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//                   <select
//                     value={catKind}
//                     onChange={(e) => setCatKind(e.target.value as "parent" | "sub")}
//                     className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2.5 text-xs text-white outline-none"
//                   >
//                     <option value="sub">زیرمجموعه (ترجمه)</option>
//                     <option value="parent">والد جدید (پایه)</option>
//                   </select>
//                   <input
//                     value={catNameInput}
//                     onChange={(e) => {
//                       setCatNameInput(e.target.value);
//                       setCatError(null);
//                     }}
//                     placeholder={catKind === "parent" ? "نام والد (مثلاً مقالات فنی)" : "نام زیرمجموعه (مثلاً ماشین برقی)"}
//                     className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-white outline-none focus:border-[#39f77b]/50"
//                   />
//                 </div>

//                 {catKind === "sub" && (
//                   <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
//                     <select
//                       value={catNewParent}
//                       onChange={(e) => setCatNewParent(e.target.value)}
//                       className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2.5 text-xs text-white outline-none"
//                     >
//                       {parentCategories.map((p) => (
//                         <option key={p.id} value={p.id}>والد: {p.name}</option>
//                       ))}
//                       {parentCategories.length === 0 && <option value="">والدی موجود نیست</option>}
//                     </select>
//                     <select
//                       value={catNewLang}
//                       onChange={(e) => setCatNewLang(e.target.value)}
//                       className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2.5 text-xs text-white outline-none"
//                     >
//                       {SUPPORTED_LANGUAGES.map((l) => (
//                         <option key={l.code} value={l.code}>{l.name}</option>
//                       ))}
//                     </select>
//                     <input
//                       value={catNewSlug}
//                       onChange={(e) => setCatNewSlug(e.target.value)}
//                       placeholder="نامک (slug)"
//                       dir="ltr"
//                       className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-left text-xs text-white outline-none focus:border-[#39f77b]/50"
//                     />
//                   </div>
//                 )}

//                 <button
//                   type="submit"
//                   className="w-full rounded-xl bg-[#39f77b] py-2.5 text-xs font-extrabold text-[#031008] transition hover:brightness-110"
//                 >
//                   ایجاد و ذخیره
//                 </button>

//                 {catError && (
//                   <p className="text-center text-[11px] font-bold text-red-400">{catError}</p>
//                 )}
//               </form>

//               <div className="space-y-3">
//                 <p className="text-xs font-extrabold text-white/70">لیست دسته‌بندی‌های موجود</p>
//                 {catLoading ? (
//                   <p className="text-center text-xs text-white/40">در حال دریافت...</p>
//                 ) : (
//                   <ul className="space-y-2">
//                     {parentCategories.map((parent) => {
//                       const children = catList.filter((c) => String(c.parentId) === String(parent.id));
//                       return (
//                         <div key={parent.id} className="space-y-2">
//                           <li className="flex items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
//                             {catEditingId === parent.id ? (
//                               <>
//                                 <input
//                                   value={catEditName}
//                                   onChange={(e) => setCatEditName(e.target.value)}
//                                   autoFocus
//                                   className="flex-1 rounded-lg border border-[#39f77b]/40 bg-white/[0.03] px-3 py-1.5 text-xs text-white outline-none"
//                                 />
//                                 <button
//                                   type="button"
//                                   onClick={() => handleSaveCategoryEdit(parent)}
//                                   className="rounded-lg bg-[#39f77b] px-3 py-1.5 text-[10px] font-extrabold text-[#031008]"
//                                 >
//                                   ذخیره
//                                 </button>
//                                 <button
//                                   type="button"
//                                   onClick={() => setCatEditingId(null)}
//                                   className="rounded-lg border border-white/10 px-3 py-1.5 text-[10px] font-bold text-white/60"
//                                 >
//                                   انصراف
//                                 </button>
//                               </>
//                             ) : (
//                               <>
//                                 <span className="min-w-0 flex-1">
//                                   <span className="block truncate text-xs font-bold text-white">{parent.name}</span>
//                                   <span className="mt-1 block text-[10px] text-white/35">والد • پایه</span>
//                                 </span>
//                                 {catConfirmId === parent.id ? (
//                                   <span className="flex gap-1.5">
//                                     <button
//                                       type="button"
//                                       onClick={() => handleRemoveCategory(parent)}
//                                       className="rounded-lg bg-red-500 px-2.5 py-1 text-[10px] font-extrabold text-white"
//                                     >
//                                       حذف قطعی
//                                     </button>
//                                     <button
//                                       type="button"
//                                       onClick={() => setCatConfirmId(null)}
//                                       className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60"
//                                     >
//                                       نه
//                                     </button>
//                                   </span>
//                                 ) : (
//                                   <span className="flex gap-1.5">
//                                     <button
//                                       type="button"
//                                       onClick={() => {
//                                         setCatEditingId(parent.id);
//                                         setCatEditName(parent.name);
//                                       }}
//                                       className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60 hover:text-[#00c8ff]"
//                                     >
//                                       ویرایش
//                                     </button>
//                                     <button
//                                       type="button"
//                                       onClick={() => setCatConfirmId(parent.id)}
//                                       className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60 hover:text-red-300"
//                                     >
//                                       حذف
//                                     </button>
//                                   </span>
//                                 )}
//                               </>
//                             )}
//                           </li>

//                           {children.map((child) => (
//                             <li key={child.id} className="ms-6 flex items-center gap-2 rounded-2xl border border-r-2 border-r-[#00c8ff]/30 border-white/5 bg-white/[0.02] px-3 py-2.5">
//                               {catEditingId === child.id ? (
//                                 <span className="min-w-0 flex-1 space-y-1.5">
//                                   <input
//                                     value={catEditName}
//                                     onChange={(e) => setCatEditName(e.target.value)}
//                                     autoFocus
//                                     className="w-full rounded-lg border border-[#39f77b]/40 bg-white/[0.03] px-3 py-1.5 text-xs text-white outline-none"
//                                   />
//                                   <input
//                                     value={catEditSlug}
//                                     onChange={(e) => setCatEditSlug(e.target.value)}
//                                     placeholder="نامک (slug)"
//                                     dir="ltr"
//                                     className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-left text-[11px] text-white outline-none"
//                                   />
//                                   <span className="flex gap-2 pt-1">
//                                     <button
//                                       type="button"
//                                       onClick={() => handleSaveCategoryEdit(child)}
//                                       className="rounded-lg bg-[#39f77b] px-3 py-1 text-[10px] font-extrabold text-[#031008]"
//                                     >
//                                       ذخیره
//                                     </button>
//                                     <button
//                                       type="button"
//                                       onClick={() => setCatEditingId(null)}
//                                       className="rounded-lg border border-white/10 px-3 py-1 text-[10px] font-bold text-white/60"
//                                     >
//                                       انصراف
//                                     </button>
//                                   </span>
//                                 </span>
//                               ) : (
//                                 <>
//                                   <span className="min-w-0 flex-1">
//                                     <span className="block truncate text-xs font-bold text-white">
//                                       <span className="text-[#00c8ff]">↳ </span>{child.name}
//                                     </span>
//                                     <span className="mt-1 flex items-center gap-1.5 text-[10px] text-white/35">
//                                       <span className={`rounded px-1.5 py-0.5 font-bold ${child.lang === "fa" ? "bg-[#39f77b]/10 text-[#39f77b]" : "bg-[#00c8ff]/10 text-[#00c8ff]"}`}>
//                                         {SUPPORTED_LANGUAGES.find((l) => l.code === child.lang)?.name || child.lang}
//                                       </span>
//                                       <span dir="ltr" className="rounded bg-white/5 px-1.5 py-0.5 font-mono">/{child.slug}</span>
//                                     </span>
//                                   </span>
//                                   {catConfirmId === child.id ? (
//                                     <span className="flex gap-1.5">
//                                       <button
//                                         type="button"
//                                         onClick={() => handleRemoveCategory(child)}
//                                         className="rounded-lg bg-red-500 px-2.5 py-1 text-[10px] font-extrabold text-white"
//                                       >
//                                         حذف قطعی
//                                       </button>
//                                       <button
//                                         type="button"
//                                         onClick={() => setCatConfirmId(null)}
//                                         className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60"
//                                       >
//                                         نه
//                                       </button>
//                                     </span>
//                                   ) : (
//                                     <span className="flex gap-1.5">
//                                       <button
//                                         type="button"
//                                         onClick={() => {
//                                           setCatEditingId(child.id);
//                                           setCatEditName(child.name);
//                                           setCatEditSlug(child.slug || "");
//                                         }}
//                                         className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60 hover:text-[#00c8ff]"
//                                       >
//                                         ویرایش
//                                       </button>
//                                       <button
//                                         type="button"
//                                         onClick={() => setCatConfirmId(child.id)}
//                                         className="rounded-lg border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60 hover:text-red-300"
//                                       >
//                                         حذف
//                                       </button>
//                                     </span>
//                                   )}
//                                 </>
//                               )}
//                             </li>
//                           ))}
//                         </div>
//                       );
//                     })}
//                     {parentCategories.length === 0 && (
//                       <p className="py-6 text-center text-xs text-white/40">هیچ دسته‌بندی والدی ثبت نشده است.</p>
//                     )}
//                   </ul>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {modal && form && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
//           <form onSubmit={submit} className="ev-card flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl">
//             <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
//               <h2 className="flex items-center gap-2 text-base font-extrabold text-white">
//                 {modal.editing ? "ویرایش مقاله" : "مقاله جدید"}
//               </h2>
//               <button
//                 type="button"
//                 onClick={() => { setModal(null); setForm(null); }}
//                 className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-white/50 hover:text-white"
//               >
//                 ✕
//               </button>
//             </div>

//             <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
//               <section className="space-y-3">
//                 <p className="text-xs font-extrabold text-[#39f77b]">زبان و دسته‌بندی</p>
//                 <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
//                   <select
//                     value={form.lang}
//                     onChange={(e) => {
//                       const lang = e.target.value as "fa" | "en";
//                       const subs = getSubs(form.parentId, lang);
//                       setForm({ ...form, lang, subId: subs[0]?.id ? String(subs[0].id) : "" });
//                     }}
//                     className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2.5 text-xs text-white outline-none"
//                   >
//                     <option value="fa">فارسی</option>
//                     <option value="en">انگلیسی</option>
//                   </select>

//                   <select
//                     value={form.parentId}
//                     onChange={(e) => {
//                       const parentId = e.target.value;
//                       const subs = getSubs(parentId, form.lang);
//                       setForm({ ...form, parentId, subId: subs[0]?.id ? String(subs[0].id) : "" });
//                     }}
//                     className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2.5 text-xs text-white outline-none"
//                   >
//                     {baseCats.map((p) => (
//                       <option key={p.id} value={p.id}>والد: {p.name}</option>
//                     ))}
//                     {baseCats.length === 0 && <option value="">بدون والد</option>}
//                   </select>

//                   <select
//                     value={form.subId}
//                     onChange={(e) => setForm({ ...form, subId: e.target.value })}
//                     className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2.5 text-xs text-white outline-none"
//                   >
//                     {getSubs(form.parentId, form.lang).map((s) => (
//                       <option key={s.id} value={s.id}>{s.name}</option>
//                     ))}
//                     {getSubs(form.parentId, form.lang).length === 0 && (
//                       <option value="">— ترجمه‌ای ثبت نشده —</option>
//                     )}
//                   </select>
//                 </div>
//               </section>

//               <section className="space-y-3">
//                 <p className="text-xs font-extrabold text-[#39f77b]">مشخصات اصلی</p>
//                 <input
//                   value={form.title}
//                   onChange={(e) => setForm({ ...form, title: e.target.value })}
//                   placeholder={form.lang === "fa" ? "عنوان مقاله *" : "Article title *"}
//                   dir={formDir}
//                   className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#39f77b]/50"
//                 />
//                 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//                   <div className="flex gap-2">
//                     <input
//                       value={form.slug}
//                       onChange={(e) => setForm({ ...form, slug: e.target.value })}
//                       placeholder="نامک (slug)"
//                       dir="ltr"
//                       className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-left text-xs text-white outline-none focus:border-[#39f77b]/50"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setForm({ ...form, slug: slugify(form.title || `article-${Date.now()}`) })}
//                       className="shrink-0 rounded-xl border border-white/10 px-3 py-2.5 text-[11px] font-bold text-white/60 hover:text-white"
//                     >
//                       خودکار
//                     </button>
//                   </div>
//                   <select
//                     value={form.status}
//                     onChange={(e) => setForm({ ...form, status: e.target.value })}
//                     className="w-full rounded-xl border border-white/10 bg-[#0b1722] px-4 py-2.5 text-xs text-white outline-none"
//                   >
//                     <option value="published">منتشرشده</option>
//                     <option value="draft">پیش‌نویس (مخفی)</option>
//                     <option value="archived">آرشیو</option>
//                   </select>
//                 </div>
//               </section>

//               <section className="space-y-3">
//                 <p className="text-xs font-extrabold text-[#39f77b]">تصویر کاور</p>
//                 <input 
//                   type="file" 
//                   accept="image/*"
//                   onChange={(e) => {
//                     const file = e.target.files?.[0];
//                     if (file) setForm({ ...form, imageFile: file, imageUrl: URL.createObjectURL(file) });
//                   }}
//                   className="w-full text-xs text-white/50 file:mr-4 file:rounded-xl file:border-0 file:bg-[#39f77b]/10 file:px-4 file:py-2 file:text-xs file:font-bold file:text-[#39f77b] hover:file:bg-[#39f77b]/20"
//                 />
//                 {form.imageUrl && (
//                    // eslint-disable-next-line @next/next/no-img-element
//                    <img src={form.imageUrl} alt="cover" className="mt-2 h-40 w-full rounded-2xl object-cover border border-white/10" />
//                 )}
//               </section>

//               <section className="space-y-3">
//                 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//                   <input
//                     type="number"
//                     value={form.readingTime}
//                     onChange={(e) => setForm({ ...form, readingTime: e.target.value })}
//                     placeholder="زمان مطالعه (دقیقه)"
//                     className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-white outline-none focus:border-[#39f77b]/50"
//                   />
//                 </div>
//                 <textarea
//                   value={form.excerpt}
//                   onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
//                   placeholder="خلاصه مقاله (توضیحات کوتاه برای سئو و لیست)"
//                   rows={3}
//                   dir={formDir}
//                   className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs leading-6 text-white outline-none focus:border-[#39f77b]/50"
//                 />
//               </section>

//               <section className="space-y-3" dir={formDir}>
//                 <p className="flex items-center justify-between text-xs font-extrabold text-[#39f77b]">
//                   محتوای مقاله (بلوک‌ها)
//                 </p>
//                 <BlockEditor 
//                   blocks={form.blocks} 
//                   onChange={(blocks) => {
//                     const calculatedTime = estimateReadingTime(blocks);
//                     setForm({ ...form, blocks, readingTime: calculatedTime });
//                   }} 
//                 />
//               </section>
//             </div>

//             <div className="flex gap-2 border-t border-white/5 px-6 py-4">
//               <button
//                 type="submit"
//                 disabled={isBusy}
//                 className="flex-1 rounded-xl bg-[#39f77b] py-3 text-sm font-extrabold text-[#031008] transition hover:brightness-110 disabled:opacity-50"
//               >
//                 {isBusy ? "در حال ذخیره‌سازی..." : "ذخیره مقاله"}
//               </button>
//             </div>
//             {formError && (
//               <p className="bg-red-500/10 px-6 py-2 text-center text-[11px] font-bold text-red-400">
//                 {formError}
//               </p>
//             )}
//           </form>
//         </div>
//       )}

//       {confirmDelete !== null && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
//           <div className="ev-card w-full max-w-sm rounded-3xl p-6 text-center">
//             <p className="text-sm font-bold text-white">این مقاله حذف شود؟</p>
//             <div className="mt-5 flex gap-2">
//               <button
//                 type="button"
//                 onClick={() => remove(confirmDelete)}
//                 className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-extrabold text-white"
//               >
//                 حذف
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setConfirmDelete(null)}
//                 className="flex-1 rounded-xl border border-white/10 py.2.5 text-sm font-bold text-white/60"
//               >
//                 انصراف
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }