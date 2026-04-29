// src/pages/admin/Overview.jsx
import React, { useState, useEffect, useRef } from "react";
import { Inbox, AlertCircle, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { ACTIVITY_COLORS } from "../../components/admin/adminConstants";
import StatCard from "../../components/admin/StatCard";
import api from "/src/Api.js";


function toDateStr(raw) {
  if (!raw) return null;
  const s = String(raw);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // Parse as UTC (backend stores UTC), convert to IST date
  const d = new Date(s.includes("T") ? s : s + "T00:00:00Z");
  if (!isNaN(d)) return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  return null;
}

function buildDateRange(complaints) {
  const dates = complaints.map((c) => toDateStr(c.created_at)).filter(Boolean);
  if (!dates.length) return [];
  const min = dates.reduce((a, b) => (a < b ? a : b));
  // Always extend to today (IST) so days with no complaints still show as empty bars
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const result = [];
  // Use plain date arithmetic without any Date object to avoid timezone shifts
  let [y, m, d] = min.split("-").map(Number);
  const [ey, em, ed] = todayStr.split("-").map(Number);
  while (true) {
    const pad = (n) => String(n).padStart(2, "0");
    const dateStr = `${y}-${pad(m)}-${pad(d)}`;
    result.push(dateStr);
    if (y === ey && m === em && d === ed) break;
    // Increment date manually — no Date object, no timezone risk
    d++;
    const daysInMonth = new Date(y, m, 0).getDate();
    if (d > daysInMonth) { d = 1; m++; }
    if (m > 12) { m = 1; y++; }
  }
  return result;
}

function AllTimeBarChart({ complaints, visible }) {
  const scrollRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  const dayMap = {};
  complaints.forEach((c) => {
    const day = toDateStr(c.created_at);
    if (day) dayMap[day] = (dayMap[day] || 0) + 1;
  });

  const allDates = buildDateRange(complaints);
  const data     = allDates.map((date) => ({ date, count: dayMap[date] || 0 }));
  const MAX      = data.length ? Math.max(...data.map((d) => d.count), 1) : 1;

  const CHART_H = 200; // px — total bar area height
  const MIN_BAR_H = 6; // px — minimum visible sliver for count >= 1

  const scaleHeight = (count) => {
    if (count === 0) return 0;
    // Linear scale — bars are strictly proportional to their count
    return Math.max(Math.round((count / MAX) * CHART_H), MIN_BAR_H);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [data.length]);

  const formatLabel = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const formatTooltipDate = (dateStr) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-IN", {
      weekday: "short", day: "numeric", month: "long", year: "numeric",
    });
  };

  if (!data.length) {
    return <p className="text-sm text-slate-400 text-center py-12">No complaints filed yet.</p>;
  }

  const barW = Math.max(40, Math.min(56, Math.floor(700 / data.length)));

  return (
    <div className="relative">
      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-20 pointer-events-none px-3 py-2 rounded-xl
                     bg-slate-900 text-white shadow-xl border border-slate-700
                     text-xs font-medium whitespace-nowrap"
          style={{
            left:      tooltip.x,
            top:       tooltip.y,
            transform: "translate(-50%, -110%)",
          }}
        >
          <p className="text-slate-300 text-[10px] mb-0.5">{formatTooltipDate(tooltip.date)}</p>
          <p className="text-white font-bold">
            {tooltip.count} {tooltip.count === 1 ? "complaint" : "complaints"}
          </p>
          <div
            className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
            style={{
              borderLeft:  "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop:   "5px solid #1e293b",
            }}
          />
        </div>
      )}

      {/* Fixed-height bar area + separate label row beneath */}
      <div ref={scrollRef} className="overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
        <div style={{ minWidth: `${Math.max(data.length * (barW + 8), 380)}px` }}>

          {/* Bar row — fixed height, bars grow from the bottom */}
          <div className="flex items-end gap-2" style={{ height: `${CHART_H}px` }}>
            {data.map(({ date, count }, i) => {
              const h = scaleHeight(count);
              return (
                <div
                  key={date}
                  className="group cursor-pointer flex-shrink-0 flex items-end"
                  style={{ width: barW, height: "100%" }}
                  onMouseEnter={(e) => {
                    const rect       = e.currentTarget.getBoundingClientRect();
                    const parentRect = e.currentTarget.closest(".relative").getBoundingClientRect();
                    setTooltip({
                      date,
                      count,
                      x: rect.left - parentRect.left + rect.width / 2,
                      y: rect.top  - parentRect.top,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-blue-800 to-blue-400
                               group-hover:from-blue-500 group-hover:to-blue-300 transition-all duration-700"
                    style={{
                      height:          visible ? `${h}px` : "0px",
                      transitionDelay: `${Math.min(i * 40, 600)}ms`,
                      opacity:         count === 0 ? 0.12 : 1,
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Label row — completely separate, always 20px tall */}
          <div className="flex gap-2 mt-1.5" style={{ height: "20px" }}>
            {data.map(({ date }, i) => (
              <div
                key={date}
                className="flex-shrink-0 flex items-center justify-center"
                style={{ width: barW }}
              >
                <span className="text-[9px] text-slate-400 whitespace-nowrap">
                  {formatLabel(date)}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

const COLOR_MAP = {
  "Pothole":        "bg-blue-500",
  "Waterlogging":   "bg-cyan-500",
  "Garbage":        "bg-emerald-500",
  "Street Light":   "bg-amber-500",
  "Infrastructure": "bg-red-400",
  "Traffic":        "bg-violet-500",
  "Other":          "bg-slate-400",
};

function Overview() {



  const [stats,      setStats]      = useState({ total:0, pending:0, inprogress:0, resolved:0, rejected:0 });
  const [complaints, setComplaints] = useState([]);
  const [activity,   setActivity]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/complaints?limit=200"),
      api.get("/admin/activity"),
      api.get("/admin/analytics/categories"),
    ])
      .then(([s, c, a, cats]) => {
        setStats(s);
        setComplaints(c.items ?? []);
        setActivity(a);
        setCategories(cats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <svg className="animate-spin w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor"
            strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Inbox}       label="Total Complaints" value={stats.total}      sub="All time"          color="text-blue-700"    bgColor="bg-blue-50"    border="border-blue-100"   />
        <StatCard icon={AlertCircle} label="Awaiting Review"  value={stats.pending}    sub="Need assignment"   color="text-amber-700"   bgColor="bg-amber-50"   border="border-amber-100"  />
        <StatCard icon={Clock}       label="In Progress"      value={stats.inprogress} sub="Being resolved"    color="text-violet-700"  bgColor="bg-violet-50"  border="border-violet-100" />
        <StatCard icon={CheckCircle} label="Resolved"         value={stats.resolved}   sub="Successfully done" color="text-emerald-700" bgColor="bg-emerald-50" border="border-emerald-100"/>
      </div>

      {/* Bar chart + category breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">All Time · Daily</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{complaints.length} complaints filed</p>
            </div>
            <div className="flex items-center gap-2">
              {complaints.length > 10 && (
                <span className="text-[10px] text-slate-400">← scroll →</span>
              )}
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <TrendingUp size={16} className="text-blue-600" />
              </div>
            </div>
          </div>
          <AllTimeBarChart complaints={complaints} visible={true} />
        </div>

        {/* Category breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">By Category</p>
          <p className="text-sm font-bold text-slate-900 mb-5">Issue breakdown</p>
          <div className="space-y-3.5">
            {categories
              .slice()
              .sort((a, b) => b.count - a.count)
              .map(({ category, count, pct }, i) => {
                const color = COLOR_MAP[category] ?? "bg-slate-400";
                return (
                  <div key={category} className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
                    <span className="text-xs text-slate-600 flex-1">{category}</span>
                    <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color} transition-all duration-700`}
                        style={{
                          width: `${pct}%`,
                          transitionDelay: `${i * 80 + 300}ms`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>

      </div>

      {/* Activity feed */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Feed</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">Recent activity</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400 font-medium">Live</span>
          </div>
        </div>
        {activity.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No recent activity.</p>
        ) : (
          <div className="space-y-1.5">
            {activity.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors duration-200"
              >
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 ${ACTIVITY_COLORS[a.type] || ACTIVITY_COLORS.update}`}>
                  {a.complaint_ref}
                </span>
                <p className="text-xs text-slate-700 flex-1">{a.action}</p>
                <span className="text-[10px] text-slate-400 shrink-0">{a.time_ago}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default Overview;