// src/pages/admin/Analytics.jsx
import React, { useState, useEffect } from "react";
import {
  Flag, Globe, MapPin, CheckCircle, Brain,
  AlertTriangle, ShieldCheck, Zap, TrendingUp
} from "lucide-react";
import api from "../../api";

const CITY_ACCENTS = [
  "border-t-4 border-t-blue-500",
  "border-t-4 border-t-emerald-500",
  "border-t-4 border-t-amber-500",
  "border-t-4 border-t-violet-500",
  "border-t-4 border-t-red-500",
  "border-t-4 border-t-cyan-500",
];

const SLICE_COLORS = [
  { bg: "bg-blue-500",    hex: "#3b82f6", text: "text-blue-700",   light: "bg-blue-50"    },
  { bg: "bg-emerald-500", hex: "#10b981", text: "text-emerald-700", light: "bg-emerald-50" },
  { bg: "bg-amber-500",   hex: "#f59e0b", text: "text-amber-700",   light: "bg-amber-50"   },
  { bg: "bg-violet-500",  hex: "#8b5cf6", text: "text-violet-700",  light: "bg-violet-50"  },
  { bg: "bg-red-500",     hex: "#ef4444", text: "text-red-700",     light: "bg-red-50"     },
  { bg: "bg-cyan-500",    hex: "#06b6d4", text: "text-cyan-700",    light: "bg-cyan-50"    },
  { bg: "bg-pink-500",    hex: "#ec4899", text: "text-pink-700",    light: "bg-pink-50"    },
  { bg: "bg-slate-400",   hex: "#94a3b8", text: "text-slate-600",   light: "bg-slate-50"   },
];

const DEPT_COLORS = {
  "PWD Department":        { hex: "#3b82f6", bg: "bg-blue-500"    },
  "Municipal Corporation": { hex: "#10b981", bg: "bg-emerald-500" },
  "Electricity Dept":      { hex: "#f59e0b", bg: "bg-amber-500"   },
  "Traffic Police":        { hex: "#8b5cf6", bg: "bg-violet-500"  },
  "NHAI":                  { hex: "#ef4444", bg: "bg-red-500"     },
};
const DEFAULT_DEPT = { hex: "#94a3b8", bg: "bg-slate-400" };

// ── SVG Donut chart ───────────────────────────────────────────────────────────
function PieChart({ slices, size = 180, centerLabel, centerSub }) {
  const r = 60, cx = size / 2, cy = size / 2, stroke = 28;
  let cumAngle = -90;
  const arcs = slices.map((s) => {
    const startAngle = cumAngle;
    const sweep      = (s.pct / 100) * 360;
    cumAngle        += sweep;
    return { ...s, startAngle, sweep };
  });

  function polarToXY(angleDeg, radius) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function describeArc(startAngle, sweep, radius) {
    if (sweep >= 360) sweep = 359.99;
    const start = polarToXY(startAngle, radius);
    const end   = polarToXY(startAngle + sweep, radius);
    const large = sweep > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${large} 1 ${end.x} ${end.y}`;
  }

  if (!slices.length) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke + 4} />
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="11" fill="#94a3b8">No data</text>
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke + 4} />
      {arcs.map((arc, i) => (
        <path key={i} d={describeArc(arc.startAngle, arc.sweep, r)}
          fill="none" stroke={arc.hex} strokeWidth={stroke} strokeLinecap="butt" />
      ))}
      {centerLabel && (
        <>
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="800" fill="#0f172a">
            {centerLabel}
          </text>
          {centerSub && (
            <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="600">
              {centerSub}
            </text>
          )}
        </>
      )}
    </svg>
  );
}

// ── Horizontal bar ────────────────────────────────────────────────────────────
function HBar({ label, value, max, color, sublabel }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-sm font-bold text-slate-900">{value}</span>
      </div>
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }} />
      </div>
      {sublabel && <p className="text-[10px] text-slate-400 mt-1">{sublabel}</p>}
    </div>
  );
}

// ── AI Confidence Gauge ───────────────────────────────────────────────────────
function ConfidenceGauge({ value }) {
  const pct   = Math.round((value ?? 0) * 100);
  const color = pct >= 70 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
  const label = pct >= 70 ? "High" : pct >= 50 ? "Medium" : "Low";
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="80" height="48" viewBox="0 0 80 48">
        <path d="M 8 44 A 32 32 0 0 1 72 44" fill="none" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" />
        <path d="M 8 44 A 32 32 0 0 1 72 44" fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 100.5} 100.5`} />
        <text x="40" y="42" textAnchor="middle" fontSize="13" fontWeight="800" fill="#0f172a">
          {pct}%
        </text>
      </svg>
      <span className="text-[10px] font-bold uppercase tracking-wider"
        style={{ color }}>{label} Confidence</span>
    </div>
  );
}

