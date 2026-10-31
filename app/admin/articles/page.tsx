"use client";

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
        imageFile: null, imageUrl: "", coverAlt: "", excerpt: "", status: "published", readingTime: "1",
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
        imageFile: null, imageUrl: a.cover_url || "", coverAlt: "", excerpt: a.excerpt || "", status: a.status || "published", readingTime: a.reading_time_minutes || "1",
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
        fd.append("alt_text", form.coverAlt);
        fd.append("caption", form.coverAlt);
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
        
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 flex-1">
          
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