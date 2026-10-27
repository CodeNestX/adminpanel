import { fetchApi } from "./config";

// دریافت پیام‌های خوانده نشده
export const getUnreadMessages = async () => {
  return fetchApi("/admin/contact/unread", { method: "GET" });
};

// دریافت پیام‌های خوانده شده
export const getReadMessages = async () => {
  return fetchApi("/admin/contact/read", { method: "GET" });
};

// تغییر وضعیت پیام (خوانده شده / خوانده نشده)
export const updateMessageStatus = async (id: number | string, status: "read" | "unread") => {
  return fetchApi(`/admin/contact/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
};

// حذف دائم پیام
export const deleteMessage = async (id: number | string) => {
  return fetchApi(`/admin/contact/${id}`, { method: "DELETE" });
};