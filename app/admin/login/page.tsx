"use client";  
  
import { useEffect, useState } from "react";  
import { useRouter } from "next/navigation";  
import { useAdminAuth } from "@/context/AdminAuthContext";  
  
function CarMark() {  
  return (  
    <div className="flex h-[28px] w-[72px] items-center justify-center rounded-full border border-[#39F77B]/20 bg-[#39F77B]/[0.04]">  
      <svg width="44" height="18" viewBox="0 0 44 18" fill="none">  
        <path  
          d="M6 12c2-4 8-6.5 16-6.5S36 8 38 12"  
          stroke="#39F77B"  
          strokeWidth="1.6"  
          strokeLinecap="round"  
        />  
        <circle cx="12" cy="12.5" r="2.2" fill="#39F77B" />  
        <circle cx="32" cy="12.5" r="2.2" fill="#39F77B" />  
        <path d="M14 9.5h16" stroke="#00E5A0" strokeWidth="1.2" strokeLinecap="round" />  
      </svg>  
    </div>  
  );  
}  
  
export default function AdminLoginPage() {  
  const router = useRouter();  
  const { user, login } = useAdminAuth();  
  const [username, setUsername] = useState("");  
  const [password, setPassword] = useState("");  
  const [remember, setRemember] = useState(true);  
  const [error, setError] = useState<string | null>(null);  
  const [busy, setBusy] = useState(false);  
  
  useEffect(() => {  
    if (user) router.replace("/admin/dashboard");  
  }, [user, router]);  
  
  if (user) return null;  
  
  const submit = async (e: React.FormEvent) => {  
    e.preventDefault();  
    setBusy(true);  
    const err = await login(username, password);  
    setBusy(false);  
    if (err) {  
      setError(err);  
      return;  
    }  
    setError(null);  
    router.replace("/admin/dashboard");  
  };  
  
  return (  
    <div  
      dir="rtl"  
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10"  
      style={{ background: "linear-gradient(135deg, #020609 0%, #06151A 55%, #02080B 100%)" }}  
    >  
      {/* top green line */}  
      <div  
        className="absolute inset-x-0 top-0 h-[3px]"  
        style={{ background: "linear-gradient(90deg, #00E5A0, #39F77B)" }}  
      />  
      {/* soft blobs */}  
      <div  
        className="pointer-events-none absolute -left-[10%] -top-[15%] h-[320px] w-[60%] rounded-[100%]"  
        style={{ background: "rgba(0,229,160,0.06)" }}  
      />  
      <div  
        className="pointer-events-none absolute -bottom-[15%] -right-[10%] h-[320px] w-[60%] rounded-[100%]"  
        style={{ background: "rgba(57,247,123,0.05)" }}  
      />  
  
      <div className="relative w-full max-w-[560px] rounded-[28px] border border-[#173B42] bg-[#07151A] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:p-12">  
        <div className="flex flex-col items-center text-center">  
          <CarMark />  
          <h1 className="mt-4 text-[28px] font-extrabold tracking-tight text-white">  
            ElectroCar  
          </h1>  
          <p className="mt-2 text-[12px] text-white/40">پنل مدیریت</p>  
  
          <h2 className="mt-8 text-[20px] font-extrabold text-white">  
            ورود به پنل مدیریت  
          </h2>  
          <p className="mt-2 text-[12px] text-white/40">  
            اطلاعات حساب مدیر را وارد کنید  
          </p>  
        </div>  
  
        <form onSubmit={submit} className="mt-8 space-y-5">  
          <div>  
            <label className="mb-2 block text-right text-[12px] text-white/60">  
              نام کاربری  
            </label>  
            <div className="relative">  
              <input  
                value={username}  
                onChange={(e) => setUsername(e.target.value)}  
                placeholder="نام کاربری خود را وارد کنید"  
                autoComplete="username"  
                className="auth-input-admin h-[55px] w-full rounded-[15.5px] border border-[#173B42] bg-[#020A0E] px-4 pl-12 text-[13px] text-white outline-none transition placeholder:text-white/25 focus:border-[#39F77B]/50"  
              />  
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#71858D]">  
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">  
                  <circle cx="12" cy="8" r="4" />  
                  <path d="M4 21c1.5-4 5-5.5 8-5.5s6.5 1.5 8 5.5" strokeLinecap="round" />  
                </svg>  
              </span>  
            </div>  
          </div>  
  
          <div>  
            <label className="mb-2 block text-right text-[12px] text-white/60">  
              رمز عبور  
            </label>  
            <div className="relative">  
              <input  
                type="password"  
                value={password}  
                onChange={(e) => setPassword(e.target.value)}  
                placeholder="رمز عبور خود را وارد کنید"  
                autoComplete="current-password"  
                className="auth-input-admin h-[55px] w-full rounded-[15.5px] border border-[#173B42] bg-[#020A0E] px-4 pl-12 text-[13px] text-white outline-none transition placeholder:text-white/25 focus:border-[#39F77B]/50"  
              />  
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#71858D]">  
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">  
                  <rect x="4" y="11" width="16" height="9" rx="2" />  
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />  
                  <circle cx="12" cy="15.5" r="1" fill="currentColor" />  
                </svg>  
              </span>  
            </div>  
          </div>  
  
          <div className="flex items-center justify-between pt-1">  
            <button type="button" className="text-[12px] text-white/50 transition hover:text-white">  
              فراموشی رمز عبور؟  
            </button>  
            <button  
              type="button"  
              onClick={() => setRemember(!remember)}  
              className="flex items-center gap-2 text-[12px] text-white/60"  
            >  
              <span  
                className={`flex h-[19px] w-[19px] items-center justify-center rounded-[4px] border transition ${  
                  remember  
                    ? "border-[#0A6C70] bg-transparent text-[#39F77B]"  
                    : "border-white/20 bg-transparent text-transparent"  
                }`}  
              >  
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">  
                  <path d="M4 12.5l5 5L20 6.5" />  
                </svg>  
              </span>  
              مرا به خاطر بسپار  
            </button>  
          </div>  
  
          {error && (  
            <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-300">  
              {error}  
            </p>  
          )}  
  
          <button  
            type="submit"  
            disabled={busy}  
            className="flex h-14 w-full items-center justify-center gap-2 rounded-[16px] text-[15px] font-extrabold text-[#02100D] transition hover:brightness-110 disabled:opacity-60"  
            style={{ background: "linear-gradient(180deg, #00E5A0 0%, #39F77B 100%)" }}  
          >  
            {busy ? "در حال ورود..." : "ورود به پنل"}  
            {!busy && (  
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">  
                <path d="M5 12h14" />  
                <path d="M12 5l7 7-7 7" />  
              </svg>  
            )}  
          </button>  
  
          <p className="pt-1 text-center text-[12px] text-white/40">  
            دسترسی فقط برای مدیران مجاز  
          </p>  
  
          <div className="pt-4 text-center">  
            <p className="text-[12px] text-white/40">ElectroCar Admin Panel</p>  
            <p className="mt-2 text-[12px] text-white/40">  
              مدیریت هوشمند وب‌سایت خودروهای برقی  
            </p>  
          </div>  
        </form>  
      </div>  
    </div>  
  );  
}