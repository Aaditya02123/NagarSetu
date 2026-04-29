// src/pages/admin/Departments.jsx
import React, { useState, useEffect } from "react";
import { Building2, TrendingUp, AlertTriangle, CheckCircle2, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import api from "/src/api.js";

const DEPT_COLORS = {
  "PWD Department":        { color: "bg-blue-500",    ring: "ring-blue-200",    text: "text-blue-700",    light: "bg-blue-50"    },
  "Municipal Corporation": { color: "bg-emerald-500", ring: "ring-emerald-200", text: "text-emerald-700", light: "bg-emerald-50" },
  "Electricity Dept":      { color: "bg-amber-500",   ring: "ring-amber-200",   text: "text-amber-700",   light: "bg-amber-50"   },
  "Traffic Police":        { color: "bg-violet-500",  ring: "ring-violet-200",  text: "text-violet-700",  light: "bg-violet-50"  },
  "NHAI":                  { color: "bg-red-500",     ring: "ring-red-200",     text: "text-red-700",     light: "bg-red-50"     },
};

const DEFAULT_COLOR = { color: "bg-slate-500", ring: "ring-slate-200", text: "text-slate-700", light: "bg-slate-50" };

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    api.get("/admin/departments")
      .then(setDepartments)
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

  if (departments.length === 0) {
    return (
      <div className="text-center py-32 text-slate-400">
        <Building2 size={32} className="mx-auto mb-3 opacity-20" />
        <p className="font-semibold text-sm">No department data yet.</p>
        <p className="text-xs mt-1">Departments appear once complaints are assigned.</p>
      </div>
    );
  }

  // ── Derived metrics ──────────────────────────────────────────────────────
  const ranked = [...departments]
    .map((d) => ({ ...d, rate: d.assigned > 0 ? Math.round((d.resolved / d.assigned) * 100) : 0 }))
    .sort((a, b) => b.rate - a.rate);

  const totalAssigned = departments.reduce((s, d) => s + d.assigned, 0);
  const totalResolved = departments.reduce((s, d) => s + d.resolved, 0);
  const totalPending  = departments.reduce((s, d) => s + d.pending,  0);
  const overallRate   = totalAssigned > 0 ? Math.round((totalResolved / totalAssigned) * 100) : 0;

  const best        = ranked[0];
  const mostBacklog = [...departments].sort((a, b) => b.pending - a.pending)[0];

  return (
    <div className="space-y-6">

      {/* ── Department cards ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dep, i) => {
          const pct = dep.assigned > 0 ? Math.round((dep.resolved / dep.assigned) * 100) : 0;
          const { color, ring } = DEPT_COLORS[dep.name] ?? DEFAULT_COLOR;
          return (
            <motion.div
              key={dep.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5
                         hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center ring-4 ${ring}`}>
                  <Building2 size={15} className="text-white" />
                </div>
                <p className="text-sm font-bold text-slate-800">{dep.name}</p>
              </div>
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>{dep.resolved} of {dep.assigned} resolved</span>
                <span className="font-bold text-slate-700">{pct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: i * 0.08 + 0.2, ease: "easeOut" }}
                />
              </div>
              <div className="flex gap-2 mt-3">
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
                  {dep.pending} pending
                </span>
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {dep.resolved} done
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Performance table ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <p className="text-sm font-bold text-slate-900">Department Performance Table</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Department", "Assigned", "Resolved", "Pending", "Rate"].map((h) => (
                  <th key={h}
                    className={`py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400
                                ${h === "Department" ? "text-left px-6" : "text-center px-4"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {departments.map((dep) => {
                const rate = dep.assigned > 0 ? Math.round((dep.resolved / dep.assigned) * 100) : 0;
                const { color } = DEPT_COLORS[dep.name] ?? DEFAULT_COLOR;
                return (
                  <tr key={dep.name} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                        <span className="font-semibold text-slate-800">{dep.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center font-semibold text-slate-700">{dep.assigned}</td>
                    <td className="px-4 py-4 text-center font-bold text-emerald-700">{dep.resolved}</td>
                    <td className="px-4 py-4 text-center font-bold text-amber-700">{dep.pending}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg
                        ${rate >= 80 ? "bg-emerald-100 text-emerald-700"
                          : rate >= 50 ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-600"}`}>
                        {rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Resolution leaderboard ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <BarChart3 size={15} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Resolution Rate Leaderboard</p>
            <p className="text-xs text-slate-400">Ranked by complaint resolution percentage</p>
          </div>
        </div>
        <div className="space-y-4">
          {ranked.map((dep, i) => {
            const { color, text } = DEPT_COLORS[dep.name] ?? DEFAULT_COLOR;
            return (
              <motion.div
                key={dep.name}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
                className="flex items-center gap-4"
              >
                {/* Rank badge */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center
                                 text-xs font-bold shrink-0
                                 ${i === 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                  {i + 1}
                </div>

                {/* Name + bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-700 truncate">{dep.name}</span>
                    <span className={`text-xs font-bold ml-3 shrink-0 ${text}`}>{dep.rate}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${dep.rate}%` }}
                      transition={{ duration: 1, delay: i * 0.1 + 0.3, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Health badge */}
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0
                                  ${dep.rate >= 80 ? "bg-emerald-100 text-emerald-700"
                                    : dep.rate >= 50 ? "bg-amber-100 text-amber-700"
                                    : "bg-red-100 text-red-600"}`}>
                  {dep.rate >= 80 ? "Healthy" : dep.rate >= 50 ? "Fair" : "At Risk"}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Insight cards ── */}
      <div className="grid sm:grid-cols-3 gap-4">

        {/* Best performer */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp size={15} className="text-emerald-700" />
            </div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Top Performer</p>
          </div>
          <p className="text-sm font-bold text-emerald-900 mb-0.5">{best.name}</p>
          <p className="text-3xl font-extrabold text-emerald-700 tabular-nums">{best.rate}%</p>
          <p className="text-xs text-emerald-600 mt-1">
            {best.resolved} of {best.assigned} complaints resolved
          </p>
        </motion.div>

        {/* Most backlog */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertTriangle size={15} className="text-amber-700" />
            </div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Highest Backlog</p>
          </div>
          <p className="text-sm font-bold text-amber-900 mb-0.5">{mostBacklog.name}</p>
          <p className="text-3xl font-extrabold text-amber-700 tabular-nums">{mostBacklog.pending}</p>
          <p className="text-xs text-amber-600 mt-1">unresolved complaints pending action</p>
        </motion.div>

        {/* Overall rate */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.26 }}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
              <CheckCircle2 size={15} className="text-blue-700" />
            </div>
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Overall Rate</p>
          </div>
          <p className="text-sm font-bold text-blue-900 mb-0.5">All Departments</p>
          <p className="text-3xl font-extrabold text-blue-700 tabular-nums">{overallRate}%</p>
          <p className="text-xs text-blue-600 mt-1">
            {totalResolved} resolved · {totalPending} still pending
          </p>
        </motion.div>

      </div>
    </div>
  );
}

export default Departments;