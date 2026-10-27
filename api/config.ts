import axios from "axios";

// ۱. تنظیم آدرس پایه
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:0050/api";

// ۲. ساخت یک نمونه (Instance) اختصاصی از آکسیوس
const api = axios.create({
  baseURL: API_BASE_URL,
});

// ۳. اینترسپتور درخواست: تزریق خودکار توکن به همه ریکوئست‌ها
api.interceptors.request.use(
  (config) => {
    // گرفتن توکن از لوکال استوریج (فقط در محیط کلاینت)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ۴. اینترسپتور پاسخ: مدیریت سراسری ارورها (مثل ارور 401 و 403)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // استخراج پیام ارور از سمت بک‌اند
    const message = error.response?.data?.message || "خطایی در ارتباط با سرور رخ داده است";
    
    // مدیریت دسترسی غیرمجاز و توکن منقضی شده
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // اختیاری: می‌توانید در اینجا کاربر را اتوماتیک به صفحه لاگین بفرستید
        // localStorage.removeItem("token");
        // window.location.href = "/admin/login";
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;

// =========================================================================
// Wrapper: تابع سازگارساز برای جلوگیری از خرابی سایر فایل‌های پروژه
// این تابع دقیقاً شکل fetchApi قبلی را دارد اما مغز آن با Axios کار می‌کند
// =========================================================================
export async function fetchApi(endpoint: string, options: any = {}) {
  try {
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

    const response = await api({
      url: endpoint,
      method: options.method || "GET",
      // در آکسیوس از data به جای body استفاده می‌شود
      data: options.body, 
      headers: {
        ...options.headers,
        // اگر دیتا FormData نباشد، هدر پیش‌فرض JSON قرار می‌گیرد
        ...(!isFormData && { "Content-Type": "application/json" }),
      },
    });

    // آکسیوس خودش JSON را پارس می‌کند، نیازی به response.json() نیست
    return response.data; 
  } catch (error: any) {
    // پرتاب ارور برای هندل شدن در کامپوننت‌ها (با پیامی که اینترسپتور ساخته است)
    throw error;
  }
}