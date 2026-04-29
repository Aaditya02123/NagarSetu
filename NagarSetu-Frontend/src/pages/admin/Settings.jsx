// src/pages/admin/Settings.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser, getUser } from "/src/api";

function Toggle({ on, set }) {
  return (
    <button onClick={() => set(!on)}
      className={`w-11 h-6 rounded-full transition-all duration-300 relative shrink-0 ${on ? "bg-blue-600" : "bg-slate-200"}`}>
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${on ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

function Settings() {
  const navigate = useNavigate();
  const user = getUser();

  const [emailNotifs,  setEmailNotifs]  = useState(true);
  const [autoEscalate, setAutoEscalate] = useState(true);
  const [escalateHrs,  setEscalateHrs]  = useState("48");

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
    : "A";

  const fullName = user
    ? `${user.first_name} ${user.last_name}`
    : "Super Admin";

  return (
    <div className="max-w-2xl space-y-4">

      {/* Preference toggles */}
      {[
        {
          title:   "Email Notifications",
          desc:    "Send alerts when complaints are escalated or resolved.",
          control: <Toggle on={emailNotifs} set={setEmailNotifs} />,
        },
        {
          title:   "Auto-Escalation",
          desc:    "Escalate complaints that receive no action after a set period.",
          control: <Toggle on={autoEscalate} set={setAutoEscalate} />,
        },
        {
          title:   "Escalation Threshold",
          desc:    "Hours of inactivity before a complaint gets escalated.",
          control: (
            <select value={escalateHrs} onChange={(e) => setEscalateHrs(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-white
                         text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
              {["24", "48", "72"].map((h) => (
                <option key={h} value={h}>{h} hours</option>
              ))}
            </select>
          ),
        },
      ].map(({ title, desc, control }) => (
        <div key={title}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5
                     flex items-center justify-between gap-6">
          <div>
            <p className="text-sm font-bold text-slate-900">{title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
          </div>
          {control}
        </div>
      ))}

      {/* Admin profile — real data from localStorage */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p className="text-sm font-bold text-slate-900 mb-4">Admin Profile</p>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-800 flex items-center justify-center shadow-md shadow-blue-900/20">
            <span className="text-white font-bold text-lg">{initials}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{fullName}</p>
            <p className="text-xs text-slate-400">{user?.email ?? "admin@nagarsetu.in"}</p>
          </div>
        </div>
      </div>

      {/* Danger zone — logout */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
        <p className="text-sm font-bold text-slate-900 mb-1">Danger Zone</p>
        <p className="text-xs text-slate-400 mb-4">
          Logging out will clear your session. You will need to sign in again.
        </p>
        <button onClick={handleLogout}
          className="text-sm font-semibold px-5 py-2.5 bg-red-600 hover:bg-red-700
                     text-white rounded-xl transition-colors duration-200">
          Log out of Admin Panel
        </button>
      </div>

    </div>
  );
}

export default Settings;