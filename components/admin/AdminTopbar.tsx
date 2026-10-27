// "use client";

// import Link from "next/link";
// import { useEffect, useRef, useState } from "react";
// import { searchArticlesApi } from "@/api/articles";

// type SearchResultItem = {
//   id: string;
//   kind: "article" | "user" | "message" | "admin";
//   title: string;
//   sub: string;
//   href: string;
// };

// const kindLabel: Record<SearchResultItem["kind"], string> = {
//   article: "مقاله",
//   user: "کاربر",
//   message: "پیام",
//   admin: "ادمین",
// };

// export default function AdminTopbar({
//   title,
//   subtitle,
//   onMenu,
// }: {
//   title: string;
//   subtitle: string;
//   onMenu: () => void;
// }) {
//   const [q, setQ] = useState("");
//   const [results, setResults] = useState<SearchResultItem[]>([]);
//   const [isSearching, setIsSearching] = useState(false);

//   const [searchOpen, setSearchOpen] = useState(false); 
//   const [notifOpen, setNotifOpen] = useState(false);
  
//   const searchWrapRef = useRef<HTMLDivElement>(null);
//   const notifRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null); 

//   const unread: any[] = []; 

//   useEffect(() => {
//     if (q.trim().length >= 2) {
//       setIsSearching(true);
//       const delay = setTimeout(async () => {
//         try {
//           const res = await searchArticlesApi(q.trim());
//           const articles = res.data || res.articles || [];
//           const mappedResults: SearchResultItem[] = articles.map((a: any) => ({
//             id: String(a.id),
//             kind: "article",
//             title: a.title,
//             sub: a.status === "published" ? "منتشرشده" : "پیش‌نویس",
//             href: `/admin/articles`, 
//           }));
//           setResults(mappedResults);
//         } catch (error) {
//           setResults([]);
//         } finally {
//           setIsSearching(false);
//         }
//       }, 500); 
//       return () => clearTimeout(delay);
//     } else {
//       setResults([]);
//       setIsSearching(false);
//     }
//   }, [q]);

//   useEffect(() => {
//     const onClick = (e: MouseEvent) => {
//       if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
//         setSearchOpen(false);
//       }
//       if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
//         setNotifOpen(false);
//       }
//     };
    
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") {
//         setSearchOpen(false);
//         setNotifOpen(false);
//       }
//     };
    
//     window.addEventListener("mousedown", onClick);
//     window.addEventListener("keydown", onKey);
//     return () => {
//       window.removeEventListener("mousedown", onClick);
//       window.removeEventListener("keydown", onKey);
//     };
//   }, []);

//   useEffect(() => {
//     if (searchOpen && inputRef.current) {
//         setTimeout(() => inputRef.current?.focus(), 50); 
//     }
//   }, [searchOpen]);

//   const markAll = () => {
//     setNotifOpen(false);
//   };

//   return (
//     <header className="sticky top-0 z-30 border-b border-white/[0.04] bg-[#050b11]/80 backdrop-blur-2xl">
//       <div className="flex h-[76px] items-center gap-4 px-4 sm:px-8">
        
//         {/* دکمه منوی موبایل */}
//         <button
//           type="button"
//           onClick={onMenu}
//           aria-label="باز کردن منو"
//           className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] text-white/50 transition-all duration-300 hover:border-[#39f77b]/30 hover:bg-[#39f77b]/5 hover:text-[#39f77b] lg:hidden"
//         >
//           <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
//             <path d="M4 7h16" />
//             <path d="M4 12h16" />
//             <path d="M4 17h16" />
//           </svg>
//         </button>

//         {/* تایتل و ساب‌تایتل با طراحی جدید و نشانگر لایو */}
//         <div className="min-w-0 flex-1 flex flex-col justify-center">
//           <h1 className="truncate text-lg sm:text-xl font-black tracking-tight text-white/95">
//             {title}
//           </h1>
//           {subtitle && (
//             <div className="hidden mt-1 sm:flex items-center gap-2">
//               <span className="relative flex h-1.5 w-1.5">
//                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39f77b] opacity-40"></span>
//                 <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#39f77b]"></span>
//               </span>
//               <p className="truncate text-[11px] font-bold tracking-wide text-white/40">
//                 {subtitle}
//               </p>
//             </div>
//           )}
//         </div>

