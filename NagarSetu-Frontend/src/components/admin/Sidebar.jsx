// src/components/admin/Sidebar.jsx
import React from "react";
import { Shield, ArrowLeft, ChevronRight, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NAV } from "./adminConstants";
import { logoutUser } from "../../api";

function Sidebar({ active, setActive, collapsed, setCollapsed }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen z-40 flex flex-col bg-[#0F172A] transition-all duration-300 ${collapsed ? "w-16" : "w-56"}`}>

      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/[0.06] ${collapsed ? "justify-center" : ""}`}>
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/50">
          <Shield size={15} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-white leading-none">NagarSetu</p>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ id, label, icon: Icon }) => {
          const on = active === id;
          return (
            <button key={id} onClick={() => setActive(id)} title={collapsed ? label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                          transition-all duration-200 group relative
                          ${collapsed ? "justify-center" : ""}
                          ${on
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                            : "text-slate-400 hover:text-white hover:bg-white/[0.07]"
                          }`}
            >
              <Icon size={16} className={`shrink-0 transition-colors ${on ? "text-white" : "text-slate-500 group-hover:text-white"}`} />
              {!collapsed && <span className="flex-1 text-left">{label}</span>}
              {!collapsed && on && <span className="w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-lg
                                opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity
                                whitespace-nowrap shadow-xl border border-white/10 z-50">
                  {label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 border-t border-white/[0.06] pt-3 space-y-0.5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400
                      hover:text-white hover:bg-white/[0.07] transition-all text-sm font-medium
                      ${collapsed ? "justify-center" : ""}`}>
          {collapsed ? <ChevronRight size={16} /> : <><ArrowLeft size={16} /><span>Collapse</span></>}
        </button>
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400
                      hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium
                      ${collapsed ? "justify-center" : ""}`}>
          <LogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;