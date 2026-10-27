import axios from "axios";

// تشخیص محیط اجرا (سرور داکر یا مرورگر کاربر)
const isServer = typeof window === "undefined";

// آدرس پایه هوشمند
export const API_BASE_URL = isServer 
  ? "http://backend:46329" 
  : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:46329");

// ساخت نمونه آکسیوس
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // الزامی برای ارسال کوکی در لاگین ادمین
});

// اینترسپتور برای مدیریت ارورها و ریدایرکت ادمین
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || "خطایی در ارتباط با سرور رخ داده است";
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (!isServer) {
        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;

// تابع Wrapper برای سازگاری با سایر فایل‌های API ادمین
export async function fetchApi(endpoint: string, options: any = {}) {
  try {
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

    const response = await api({
      url: endpoint,
      method: options.method || "GET",
      data: options.body, 
      headers: {
        ...options.headers,
        ...(!isFormData && { "Content-Type": "application/json" }),
      },
    });

    return response.data; 
  } catch (error: any) {
    throw error;
  }
}