//         {/* بخش جستجو */}
//         <div ref={searchWrapRef} className="relative hidden shrink-0 md:block">
//             <button
//               type="button"
//               onClick={() => {
//                 setSearchOpen((v) => !v);
//                 setNotifOpen(false); 
//               }}
//               aria-label="جستجو"
//               aria-expanded={searchOpen}
//               className={`relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300 ${
//                 searchOpen
//                   ? "border-[#39f77b]/40 bg-[#39f77b]/10 text-[#39f77b] shadow-[0_0_20px_rgba(57,247,123,0.15)]"
//                   : "border-white/5 bg-white/[0.02] text-white/50 hover:border-[#39f77b]/30 hover:bg-[#39f77b]/5 hover:text-[#39f77b]"
//               }`}
//             >
//                 <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                     <circle cx="11" cy="11" r="8" />
//                     <path d="m21 21-4.3-4.3" />
//                 </svg>
//             </button>

//             {searchOpen && (
//                  <div className="absolute left-0 top-full mt-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-white/10 bg-[#071019]/95 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl">
//                     <div className="p-3 border-b border-white/5">
//                         <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 transition-colors focus-within:border-[#39f77b]/50 focus-within:bg-[#39f77b]/[0.02]">
//                              <svg className="h-4.5 w-4.5 shrink-0 text-[#39f77b]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                 <circle cx="11" cy="11" r="8" />
//                                 <path d="m21 21-4.3-4.3" />
//                             </svg>
//                             <input
//                                 ref={inputRef}
//                                 value={q}
//                                 onChange={(e) => setQ(e.target.value)}
//                                 placeholder="جستجو در مقالات..."
//                                 className="w-full bg-transparent py-3 text-sm font-medium text-white outline-none placeholder:text-white/30"
//                             />
//                             {q && (
//                             <button
//                                 type="button"
//                                 onClick={() => setQ("")}
//                                 aria-label="پاک کردن جستجو"
//                                 className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] text-white/70 transition hover:bg-white/20 hover:text-white"
//                             >
//                                 ✕
//                             </button>
//                             )}
//                         </div>
//                     </div>
                    
//                     <ul className="max-h-80 overflow-y-auto p-2">
//                         {q.trim().length >= 2 ? (
//                             isSearching ? (
//                                 <p className="px-4 py-6 text-center text-xs font-medium text-white/40">در حال جستجو...</p>
//                             ) : results.length === 0 ? (
//                                 <p className="px-4 py-6 text-center text-xs font-medium text-white/40">نتیجه‌ای پیدا نشد.</p>
//                             ) : (
//                                 results.map((r) => (
//                                     <li key={r.id}>
//                                         <Link
//                                         href={r.href}
//                                         onClick={() => {
//                                             setSearchOpen(false);
//                                             setQ("");
//                                         }}
//                                         className="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-white/[0.04]"
//                                         >
//                                             <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#39f77b]/10 text-[10px] font-extrabold text-[#39f77b]">
//                                                 {kindLabel[r.kind]}
//                                             </span>
//                                             <span className="min-w-0">
//                                                 <span className="block truncate text-xs font-bold text-white">{r.title}</span>
//                                                 <span className="mt-0.5 block truncate text-[11px] text-white/40">{r.sub}</span>
//                                             </span>
//                                         </Link>
//                                     </li>
//                                 ))
//                             )
//                         ) : (
//                              <p className="px-4 py-6 text-center text-xs font-medium text-white/40">برای جستجو شروع به تایپ کنید...</p>
//                         )}
//                     </ul>
//                  </div>
//             )}
//         </div>

