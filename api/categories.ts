import { fetchApi } from "./config";

// --- دسته‌بندی‌های پایه (بدون زبان - Parent) ---

export const getBaseCategories = async () => {
  return fetchApi("/categories/base", { method: "GET" });
};

export const createBaseCategory = async (name: string) => {
  return fetchApi("/categories/base", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
};

export const updateBaseCategory = async (id: number | string, name: string) => {
  return fetchApi(`/categories/base/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
};

export const deleteBaseCategory = async (id: number | string) => {
  return fetchApi(`/categories/base/${id}`, { method: "DELETE" });
};

// --- ترجمه‌های دسته‌بندی (دارای زبان - Sub) ---

export const getAllCategoryTranslations = async () => {
  return fetchApi("/categories/translations", { method: "GET" });
};

export const createCategoryTranslation = async (data: {
  category_id: number | string;
  language: string;
  name: string;
  slug: string;
}) => {
  return fetchApi("/categories/translations", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateCategoryTranslation = async (id: number | string, data: any) => {
  return fetchApi(`/categories/translations/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteCategoryTranslation = async (id: number | string) => {
  return fetchApi(`/categories/translations/${id}`, { method: "DELETE" });
};