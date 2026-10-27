import { fetchApi } from "./config";

// دریافت نظرات در انتظار تایید
export const getPendingComments = async () => {
  return fetchApi("/admin/articles/comments/pending", { method: "GET" });
};

// دریافت نظرات تایید شده
export const getApprovedComments = async () => {
  return fetchApi("/admin/articles/comments/approved", { method: "GET" });
};

// تغییر وضعیت نظر (تایید یا در انتظار)
export const updateCommentStatus = async (id: number | string, status: "approved" | "pending") => {
  return fetchApi(`/admin/comments/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
};

// حذف دائم نظر
export const deleteComment = async (id: number | string) => {
  return fetchApi(`/comments/${id}`, { method: "DELETE" });
};