// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import Sidebar     from "../../components/admin/Sidebar";
import Topbar      from "../../components/admin/Topbar";
import Overview    from "./Overview";
import Complaints  from "./Complaints";
import Departments from "./Departments";
import Analytics   from "./Analytics";
import Settings    from "./Settings";
import api from "/src/api";

function AdminDashboard() {
  const [section,      setSection]      = useState("overview");
  const [collapsed,    setCollapsed]    = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const pad = collapsed ? "ml-16" : "ml-56";

  // Fetch real pending count for the bell badge
  useEffect(() => {
    api.get("/admin/stats")
      .then((data) => setPendingCount(data.pending ?? 0))
      .catch(console.error);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        active={section}
        setActive={setSection}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${pad} min-w-0`}>
        <Topbar
          section={section}
          pendingCount={pendingCount}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          {section === "overview"    && <Overview />}
          {section === "complaints"  && <Complaints />}
          {section === "departments" && <Departments />}
          {section === "analytics"   && <Analytics />}
          {section === "settings"    && <Settings />}
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;