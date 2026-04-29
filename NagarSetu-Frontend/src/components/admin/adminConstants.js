// src/components/admin/adminConstants.js
import {
  CheckCircle, Clock, AlertCircle, XCircle,
  LayoutDashboard, Inbox, Building2, BarChart2, Settings,
} from "lucide-react";

export const STATUS = {
  resolved:   { label: "Resolved",    bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", icon: CheckCircle },
  inprogress: { label: "In Progress", bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500",    icon: Clock       },
  pending:    { label: "Pending",     bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-400",   icon: AlertCircle },
  rejected:   { label: "Rejected",    bg: "bg-red-100",     text: "text-red-600",     dot: "bg-red-400",     icon: XCircle     },
};

export const PRIORITY_COLOR = {
  High:   "text-red-600 bg-red-50 border border-red-200",
  Medium: "text-amber-600 bg-amber-50 border border-amber-200",
  Low:    "text-slate-500 bg-slate-50 border border-slate-200",
};

export const ACTIVITY_COLORS = {
  update:   "bg-blue-100 text-blue-700",
  resolve:  "bg-emerald-100 text-emerald-700",
  assign:   "bg-violet-100 text-violet-700",
  new:      "bg-amber-100 text-amber-700",
  escalate: "bg-red-100 text-red-600",
  reject:   "bg-red-100 text-red-600",
};

export const NAV = [
  { id: "overview",    label: "Overview",    icon: LayoutDashboard },
  { id: "complaints",  label: "Complaints",  icon: Inbox           },
  { id: "departments", label: "Departments", icon: Building2       },
  { id: "analytics",   label: "Analytics",   icon: BarChart2       },
  { id: "settings",    label: "Settings",    icon: Settings        },
];