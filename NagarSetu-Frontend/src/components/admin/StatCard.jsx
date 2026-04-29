// src/components/admin/StatCard.jsx
import React from "react";
import { ArrowUpRight } from "lucide-react";
import { useCountUp } from "./adminHooks";

function StatCard({ icon: Icon, label, value, sub, color, bgColor, border, delay }) {
  const count = useCountUp(value, value > 0);
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${border}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor}`}>
          <Icon size={18} className={color} />
        </div>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
          <ArrowUpRight size={9} /> LIVE
        </span>
      </div>
      <p className={`text-3xl font-extrabold tabular-nums ${color}`}>{count}</p>
      <p className="text-sm font-semibold text-slate-700 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default StatCard;