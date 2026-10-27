import { fetchApi } from "./config";

// ورود مدیر
export const loginAdmin = async (username: string, password: string) => {
  return fetchApi("/admins/login", {
    method: "POST",
    body: JSON.stringify({ admin_name: username, password }),
  });
};

// دریافت لیست همه مدیران
export const getAdminsList = async () => {
  return fetchApi("/admins", {
    method: "GET",
  });
};

// ایجاد مدیر جدید
export const createAdmin = async (adminData: any) => {
  return fetchApi("/admins", {
    method: "POST",
    body: JSON.stringify(adminData),
  });
};

// ویرایش مدیر
export const updateAdmin = async (id: string | number, adminData: any) => {
  return fetchApi(`/admins/${id}`, {
    method: "PUT",
    body: JSON.stringify(adminData),
  });
};

// حذف مدیر
export const deleteAdmin = async (id: string | number) => {
  return fetchApi(`/admins/${id}`, {
    method: "DELETE",
  });
};