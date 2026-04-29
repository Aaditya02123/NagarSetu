// src/pages/admin/Complaints.jsx
import React, { useState, useEffect } from "react";
import {
  Search, MapPin, Tag, Users, Calendar,
  ChevronDown, ChevronUp, Building2, Brain,
  AlertTriangle, CheckCircle, ShieldAlert
} from "lucide-react";
import { STATUS, PRIORITY_COLOR } from "../../components/admin/adminConstants";
import api from "../../api";

const DEPARTMENTS = [
  "PWD Department",
  "Municipal Corporation",
  "Electricity Dept",
  "Traffic Police",
  "NHAI",
];

// ── AI Confidence Bar ─────────────────────────────────────────────────────────

function ConfidenceBar({ value }) {
  const pct     = Math.round((value ?? 0) * 100);
  const color   = pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-400";
  const textCol = pct >= 70 ? "text-emerald-700" : pct >= 50 ? "text-amber-700" : "text-red-600";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-[10px] font-bold tabular-nums ${textCol}`}>{pct}%</span>
    </div>
  );
}

// ── AI Panel (shown inside expanded complaint) ────────────────────────────────

function AIPanel({ c }) {
  // Don't render if no AI data at all
  if (!c.ai_label && c.ai_confidence == null) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Brain size={11} className="text-slate-400" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            AI Classification
          </p>
        </div>
        <p className="text-[10px] text-slate-400 italic">
          Not available — complaint submitted before AI integration.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-3 space-y-2.5
      ${c.needs_review
        ? "border-amber-200 bg-amber-50/60"
        : "border-emerald-200 bg-emerald-50/40"
      }`}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Brain size={11} className={c.needs_review ? "text-amber-600" : "text-emerald-600"} />
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            AI Classification
          </p>
        </div>
        {c.needs_review ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold
                           px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
            <AlertTriangle size={8} /> Needs Review
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold
                           px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCircle size={8} /> Auto-Classified
          </span>
        )}
      </div>

      {/* Grid of AI fields */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">

        {/* AI Label */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
            AI Detected
          </p>
          <span className="text-[10px] font-bold text-slate-800 bg-white border border-slate-200
                           px-2 py-0.5 rounded-md">
            {c.ai_label ?? "—"}
          </span>
        </div>

        {/* Severity */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
            Severity Score
          </p>
          <span className={`text-[10px] font-bold
            ${(c.ai_severity ?? 0) >= 0.75
              ? "text-red-600"
              : (c.ai_severity ?? 0) >= 0.45
              ? "text-amber-600"
              : "text-slate-500"
            }`}>
            {c.ai_severity != null ? c.ai_severity.toFixed(2) : "—"}
          </span>
        </div>

        {/* Confidence bar — full width */}
        <div className="col-span-2">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Confidence
          </p>
          <ConfidenceBar value={c.ai_confidence} />
        </div>
      </div>

      {/* Warning message for low confidence */}
      {c.needs_review && (
        <div className="flex items-start gap-1.5 pt-1 border-t border-amber-200">
          <ShieldAlert size={10} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-[10px] text-amber-700 leading-relaxed">
            AI confidence was below 70%. The category and department may need
            manual correction before resolving this complaint.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Complaint Row ─────────────────────────────────────────────────────────────

function ComplaintRow({ c, onUpdate }) {
  const [open,   setOpen]   = useState(false);
  const [status, setStatus] = useState(c.status);
  const [saving, setSaving] = useState(false);
  const s    = STATUS[status] ?? STATUS.pending;
  const Icon = s.icon;

  const citizenName = c.citizen
    ? `${c.citizen.first_name} ${c.citizen.last_name}`
    : "Unknown";

  const handleStatusChange = async (newStatus) => {
    setSaving(true);
    try {
      await api.patch(`/admin/complaints/${c.complaint_ref}`, { status: newStatus });
      setStatus(newStatus);
      onUpdate(c.complaint_ref, newStatus);
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleReassign = async (dept) => {
    try {
      await api.patch(`/admin/complaints/${c.complaint_ref}`, { assigned_to: dept });
      onUpdate(c.complaint_ref, status, dept);
    } catch (err) {
      console.error("Failed to reassign:", err);
    }
  };

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden
                     hover:shadow-md transition-all duration-300
                     ${c.needs_review
                       ? "border-amber-200 hover:border-amber-300"
                       : "border-slate-100 hover:border-blue-100"
                     }`}>

      <div className="px-5 py-4">
        <div className="flex items-center gap-4">
          <div className={`w-1.5 h-10 rounded-full shrink-0 ${s.dot}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                {c.complaint_ref}
              </span>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                <Icon size={9} />{s.label}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${PRIORITY_COLOR[c.priority] ?? PRIORITY_COLOR.Medium}`}>
                {c.priority}
              </span>

              {/* AI badge — shown inline on the row */}
              {c.ai_label && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold
                                  px-2 py-0.5 rounded-full border
                                  ${c.needs_review
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-violet-50 text-violet-700 border-violet-200"
                                  }`}>
                  <Brain size={8} />
                  {c.needs_review ? "Review" : `AI: ${c.ai_label}`}
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-slate-900 truncate">{c.title}</p>
            <div className="flex flex-wrap gap-x-3 mt-1">
              {c.location && (
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <MapPin size={9} />{c.location}
                </span>
              )}
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Tag size={9} />{c.category}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Users size={9} />{citizenName}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Calendar size={9} />
                {new Date(c.created_at).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={status}
              disabled={saving}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white
                         text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500
                         transition disabled:opacity-50"
            >
              {Object.entries(STATUS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <button
              onClick={() => setOpen(!open)}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center
                         text-slate-400 hover:text-blue-700 hover:border-blue-300 transition-all"
            >
              {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-4 bg-slate-50/50">
          <div className="grid sm:grid-cols-2 gap-5">

            {/* Left — description + image */}
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Description
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">{c.description}</p>
                {c.image_url && (
                  <img src={c.image_url} alt="complaint"
                    className="mt-3 w-full max-h-40 object-cover rounded-xl border border-slate-200" />
                )}
              </div>

              {/* AI Panel sits below image on left column */}
              <AIPanel c={c} />
            </div>

            {/* Right — assignment */}
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Assigned to
                </p>
                <div className="flex items-center gap-2">
                  <Building2 size={13} className="text-blue-600" />
                  <span className="text-sm font-semibold text-slate-800">
                    {c.assigned_to || "Not assigned yet"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Reassign department
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {DEPARTMENTS.map((dept) => (
                    <button key={dept}
                      onClick={() => handleReassign(dept)}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all
                        ${c.assigned_to === dept
                          ? "bg-blue-700 text-white border-blue-700"
                          : "bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-700"
                        }`}>
                      {dept}
                    </button>
                  ))}
                </div>
              </div>
              {c.reject_reason && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">
                    Rejection reason
                  </p>
                  <p className="text-sm text-red-600">{c.reject_reason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Complaints Page ───────────────────────────────────────────────────────────

function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filterSt,   setFilterSt]   = useState("all");
  const [filterCt,   setFilterCt]   = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [filterReview, setFilterReview] = useState("all");   // ← new: filter by needs_review

  useEffect(() => {
    api.get("/admin/complaints")
      .then((data) => setComplaints(data.items ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = (ref, newStatus, newDept) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.complaint_ref === ref
          ? { ...c, status: newStatus ?? c.status, assigned_to: newDept ?? c.assigned_to }
          : c
      )
    );
  };

  const cats   = ["all", ...new Set(complaints.map((c) => c.category))];
  const cities = ["all", ...new Set(complaints.map((c) => c.city).filter(Boolean))];

  // Count how many need review — shown in filter label
  const needsReviewCount = complaints.filter((c) => c.needs_review).length;

  const filtered = complaints.filter((c) => {
    const q = search.toLowerCase();
    const citizenName = c.citizen
      ? `${c.citizen.first_name} ${c.citizen.last_name}`.toLowerCase()
      : "";
    return (
      (c.title.toLowerCase().includes(q) ||
       c.complaint_ref.toLowerCase().includes(q) ||
       citizenName.includes(q)) &&
      (filterSt     === "all" || c.status      === filterSt) &&
      (filterCt     === "all" || c.category    === filterCt) &&
      (filterCity   === "all" || c.city        === filterCity) &&
      (filterReview === "all" || (filterReview === "review" ? c.needs_review : !c.needs_review))
    );
  });

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
    <div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-5">
        <div className="flex flex-wrap gap-3">

          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, ref, citizen..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50
                         text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2
                         focus:ring-blue-500 transition"
            />
          </div>

          {/* Status filter */}
          <select
            value={filterSt}
            onChange={(e) => setFilterSt(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-700
                       appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="all">All statuses</option>
            {Object.entries(STATUS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={filterCt}
            onChange={(e) => setFilterCt(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-700
                       appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            {cats.map((c) => (
              <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>
            ))}
          </select>

          {/* City filter */}
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-700
                       appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            {cities.map((c) => (
              <option key={c} value={c}>{c === "all" ? "All cities" : c}</option>
            ))}
          </select>

          {/* AI Review filter — new */}
          <select
            value={filterReview}
            onChange={(e) => setFilterReview(e.target.value)}
            className={`px-3 py-2.5 text-sm rounded-xl border bg-white
                        appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition
                        ${filterReview === "review"
                          ? "border-amber-300 text-amber-700 font-semibold"
                          : "border-slate-200 text-slate-700"
                        }`}
          >
            <option value="all">All AI status</option>
            <option value="review">⚠️ Needs Review ({needsReviewCount})</option>
            <option value="ok">✅ Auto-classified</option>
          </select>
        </div>

        <p className="text-xs text-slate-400 mt-3 font-medium">
          Showing <span className="font-bold text-slate-700">{filtered.length}</span> of {complaints.length} complaints
          {needsReviewCount > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 text-amber-600 font-semibold">
              <AlertTriangle size={10} />
              {needsReviewCount} need review
            </span>
          )}
        </p>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <Search size={28} className="mx-auto mb-3 opacity-20" />
            <p className="font-semibold text-sm">No complaints match your filters.</p>
          </div>
        ) : (
          filtered.map((c) => (
            <ComplaintRow
              key={c.complaint_ref}
              c={c}
              onUpdate={handleUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Complaints;