//         {/* بخش اعلان‌ها */}
//         <div ref={notifRef} className="relative shrink-0">
//           <button
//             type="button"
//             onClick={() => {
//                 setNotifOpen((v) => !v);
//                 setSearchOpen(false); 
//             }}
//             aria-label="اعلان‌ها"
//             aria-expanded={notifOpen}
//             className={`relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300 ${
//               notifOpen
//                 ? "border-[#39f77b]/40 bg-[#39f77b]/10 text-[#39f77b] shadow-[0_0_20px_rgba(57,247,123,0.15)]"
//                 : "border-white/5 bg-white/[0.02] text-white/50 hover:border-[#39f77b]/30 hover:bg-[#39f77b]/5 hover:text-[#39f77b]"
//             }`}
//           >
//             <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//               <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
//               <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
//             </svg>
            
//             {/* نشانگر اعلان جدید با حاشیه همرنگ پس‌زمینه برای تفکیک بهتر */}
//             {unread.length > 0 && (
//               <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-[#050b11] bg-[#39f77b] px-1 text-[9px] font-extrabold text-[#050b11] shadow-sm">
//                 {unread.length}
//               </span>
//             )}
//           </button>

//           {notifOpen && (
//             <div className="absolute left-0 top-full mt-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-white/10 bg-[#071019]/95 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl">
//               <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
//                 <p className="text-sm font-extrabold text-white">اعلان‌ها</p>
//                 <button type="button" onClick={markAll} className="text-[11px] font-bold text-[#39f77b] transition hover:text-white">
//                   بستن
//                 </button>
//               </div>
//               <ul className="max-h-80 overflow-y-auto p-2">
//                 <p className="py-8 text-center text-xs font-medium text-white/40">اعلان جدیدی ندارید.</p>
//               </ul>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* سرچ بار موبایل */}
//       <div className="border-t border-white/[0.04] px-4 py-3 md:hidden">
//         <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 transition-colors focus-within:border-[#39f77b]/50">
//           <svg className="h-4.5 w-4.5 shrink-0 text-[#39f77b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//             <circle cx="11" cy="11" r="8" />
//             <path d="m21 21-4.3-4.3" />
//           </svg>
//           <input
//             value={q}
//             onChange={(e) => setQ(e.target.value)}
//             placeholder="جستجو..."
//             className="w-full bg-transparent py-2.5 text-sm font-medium text-white outline-none placeholder:text-white/30"
//           />
//         </div>
        
//         {q.trim().length >= 2 && (
//           <div className="relative mt-2">
//             <ul className="absolute left-0 right-0 z-40 overflow-hidden rounded-2xl border border-white/10 bg-[#071019]/95 p-2 shadow-2xl backdrop-blur-xl">
//                {isSearching ? (
//                    <p className="px-4 py-4 text-center text-xs font-medium text-white/40">در حال جستجو...</p>
//                ) : results.length === 0 ? (
//                    <p className="px-4 py-4 text-center text-xs font-medium text-white/40">نتیجه‌ای پیدا نشد.</p>
//                ) : (
//                   results.map((r) => (
//                     <li key={r.id}>
//                       <Link
//                         href={r.href}
//                         onClick={() => setQ("")}
//                         className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/[0.04]"
//                       >
//                         <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#39f77b]/10 text-[9px] font-extrabold text-[#39f77b]">
//                           {kindLabel[r.kind]}
//                         </span>
//                         <span className="truncate text-xs font-bold text-white">{r.title}</span>
//                       </Link>
//                     </li>
//                   ))
//                )}
//             </ul>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// }

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { searchArticlesApi } from "@/api/articles";

type SearchResultItem = {
  id: string;
  kind: "article" | "user" | "message" | "admin";
  title: string;
  sub: string;
  href: string;
};

const kindLabel: Record<SearchResultItem["kind"], string> = {
  article: "مقاله",
  user: "کاربر",
  message: "پیام",
  admin: "ادمین",
};