// ── AI Label Bar chart ────────────────────────────────────────────────────────
function AILabelBars({ labelCounts }) {
  const entries = Object.entries(labelCounts).sort((a, b) => b[1] - a[1]);
  const max     = entries.length ? Math.max(...entries.map(([, v]) => v), 1) : 1;
  const colors  = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

  if (!entries.length) {
    return <p className="text-sm text-slate-400 text-center py-6">No AI classifications yet.</p>;
  }

  return (
    <div className="space-y-3">
      {entries.map(([label, count], i) => (
        <div key={label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-700">{label}</span>
            <span className="text-xs font-bold text-slate-900">{count}</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(count / max) * 100}%`, background: colors[i % colors.length] }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function Analytics() {
  const [stats,       setStats]       = useState(null);
  const [aiStats,     setAiStats]     = useState(null);
  const [complaints,  setComplaints]  = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin/stats"),
      api.get("/admin/stats/ai"),
      api.get("/admin/complaints?limit=200"),
      api.get("/admin/departments"),
      api.get("/admin/analytics/categories"),
    ])
      .then(([s, ai, c, d, cats]) => {
        setStats(s);
        setAiStats(ai);
        setComplaints(c.items ?? []);
        setDepartments(Array.isArray(d) ? d : []);
        setCategories(Array.isArray(cats) ? cats : []);
      })
      .catch((err) => console.error("[Analytics]", err))
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

  const total = complaints.length;

  const categorySlices = categories
    .sort((a, b) => b.count - a.count)
    .map(({ category, count, pct }, i) => ({
      label: category, count, pct,
      hex:   SLICE_COLORS[i % SLICE_COLORS.length].hex,
      bg:    SLICE_COLORS[i % SLICE_COLORS.length].bg,
      text:  SLICE_COLORS[i % SLICE_COLORS.length].text,
      light: SLICE_COLORS[i % SLICE_COLORS.length].light,
    }));

  const STATUS_CFG = [
    { key: "pending",    label: "Pending",     hex: "#f59e0b", text: "text-amber-700",   light: "bg-amber-50"   },
    { key: "inprogress", label: "In Progress", hex: "#8b5cf6", text: "text-violet-700",  light: "bg-violet-50"  },
    { key: "resolved",   label: "Resolved",    hex: "#10b981", text: "text-emerald-700", light: "bg-emerald-50" },
    { key: "rejected",   label: "Rejected",    hex: "#ef4444", text: "text-red-700",     light: "bg-red-50"     },
  ];
  const statusSlices = STATUS_CFG
    .map((s) => ({
      ...s,
      count: stats?.[s.key] ?? 0,
      pct:   stats?.total > 0 ? Math.round(((stats[s.key] ?? 0) / stats.total) * 100) : 0,
    }))
    .filter((s) => s.count > 0);

  const priorityMap = { High: 0, Medium: 0, Low: 0 };
  complaints.forEach((c) => { if (c.priority in priorityMap) priorityMap[c.priority]++; });
  const maxPriority = Math.max(...Object.values(priorityMap), 1);

  const cityMap = {};
  complaints.forEach((c) => {
    if (!c.city) return;
    if (!cityMap[c.city]) cityMap[c.city] = { total: 0, resolved: 0 };
    cityMap[c.city].total++;
    if (c.status === "resolved") cityMap[c.city].resolved++;
  });
  const cities = Object.entries(cityMap)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 6);

  const resolutionRate = stats?.total > 0
    ? Math.round(((stats.resolved ?? 0) / stats.total) * 100) : 0;
  const escalationRate = stats?.total > 0
    ? Math.round(((stats.rejected ?? 0) / stats.total) * 100) : 0;
  const topCity     = cities[0]?.[0] ?? "—";

  // AI stats derived values
  const aiCoverage = total > 0 && aiStats
    ? Math.round((aiStats.total_classified / total) * 100) : 0;
  const autoRate = aiStats?.total_classified > 0
    ? Math.round((aiStats.auto_classified / aiStats.total_classified) * 100) : 0;

  return (
    <div className="space-y-6">

      {/* ── KPI strip ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Complaints",  value: total,               color: "text-blue-700",   bg: "bg-blue-50",   icon: Globe       },
          { label: "Resolution Rate",   value: `${resolutionRate}%`,color: "text-emerald-700",bg: "bg-emerald-50",icon: CheckCircle },
          { label: "Escalation Rate",   value: `${escalationRate}%`,color: "text-red-600",    bg: "bg-red-50",    icon: Flag        },
          { label: "Top City",          value: topCity,             color: "text-violet-700", bg: "bg-violet-50", icon: MapPin      },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5
                                      hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* ── AI Intelligence Panel ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-blue-50
                        flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
              <Brain size={15} className="text-violet-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">AI Classification Intelligence</p>
              <p className="text-[10px] text-slate-500">Powered by NagarSetu MobileNetV3 Model</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
            {aiCoverage}% Coverage
          </span>
        </div>

        <div className="p-6">

          {/* AI KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "AI Classified",
                value: aiStats?.total_classified ?? 0,
                sub:   `of ${total} complaints`,
                icon:  Brain,
                color: "text-violet-700",
                bg:    "bg-violet-50",
              },
              {
                label: "Auto-Classified",
                value: aiStats?.auto_classified ?? 0,
                sub:   `${autoRate}% success rate`,
                icon:  ShieldCheck,
                color: "text-emerald-700",
                bg:    "bg-emerald-50",
              },
              {
                label: "Needs Review",
                value: aiStats?.needs_review ?? 0,
                sub:   "Low confidence",
                icon:  AlertTriangle,
                color: "text-amber-700",
                bg:    "bg-amber-50",
              },
              {
                label: "High Severity",
                value: aiStats?.high_severity ?? 0,
                sub:   "Score ≥ 0.75",
                icon:  Zap,
                color: "text-red-600",
                bg:    "bg-red-50",
              },
            ].map(({ label, value, sub, icon: Icon, color, bg }) => (
              <div key={label} className={`rounded-xl border border-slate-100 p-4 ${bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={13} className={color} />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
                </div>
                <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Confidence gauge + Label distribution */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Avg confidence gauge */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Average Model Confidence
              </p>
              <div className="flex items-center gap-6">
                <ConfidenceGauge value={aiStats?.avg_confidence ?? 0} />
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Avg Confidence</span>
                    <span className="text-xs font-bold text-slate-800">
                      {Math.round((aiStats?.avg_confidence ?? 0) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Avg Severity</span>
                    <span className="text-xs font-bold text-slate-800">
                      {(aiStats?.avg_severity ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Threshold</span>
                    <span className="text-xs font-bold text-slate-400">70% (auto-classify)</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${
                        (aiStats?.avg_confidence ?? 0) >= 0.70 ? "bg-emerald-500" : "bg-amber-500"
                      }`} />
                      <p className="text-[10px] text-slate-500">
                        {(aiStats?.avg_confidence ?? 0) >= 0.70
                          ? "Model performing well — most complaints auto-classified"
                          : "Consider retraining with more diverse images"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Label distribution */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                AI Detected Categories
              </p>
              <AILabelBars labelCounts={aiStats?.label_counts ?? {}} />
            </div>
          </div>

          {/* Auto vs Review donut */}
          {aiStats?.total_classified > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Classification Outcome
              </p>
              <div className="flex items-center gap-6">
                <PieChart
                  slices={[
                    { pct: autoRate,       hex: "#10b981" },
                    { pct: 100 - autoRate, hex: "#f59e0b" },
                  ]}
                  size={120}
                  centerLabel={`${autoRate}%`}
                  centerSub="AUTO"
                />
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm text-slate-700">Auto-classified</span>
                    <span className="text-sm font-bold text-slate-900 ml-auto">
                      {aiStats.auto_classified}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-sm text-slate-700">Needs review</span>
                    <span className="text-sm font-bold text-slate-900 ml-auto">
                      {aiStats.needs_review}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                    Complaints with confidence &lt; 70% are flagged for admin review
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Category donut + Status donut ───────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Complaints by Category
          </p>
          <p className="text-sm font-bold text-slate-900 mb-5">What are people reporting?</p>
          {categorySlices.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">No data yet.</p>
          ) : (
            <div className="flex items-center gap-6 flex-wrap">
              <div className="shrink-0">
                <PieChart slices={categorySlices} size={180}
                  centerLabel={categorySlices.length} centerSub="CATEGORIES" />
              </div>
              <div className="flex-1 space-y-2.5 min-w-0">
                {categorySlices.map(({ label, count, pct, hex, text, light }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: hex }} />
                    <span className="text-xs text-slate-600 flex-1 truncate font-medium">{label}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${light} ${text}`}>
                      {count}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 w-8 text-right">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Complaints by Status
          </p>
          <p className="text-sm font-bold text-slate-900 mb-5">Resolution pipeline</p>
          {statusSlices.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-12">No data yet.</p>
          ) : (
            <div className="flex items-center gap-6 flex-wrap">
              <div className="shrink-0">
                <PieChart slices={statusSlices} size={180}
                  centerLabel={`${resolutionRate}%`} centerSub="RESOLVED" />
              </div>
              <div className="flex-1 space-y-2.5 min-w-0">
                {statusSlices.map(({ key, label, count, pct, hex, text, light }) => (
                  <div key={key} className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: hex }} />
                    <span className="text-xs text-slate-600 flex-1 truncate font-medium">{label}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${light} ${text}`}>
                      {count}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 w-8 text-right">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Department performance ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
          Department Performance
        </p>
        <p className="text-sm font-bold text-slate-900 mb-5">Resolution rate per department</p>
        {departments.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No department data yet.</p>
        ) : (
          <div className="space-y-5">
            {departments.map((dep) => {
              const rate = dep.assigned > 0
                ? Math.round((dep.resolved / dep.assigned) * 100) : 0;
              const { hex, bg } = DEPT_COLORS[dep.name] ?? DEFAULT_DEPT;
              const rateColor =
                rate >= 80 ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
                rate >= 50 ? "text-amber-700 bg-amber-50 border-amber-200" :
                             "text-red-600 bg-red-50 border-red-200";
              return (
                <div key={dep.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${bg}`} />
                      <span className="text-sm font-semibold text-slate-800">{dep.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">
                        {dep.resolved} / {dep.assigned} resolved
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${rateColor}`}>
                        {rate}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${rate}%`, background: hex }} />
                  </div>
                  <div className="flex gap-2 mt-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                      {dep.pending} pending
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {dep.resolved} done
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Priority distribution ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
          Priority Distribution
        </p>
        <p className="text-sm font-bold text-slate-900 mb-5">How urgent are the complaints?</p>
        <div className="space-y-4">
          <HBar label="High Priority"   value={priorityMap.High}   max={maxPriority} color="#ef4444"
            sublabel={`${total > 0 ? Math.round((priorityMap.High   / total) * 100) : 0}% of all complaints`} />
          <HBar label="Medium Priority" value={priorityMap.Medium} max={maxPriority} color="#f59e0b"
            sublabel={`${total > 0 ? Math.round((priorityMap.Medium / total) * 100) : 0}% of all complaints`} />
          <HBar label="Low Priority"    value={priorityMap.Low}    max={maxPriority} color="#94a3b8"
            sublabel={`${total > 0 ? Math.round((priorityMap.Low    / total) * 100) : 0}% of all complaints`} />
        </div>
      </div>

      {/* ── City breakdown ──────────────────────────────────────────────────── */}
      {cities.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Complaints by City
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map(([city, data], i) => {
              const cityRate = data.total > 0
                ? Math.round((data.resolved / data.total) * 100) : 0;
              return (
                <div key={city}
                  className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-5
                              ${CITY_ACCENTS[i % CITY_ACCENTS.length]}
                              hover:shadow-md hover:-translate-y-1 transition-all duration-300`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <MapPin size={11} className="text-slate-400" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{city}</p>
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900">{data.total}</p>
                  <p className="text-xs text-slate-400 mt-0.5 mb-3">
                    {data.resolved} resolved · {data.total - data.resolved} open
                  </p>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                      style={{ width: `${cityRate}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{cityRate}% resolved</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

export default Analytics;