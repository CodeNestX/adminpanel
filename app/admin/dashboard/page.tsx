"use client";  
  
import { useEffect, useState } from "react";  
import Link from "next/link";  
import StatCard from "@/components/admin/StatCard";  
import AdminChart from "@/components/admin/AdminChart";  
import { getAllArticles } from "@/api/articles";  
import { getUnreadMessages } from "@/api/messages";  
import { toFa } from "@/lib/fa";  
  
import {  
 getTotalArticlesReport,  
 getArticlesStatusReport,  
 getNumberUsersReport,  
 getUnreadMessagesReport,  
 getTotalViewsReport,  
 getDailyViewsReport,  
} from "@/api/reports";   
  
export default function DashboardPage() {  
  const [totalArticlesCount, setTotalArticlesCount] = useState(0);  
  const [articlesStatus, setArticlesStatus] = useState({ published: 0, draft: 0, archived: 0 });  
  const [usersCount, setUsersCount] = useState(0);  
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);  
  const [totalViewsCount, setTotalViewsCount] = useState(0);  
  const [dailyViews, setDailyViews] = useState<{ label: string; value: number }[]>([]);  
  
  const [recentArticles, setRecentArticles] = useState<any[]>([]);  
  const [recentUnreadMsgs, setRecentUnreadMsgs] = useState<any[]>([]);  
  
  useEffect(() => {  
    getTotalArticlesReport().then(res => setTotalArticlesCount(res.total || 0)).catch(()=>{});  
   
    getArticlesStatusReport().then(res => {  
      setArticlesStatus({  
        published: res.published || 0,  
        draft: res.draft || 0,  
        archived: res.archived || 0  
      });  
    }).catch(()=>{});  
  
    getNumberUsersReport().then(res => setUsersCount(res.total || 0)).catch(()=>{});  
    getUnreadMessagesReport().then(res => setUnreadMsgCount(res.count || 0)).catch(()=>{});  
    getTotalViewsReport().then(res => setTotalViewsCount(res.total_views || 0)).catch(()=>{});  
  
    getDailyViewsReport().then(res => {  
      if (res.data && Array.isArray(res.data)) {  
        // -------------------------------------------------------------
        // راه‌حل قطعی مشکل نمودار: 
        // تبدیل date و count بک‌اند به label و value که نمودار نیاز دارد
        // -------------------------------------------------------------
        const formattedData = res.data.map((item: any) => ({
          label: item.date,
          value: item.count
        }));
        setDailyViews(formattedData);  
      }  
    }).catch(()=>{});  
  
    getAllArticles().then(res => setRecentArticles((res.data || res.articles || []).slice(0, 3))).catch(()=>{});  
    getUnreadMessages().then(res => setRecentUnreadMsgs((res.data || []).slice(0, 3))).catch(()=>{});  
   
  }, []);  
  
  return (  
    <div className="space-y-4 sm:space-y-5">  
      {/* ردیف اول: کارت‌های آماری */}  
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">  
        <StatCard  
          title="کل مقالات"  
          value={toFa(totalArticlesCount)}  
          hint={  
            <span className="mt-2 flex flex-wrap items-center gap-2">  
              <span className="flex items-center gap-1 rounded-md bg-[#39f77b]/15 px-2 py-1 text-[10px] font-bold text-[#39f77b]">  
                منتشرشده: {toFa(articlesStatus.published)}  
              </span>  
              <span className="flex items-center gap-1 rounded-md bg-[#00c8ff]/15 px-2 py-1 text-[10px] font-bold text-[#00c8ff]">  
                پیش‌نویس: {toFa(articlesStatus.draft)}  
              </span>  
              <span className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[10px] font-bold text-white/50">  
                آرشیو: {toFa(articlesStatus.archived)}  
              </span>  
            </span>  
          }  
          accent="green"  
          icon={  
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">  
              <path d="M5 4h14v12H9l-4 4V4Z" strokeLinejoin="round" />  
            </svg>  
          }  
        />  
        <StatCard  
          title="کاربران"  
          value={toFa(usersCount)}  
          hint={`مجموع کاربران ثبت‌نام شده`}   
          accent="blue"  
          icon={  
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">  
              <circle cx="12" cy="8" r="3.4" />  
              <path d="M5 20c.8-3.4 3.4-5 7-5s6.2 1.6 7 5" strokeLinecap="round" />  
            </svg>  
          }  
        />  
        <StatCard  
          title="پیام‌های خوانده‌نشده"  
          value={toFa(unreadMsgCount)}  
          hint="پیام‌های جدید از سمت کاربران"  
          accent="amber"  
          icon={  
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">  
              <rect x="3" y="5" width="18" height="14" rx="2" />  
              <path d="m4 7 8 6 8-6" strokeLinejoin="round" />  
            </svg>  
          }  
        />  
        <StatCard  
          title="مجموع بازدید مقالات"  
          value={toFa(totalViewsCount)}  
          hint="از ابتدای انتشار مقالات"  
          accent="violet"  
          icon={  
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">  
              <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" strokeLinejoin="round" />  
              <circle cx="12" cy="12" r="2.5" />  
            </svg>  
          }  
        />  
      </div>  
  
      {/* ردیف دوم: چارت و لیست‌ها به صورت افقی (بدون نیاز به اسکرول) */}  
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">  
   
        {/* نمودار (۵۰٪ از فضا را در مانیتور بزرگ می‌گیرد) */}  
        <div className="xl:col-span-2 [&>div]:h-full">  
          {dailyViews.length > 0 ? (  
            <AdminChart points={dailyViews} />  
          ) : (  
            <div className="ev-card rounded-2xl p-5 flex h-full min-h-[220px] items-center justify-center text-xs text-white/40">  
              در حال دریافت آمار بازدید...  
            </div>  
          )}  
        </div>  
  
        {/* آخرین مقالات (۲۵٪ از فضا) */}  
        <div className="ev-card flex h-full flex-col rounded-2xl p-5 xl:col-span-1">  
          <div className="mb-4 flex items-center justify-between">  
            <h3 className="text-sm font-extrabold text-white">آخرین مقالات</h3>  
            <Link href="/admin/articles" className="text-[11px] font-bold text-[#39f77b] transition hover:text-[#00c8ff]">  
              مدیریت ‹  
            </Link>  
          </div>  
          <ul className="flex-1 space-y-3">  
            {recentArticles.map((a) => (  
              <li key={a.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-2">  
                <img src={a.image || "https://images.unsplash.com/photo-1593941707882-a5bba14938c7"} alt="" className="h-10 w-12 shrink-0 rounded-lg object-cover" />  
                <span className="min-w-0 flex-1">  
                  <span className="block truncate text-[11px] font-bold text-white">{a.title}</span>  
                  <span className="mt-1 block text-[9px] text-white/35">  
                    {/* اصلاح نام view_count به views برای هماهنگی با بک‌اند */}
                    {a.status === "published" ? "منتشرشده" : "پیشنویس"} • {toFa(a.views || 0)} بازدید  
                  </span>  
                </span>  
              </li>  
            ))}  
            {recentArticles.length === 0 && <p className="text-center text-xs text-white/30 py-5">مقاله‌ای ثبت نشده است.</p>}  
          </ul>  
        </div>  
  
        {/* آخرین پیام‌ها (۲۵٪ از فضا) */}  
        <div className="ev-card flex h-full flex-col rounded-2xl p-5 xl:col-span-1">  
          <div className="mb-4 flex items-center justify-between">  
            <h3 className="text-sm font-extrabold text-white">آخرین پیام‌ها</h3>  
            <Link href="/admin/messages" className="text-[11px] font-bold text-[#39f77b] transition hover:text-[#00c8ff]">  
              صندوق ‹  
            </Link>  
          </div>  
          <ul className="flex-1 space-y-3">  
            {recentUnreadMsgs.map((m) => (  
              <li key={m.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">  
                <p className="flex items-center gap-2 text-[11px] font-bold text-white">  
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#39f77b]" />  
                  <span className="truncate">{m.subject}</span>  
                </p>  
                <p className="mt-1 truncate text-[10px] text-white/40">  
                  {m.name} • {new Date(m.created_at).toLocaleDateString('fa-IR')}  
                </p>  
              </li>  
            ))}  
            {recentUnreadMsgs.length === 0 && <p className="text-center text-xs text-white/30 py-5">پیام جدیدی ندارید.</p>}  
          </ul>  
        </div>  
   
      </div>  
    </div>  
  );  
}