export default function AdminTopbar({
  title,
  subtitle,
  onMenu,
}: {
  title: string;
  subtitle: string;
  onMenu: () => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false); 
  const [notifOpen, setNotifOpen] = useState(false);
  
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); 

  const unread: any[] = []; 

  useEffect(() => {
    if (q.trim().length >= 2) {
      setIsSearching(true);
      const delay = setTimeout(async () => {
        try {
          const res = await searchArticlesApi(q.trim());
          const articles = res.data || res.articles || [];
          const mappedResults: SearchResultItem[] = articles.map((a: any) => ({
            id: String(a.id),
            kind: "article",
            title: a.title,
            sub: a.status === "published" ? "منتشرشده" : "پیش‌نویس",
            href: `/admin/articles`, 
          }));
          setResults(mappedResults);
        } catch (error) {
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 500); 
      return () => clearTimeout(delay);
    } else {
      setResults([]);
      setIsSearching(false);
    }
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotifOpen(false);
      }
    };
    
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 50); 
    }
  }, [searchOpen]);

  const markAll = () => {
    setNotifOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.04] bg-[#050b11]/80 backdrop-blur-2xl">
      <div className="relative flex h-[76px] items-center justify-between px-4 sm:px-8">
        
        {/* سمت راست: دکمه منوی موبایل */}
        <div className="flex items-center z-10">
          <button
            type="button"
            onClick={onMenu}
            aria-label="باز کردن منو"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] text-white/50 transition-all duration-300 hover:border-[#39f77b]/30 hover:bg-[#39f77b]/5 hover:text-[#39f77b] lg:hidden"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </svg>
          </button>
        </div>

        {/* مرکز هدر: تایتل و ساب‌تایتل با طراحی شیشه‌ای و مدرن */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-0">
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-5 py-1.5 shadow-sm backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39f77b] opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#39f77b]"></span>
            </span>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-l from-white to-white/60">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="mt-1.5 text-[10px] sm:text-[11px] font-bold tracking-widest text-white/35">
              {subtitle}
            </p>
          )}
        </div>

        {/* سمت چپ: آیکون‌های جستجو و اعلان */}
        <div className="flex items-center gap-3 z-10">
          {/* بخش جستجو */}
          <div ref={searchWrapRef} className="relative hidden shrink-0 md:block pointer-events-auto">
              <button
                type="button"
                onClick={() => {
                  setSearchOpen((v) => !v);
                  setNotifOpen(false); 
                }}
                aria-label="جستجو"
                aria-expanded={searchOpen}
                className={`relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300 ${
                  searchOpen
                    ? "border-[#39f77b]/40 bg-[#39f77b]/10 text-[#39f77b] shadow-[0_0_20px_rgba(57,247,123,0.15)]"
                    : "border-white/5 bg-white/[0.02] text-white/50 hover:border-[#39f77b]/30 hover:bg-[#39f77b]/5 hover:text-[#39f77b]"
                }`}
              >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                  </svg>
              </button>

              {searchOpen && (
                  <div className="absolute left-0 top-full mt-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-white/10 bg-[#071019]/95 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                      <div className="p-3 border-b border-white/5">
                          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 transition-colors focus-within:border-[#39f77b]/50 focus-within:bg-[#39f77b]/[0.02]">
                              <svg className="h-4.5 w-4.5 shrink-0 text-[#39f77b]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="11" cy="11" r="8" />
                                  <path d="m21 21-4.3-4.3" />
                              </svg>
                              <input
                                  ref={inputRef}
                                  value={q}
                                  onChange={(e) => setQ(e.target.value)}
                                  placeholder="جستجو در مقالات..."
                                  className="w-full bg-transparent py-3 text-sm font-medium text-white outline-none placeholder:text-white/30"
                              />
                              {q && (
                              <button
                                  type="button"
                                  onClick={() => setQ("")}
                                  aria-label="پاک کردن جستجو"
                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[10px] text-white/70 transition hover:bg-white/20 hover:text-white"
                              >
                                  ✕
                              </button>
                              )}
                          </div>
                      </div>
                      
                      <ul className="max-h-80 overflow-y-auto p-2 text-right">
                          {q.trim().length >= 2 ? (
                              isSearching ? (
                                  <p className="px-4 py-6 text-center text-xs font-medium text-white/40">در حال جستجو...</p>
                              ) : results.length === 0 ? (
                                  <p className="px-4 py-6 text-center text-xs font-medium text-white/40">نتیجه‌ای پیدا نشد.</p>
                              ) : (
                                  results.map((r) => (
                                      <li key={r.id}>
                                          <Link
                                          href={r.href}
                                          onClick={() => {
                                              setSearchOpen(false);
                                              setQ("");
                                          }}
                                          className="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-white/[0.04]"
                                          >
                                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#39f77b]/10 text-[10px] font-extrabold text-[#39f77b]">
                                                  {kindLabel[r.kind]}
                                              </span>
                                              <span className="min-w-0">
                                                  <span className="block truncate text-xs font-bold text-white">{r.title}</span>
                                                  <span className="mt-0.5 block truncate text-[11px] text-white/40">{r.sub}</span>
                                              </span>
                                          </Link>
                                      </li>
                                  ))
                              )
                          ) : (
                              <p className="px-4 py-6 text-center text-xs font-medium text-white/40">برای جستجو شروع به تایپ کنید...</p>
                          )}
                      </ul>
                  </div>
              )}
          </div>

          {/* بخش اعلان‌ها */}
          <div ref={notifRef} className="relative shrink-0 pointer-events-auto">
            <button
              type="button"
              onClick={() => {
                  setNotifOpen((v) => !v);
                  setSearchOpen(false); 
              }}
              aria-label="اعلان‌ها"
              aria-expanded={notifOpen}
              className={`relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all duration-300 ${
                notifOpen
                  ? "border-[#39f77b]/40 bg-[#39f77b]/10 text-[#39f77b] shadow-[0_0_20px_rgba(57,247,123,0.15)]"
                  : "border-white/5 bg-white/[0.02] text-white/50 hover:border-[#39f77b]/30 hover:bg-[#39f77b]/5 hover:text-[#39f77b]"
              }`}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              
              {unread.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-[#050b11] bg-[#39f77b] px-1 text-[9px] font-extrabold text-[#050b11] shadow-sm">
                  {unread.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute left-0 top-full mt-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-white/10 bg-[#071019]/95 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/5 px-5 py-4 text-right">
                  <p className="text-sm font-extrabold text-white">اعلان‌ها</p>
                  <button type="button" onClick={markAll} className="text-[11px] font-bold text-[#39f77b] transition hover:text-white">
                    بستن
                  </button>
                </div>
                <ul className="max-h-80 overflow-y-auto p-2">
                  <p className="py-8 text-center text-xs font-medium text-white/40">اعلان جدیدی ندارید.</p>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* سرچ بار موبایل (فقط در صفحات کوچک) */}
      <div className="border-t border-white/[0.04] px-4 py-3 md:hidden">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 transition-colors focus-within:border-[#39f77b]/50">
          <svg className="h-4.5 w-4.5 shrink-0 text-[#39f77b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجو..."
            className="w-full bg-transparent py-2.5 text-sm font-medium text-white outline-none placeholder:text-white/30"
          />
        </div>
        
        {q.trim().length >= 2 && (
          <div className="relative mt-2">
            <ul className="absolute left-0 right-0 z-40 overflow-hidden rounded-2xl border border-white/10 bg-[#071019]/95 p-2 shadow-2xl backdrop-blur-xl">
               {isSearching ? (
                   <p className="px-4 py-4 text-center text-xs font-medium text-white/40">در حال جستجو...</p>
               ) : results.length === 0 ? (
                   <p className="px-4 py-4 text-center text-xs font-medium text-white/40">نتیجه‌ای پیدا نشد.</p>
               ) : (
                  results.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={r.href}
                        onClick={() => setQ("")}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/[0.04]"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#39f77b]/10 text-[9px] font-extrabold text-[#39f77b]">
                          {kindLabel[r.kind]}
                        </span>
                        <span className="truncate text-xs font-bold text-white">{r.title}</span>
                      </Link>
                    </li>
                  ))
               )}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}