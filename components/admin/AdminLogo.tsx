/**
 * کامپوننت لوگوی پنل ادمین (AdminLogo)
 * 
 * کاربرد: نمایش لوگوی گرافیکی مدرن و برداری (SVG) اختصاصی ElectroCar در سایدبار پنل مدیریت.
 * 
 * ویژگی‌ها:
 * - کاملاً نمایشی (UI) و مستقل از هرگونه منطق یا دیتایی.
 * - قابلیت تغییر اندازه (Size) از طریق پراپ ورودی (به صورت پیش‌فرض روی 40 پیکسل تنظیم شده است).
 * - استفاده از گرادیانت‌های نئونی هماهنگ با تم کلی تاریک و مدرن سایت.
 */

export default function AdminLogo({ size = 40 }: { size?: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rotate-6 rounded-xl opacity-20 blur-md"
        style={{ background: "var(--green)" }}
      />
      <svg viewBox="0 0 64 64" style={{ width: size, height: size }} className="relative" fill="none">
        <path d="M42 7H18L8 25h19L17 57l35-37H33L42 7Z" fill="url(#adminLogoGradient)" />
        <defs>
          <linearGradient id="adminLogoGradient" x1="10" y1="10" x2="52" y2="52">
            <stop stopColor="#00c8ff" />
            <stop offset="1" stopColor="#39f77b" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
