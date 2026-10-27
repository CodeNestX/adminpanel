import { fetchApi, API_BASE_URL } from "./config";

// گرفتن لیست همه مقالات
export const getAllArticles = async () => {
  return fetchApi("/articles", { method: "GET" });
};

// گرفتن اطلاعات یک مقاله خاص
export const getArticleById = async (id: number | string) => {
  return fetchApi(`/articles/${id}`, { method: "GET" });
};

// ایجاد مقاله جدید (چون کاور آپلود می‌شود باید از FormData استفاده کنیم)
export const createArticle = async (formData: FormData) => {
  const url = `${API_BASE_URL}/articles`; // استفاده از متغیر سراسری به جای پورت هاردکد شده
  
  const response = await fetch(url, {
    method: "POST",
    body: formData,
    credentials: "include", // مهم: برای ارسال کوکی‌ها از طریق fetch خام
  });
  
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "خطا در ایجاد مقاله");
  return data;
};

// ویرایش دیتای متنی مقاله (بدون کاور)
export const updateArticleData = async (id: number | string, data: any) => {
  return fetchApi(`/articles/${id}/data`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// ویرایش وضعیت مقاله
export const updateArticleStatus = async (id: number | string, status: string) => {
  return fetchApi(`/articles/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
};

// حذف مقاله
export const deleteArticle = async (id: number | string) => {
  return fetchApi(`/articles/${id}`, { method: "DELETE" });
};

// گرفتن بلوک‌های یک مقاله
export const getArticleBlocks = async (articleId: number | string) => {
  return fetchApi(`/articles/${articleId}/blocks`, { method: "GET" });
};

// همگام‌سازی (ذخیره) بلوک‌های مقاله (ارسال FormData برای عکس و ویدیوها)
export const syncArticleBlocks = async (articleId: number | string, formData: FormData) => {
  const url = `${API_BASE_URL}/articles/${articleId}/blocks`; // اصلاح مسیر
  
  const response = await fetch(url, {
    method: "PUT",
    body: formData,
    credentials: "include", // مهم: برای ارسال کوکی‌ها
  });
  
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "خطا در ذخیره بلوک‌ها");
  return data;
};

export const searchArticlesApi = async (query: string) => {
  return fetchApi("/articles/search", {
    method: "POST",
    body: JSON.stringify({ query }), 
  });
};