// src/components/admin/Topbar.jsx
import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { NAV, ACTIVITY_COLORS } from "./adminConstants";
import { getUser } from "../../api";
import api from "../../api";

function Topbar({ section, pendingCount }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [activity,  setActivity]  = useState([]);

  const user     = getUser();
  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
    : "A";
  const fullName = user ? `${user.first_name} ${user.last_name}` : "Super Admin";
  const email    = user?.email ?? "admin@nagarsetu.in";

  const label = NAV.find((n) => n.id === section)?.label ?? "";

  // Fetch activity when bell is opened
  useEffect(() => {
    if (!notifOpen) return;
    api.get("/admin/activity")
      .then(setActivity)
      .catch(console.error);
  }, [notifOpen]);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
      <div>
        <h1 className="text-base font-bold text-slate-900">{label}</h1>
        <p className="text-[11px] text-slate-400 hidden sm:block">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="flex items-center gap-3">

        {/* Live badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-emerald-700">Live</span>
        </div>

        {/* Bell — fetches real activity on open */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center
                       text-slate-500 hover:text-blue-700 hover:border-blue-200 transition-all relative"
          >
            <Bell size={15} />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">Recent Activity</p>
                <button
                  className="text-xs text-blue-600 font-semibold hover:underline"
                  onClick={() => setNotifOpen(false)}
                >
                  Close
                </button>
              </div>
              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {activity.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No recent activity.</p>
                ) : (
                  activity.map((a, i) => (
                    <div key={i} className="px-4 py-3 hover:bg-slate-50 transition cursor-pointer">
                      <div className="flex items-start gap-2.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 mt-0.5 ${ACTIVITY_COLORS[a.type] ?? ACTIVITY_COLORS.update}`}>
                          {a.complaint_ref}
                        </span>
                        <div>
                          <p className="text-xs text-slate-700">{a.action}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{a.time_ago}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar — real user data */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-100">
          <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-slate-800 leading-none">{fullName}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;