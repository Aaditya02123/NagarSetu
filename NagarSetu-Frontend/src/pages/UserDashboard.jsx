import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Search, Filter, CheckCircle, Clock, AlertCircle, XCircle,
  ChevronDown, ChevronUp, MapPin, Tag, Calendar,
} from "lucide-react";
import api from "/src/api";   // ← real API

const STATUS = {
  resolved:   { label:"Resolved",    bg:"bg-green-100",  text:"text-green-700",  dot:"bg-green-500",  icon:CheckCircle, step:3  },
  inprogress: { label:"In Progress", bg:"bg-blue-100",   text:"text-blue-700",   dot:"bg-blue-500",   icon:Clock,       step:2  },
  pending:    { label:"Pending",     bg:"bg-amber-100",  text:"text-amber-700",  dot:"bg-amber-400",  icon:AlertCircle, step:1  },
  rejected:   { label:"Rejected",    bg:"bg-red-100",    text:"text-red-700",    dot:"bg-red-400",    icon:XCircle,     step:-1 },
};

const TIMELINE_STEPS = ["Submitted", "Under Review", "In Progress", "Resolved"];

function StatusTimeline({ complaint }) {
  if (complaint.status === "rejected") {
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
        <p className="text-sm font-semibold text-red-700 mb-1">Complaint Rejected</p>
        <p className="text-sm text-red-600">{complaint.reject_reason || "No reason provided."}</p>
      </div>
    );
  }

  const stepsDone = { pending:1, inprogress:3, resolved:4, rejected:2 };
  const doneTo    = stepsDone[complaint.status] ?? 1;

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Progress</p>
      <div className="flex items-center gap-0">
        {TIMELINE_STEPS.map((step, i) => {
          const done = i < doneTo;
          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center min-w-0 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                  ${done ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-300"}`}>
                  {done
                    ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : i + 1}
                </div>
                <p className={`text-xs mt-1.5 text-center font-medium leading-tight ${done ? "text-blue-600" : "text-slate-400"}`}>{step}</p>
              </div>
              {i < TIMELINE_STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 mt-[-18px] ${done && i + 1 < doneTo ? "bg-blue-600" : "bg-slate-200"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

function ComplaintCard({ complaint }) {
  const [expanded, setExpanded] = useState(false);
  const s = STATUS[complaint.status] ?? STATUS.pending;
  const StatusIcon = s.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{complaint.complaint_ref}</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
                <StatusIcon size={11} />{s.label}
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 leading-snug mb-2">{complaint.title}</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <span className="flex items-center gap-1 text-xs text-slate-500"><Tag size={11}/>{complaint.category}</span>
              {complaint.location && <span className="flex items-center gap-1 text-xs text-slate-500"><MapPin size={11}/>{complaint.location}</span>}
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar size={11}/>Filed {new Date(complaint.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}
              </span>
            </div>
          </div>
          <button onClick={() => setExpanded(!expanded)}
            className="shrink-0 w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center
                       text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-all">
            {expanded ? <ChevronUp size={15}/> : <ChevronDown size={15}/>}
          </button>
        </div>

        {complaint.status !== "rejected" && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${{ pending:25, inprogress:75, resolved:100, rejected:50 }[complaint.status] ?? 25}%` }} />
            </div>
            <span className="text-xs text-slate-400 shrink-0">
              {{ pending:"1/4", inprogress:"3/4", resolved:"4/4", rejected:"2/4" }[complaint.status]}
            </span>
          </div>
        )}
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-4 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Description</p>
            <p className="text-sm text-slate-600 leading-relaxed">{complaint.description}</p>
          </div>
          {complaint.image_url && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Submitted photo</p>
              <img src={complaint.image_url} alt="Complaint" className="w-full max-h-48 object-cover rounded-xl border border-slate-100" />
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Assigned to</span>
            <span className="font-semibold text-slate-800">{complaint.assigned_to || "Not assigned yet"}</span>
          </div>
          <StatusTimeline complaint={complaint} />
        </div>
      )}
    </div>
  );
}

const SUMMARY_CONFIG = [
  { label:"Total Filed",  key:"total",      color:"text-slate-700",  bg:"bg-slate-100" },
  { label:"Pending",      key:"pending",    color:"text-amber-700",  bg:"bg-amber-100" },
  { label:"In Progress",  key:"inprogress", color:"text-blue-700",   bg:"bg-blue-100"  },
  { label:"Resolved",     key:"resolved",   color:"text-green-700",  bg:"bg-green-100" },
];

function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [search,     setSearch]     = useState("");
  const [filterSt,   setFilterSt]   = useState("all");
  const [filterCt,   setFilterCt]   = useState("all");

  useEffect(() => {
    api.get("/complaints/mine")
      .then(setComplaints)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["all", ...new Set(complaints.map(c => c.category))];

  const filtered = complaints.filter(c => {
    const q = search.toLowerCase();
    return (
      (c.title.toLowerCase().includes(q) || c.complaint_ref.toLowerCase().includes(q) || (c.location || "").toLowerCase().includes(q))
      && (filterSt === "all" || c.status   === filterSt)
      && (filterCt === "all" || c.category === filterCt)
    );
  });

  const summary = {
    total:      complaints.length,
    pending:    complaints.filter(c => c.status === "pending").length,
    inprogress: complaints.filter(c => c.status === "inprogress").length,
    resolved:   complaints.filter(c => c.status === "resolved").length,
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">

          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">My complaints</span>
            <h1 className="text-3xl font-bold text-slate-900 mt-1">Status Dashboard</h1>
            <p className="text-slate-500 mt-1 text-sm">Track every complaint you filed — from submission to resolution.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {SUMMARY_CONFIG.map(({ label, key, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
                <p className={`text-3xl font-extrabold ${color}`}>{summary[key]}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-3 text-slate-400"/>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, ID or location..."
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900
                           placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"/>
            </div>
            <div className="relative">
              <Filter size={14} className="absolute left-3 top-3 text-slate-400 pointer-events-none"/>
              <select value={filterSt} onChange={(e) => setFilterSt(e.target.value)}
                className="pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                <option value="all">All statuses</option>
                {Object.entries(STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <select value={filterCt} onChange={(e) => setFilterCt(e.target.value)}
              className="px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
              {categories.map(c => <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>)}
            </select>
          </div>

          {loading && (
            <div className="text-center py-20 text-slate-400">
              <svg className="animate-spin w-8 h-8 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20"/>
              </svg>
              <p className="text-sm">Loading your complaints...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-red-500 font-semibold">{error}</p>
              <p className="text-slate-400 text-sm mt-1">Please make sure you are logged in.</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <p className="text-xs text-slate-400 mb-4 font-medium">
                Showing {filtered.length} of {complaints.length} complaints
              </p>
              {filtered.length === 0
                ? <div className="text-center py-20 text-slate-400">
                    <Search size={32} className="mx-auto mb-3 opacity-30"/>
                    <p className="font-medium">No complaints match your search.</p>
                    <p className="text-sm mt-1">Try adjusting the filters above.</p>
                  </div>
                : <div className="space-y-4">
                    {filtered.map(c => <ComplaintCard key={c.id} complaint={c}/>)}
                  </div>
              }
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Dashboard;