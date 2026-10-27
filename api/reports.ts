// فایل: api/reports.ts
import { fetchApi } from "./config";

export const getTotalArticlesReport = async () => {
  return fetchApi("/admin/reports/articles", { method: "GET" });
};

export const getArticlesStatusReport = async () => {
  return fetchApi("/admin/reports/articles/status", { method: "GET" });
};

export const getNumberUsersReport = async () => {
  return fetchApi("/admin/reports/users", { method: "GET" });
};

export const getUnreadMessagesReport = async () => {
  return fetchApi("/admin/reports/messages/unread", { method: "GET" });
};

export const getTotalViewsReport = async () => {
  return fetchApi("/admin/reports/views", { method: "GET" });
};

export const getDailyViewsReport = async () => {
  return fetchApi("/admin/reports/views/daily", { method: "GET" });
};