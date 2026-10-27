"use client";

import { toFa } from "@/lib/fa";

export interface VisitPoint {
  label: string;
  value: number | string;
}

export default function AdminChart({ points }: { points: VisitPoint[] }) {
  const W = 640;
  const H = 220;
  const PAD = 28;
  
  // جلوگیری از NaN شدن با تبدیل مقادیر به عدد و قرار دادن حداقل ۱ برای ماکزیمم
  const rawMax = Math.max(...points.map((p) => Number(p.value) || 0));
  const max = Math.max(rawMax, 1) * 1.15; 
  
  const stepX = (W - PAD * 2) / Math.max(points.length - 1, 1);

  const coords = points.map((p, i) => {
    const val = Number(p.value) || 0;
    return {
      x: PAD + i * stepX,
      y: H - PAD - (val / max) * (H - PAD * 2),
      label: p.label || "",
      value: val,
    };
  });

  const line = coords.length > 0 ? coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ") : "";
  const area = coords.length > 0 ? `${line} L${coords[coords.length - 1].x.toFixed(1)},${(H - PAD).toFixed(1)} L${coords[0].x.toFixed(1)},${(H - PAD).toFixed(1)} Z` : "";

  // محاسبه مجموع به صورت ایمن
  const totalVisits = points.reduce((s, p) => s + (Number(p.value) || 0), 0);

  return (
    <div className="ev-card rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-white">بازدید دو هفته اخیر</h3>
          <p className="mt-1 text-[11px] text-white/40">مجموع بازدید روزانه سایت</p>
        </div>
        <span className="rounded-full bg-[#39f77b]/10 px-3 py-1 text-[11px] font-bold text-[#39f77b]">
          {toFa(totalVisits)} بازدید
        </span>
      </div>
      <div dir="ltr" className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[520px] w-full" role="img" aria-label="نمودار بازدید">
          <defs>
            <linearGradient id="visitArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#39f77b" stopOpacity="0.35" />
              <stop offset="1" stopColor="#39f77b" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="visitLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#00c8ff" />
              <stop offset="1" stopColor="#39f77b" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={PAD}
              x2={W - PAD}
              y1={H - PAD - f * (H - PAD * 2)}
              y2={H - PAD - f * (H - PAD * 2)}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="4 4"
            />
          ))}
          {coords.length > 0 && (
            <>
              <path d={area} fill="url(#visitArea)" />
              <path d={line} fill="none" stroke="url(#visitLine)" strokeWidth="2.5" strokeLinecap="round" />
              {coords.map((c, i) =>
                i % 2 === 0 ? (
                  <g key={`point-${i}`}>
                    <circle cx={c.x} cy={c.y} r="3.5" fill="#071019" stroke="#39f77b" strokeWidth="2" />
                  </g>
                ) : null
              )}
            </>
          )}
        </svg>
      </div>
      <div dir="rtl" className="mt-2 flex justify-between text-[10px] text-white/30">
        <span>{points[0]?.label || ""}</span>
        <span>{points[Math.floor(points.length / 2)]?.label || ""}</span>
        <span>{points[points.length - 1]?.label || ""}</span>
      </div>
    </div>
  );
}