// اگر بک‌اند شما روی پورت دیگری است، این آدرس را تغییر دهید
export const API_BASE_URL = "http://localhost:46329";

export const fetchApi = async (endpoint: string, options?: RequestInit) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    credentials: "include", // اضافه شده برای ارسال کوکی‌ها و توکن احراز هویت به بک‌اند
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "خطایی در ارتباط با سرور رخ داده است");
  }

  return data;
};

