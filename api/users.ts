import { fetchApi } from "./config";

// دریافت لیست تمامی کاربران
export const getUsersList = async () => {
  return fetchApi("/users", {
    method: "GET",
  });
};

// تغییر وضعیت مسدودی کاربر (فعال / غیرفعال)
export const updateUserStatus = async (id: string | number, status: string) => {
  // بر اساس فایل router.js شما، این روت برای آپدیت وضعیت در نظر گرفته شده است
  return fetchApi(`/users/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }), 
  });
};

// حذف کاربر (فقط برای سوپر ادمین)
export const deleteUser = async (id: string | number) => {
  return fetchApi(`/users/${id}`, {
    method: "DELETE",
  });
};