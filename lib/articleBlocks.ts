// اضافه شدن نوع embed
export type BlockType = "heading" | "paragraph" | "image" | "quote" | "list" | "embed";

export interface ArticleBlock {
  id: string;
  type: BlockType;
  // تغییر به text_content جهت هماهنگی با بک‌اند و Tiptap
  text_content: string; 
  url?: string;
  // فیلد file برای ارسال عکسِ بلوک به سمت بک‌اند
  file?: File;
  alt?: string;
  caption?: string;
}

export const blockMeta: Record<BlockType, { label: string; hint: string }> = {
  heading: { label: "تیتر", hint: "تیتر محتوا" },
  paragraph: { label: "متن", hint: "پاراگراف معمولی" },
  image: { label: "عکس", hint: "عکس با توضیحات" },
  quote: { label: "نقل‌قول", hint: "جمله برجسته" },
  list: { label: "لیست", hint: "هر آیتم در یک خط" },
  embed: { label: "ویدیو", hint: "آی‌فریم یا لینک ویدیو" }
};

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function newBlock(type: BlockType): ArticleBlock {
  return { id: uid(), type, text_content: "" };
}

// محاسبه تقریبی زمان مطالعه (هماهنگ با Tiptap)
export function estimateReadingTime(blocks: ArticleBlock[]): number {
  let words = 0;
  for (const b of blocks) {
    if (b.type !== "image" && b.type !== "embed") {
      // حذف تگ‌های HTML تا فقط کلمات واقعی شمرده شوند
      const plainText = b.text_content.replace(/<[^>]+>/g, ' ').trim();
      if (plainText) {
        words += plainText.split(/\s+/).length;
      }
    }
  }
  return Math.max(1, Math.ceil(words / 180)); // هر ۱۸۰ کلمه حدود ۱ دقیقه
}

/** اسلاگ لاتین تمیز می‌سازد؛ ورودی فارسی/خالی → شناسه خودکار */
export function slugify(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || `article-${Date.now().toString(36)}`;
}

const FA_LATIN: Record<string, string> = {
  ا: "a", آ: "a", ب: "b", پ: "p", ت: "t", ث: "s", ج: "j", چ: "ch",
  ح: "h", خ: "kh", د: "d", ذ: "z", ر: "r", ز: "z", ژ: "zh",
  س: "s", ش: "sh", ص: "s", ض: "z", ط: "t", ظ: "z", ع: "a", غ: "gh",
  ف: "f", ق: "q", ک: "k", ك: "k", گ: "g", ل: "l", م: "m", ن: "n",
  و: "v", ه: "h", ة: "h", ی: "i", ي: "i", ئ: "i", ؤ: "v", ء: "",
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
};

/** نام فارسی را به نامک لاتین خوانا تبدیل می‌کند */
export function faToSlug(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFFًٌٍَُِّْـ‌]/g, "")
    .split("")
    .map((ch) => FA_LATIN[ch] ?? (/[a-z0-9]/.test(ch) ? ch : " "))
    .join("")
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || `cat-${Date.now().toString(36)}`;
}