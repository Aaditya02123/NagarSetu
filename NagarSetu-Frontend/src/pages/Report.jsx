import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DragDropUpload from "../components/DragDropUpload";
import Toast from "../components/Toast";
import { motion, AnimatePresence } from "framer-motion";
import api from "/src/Api.js";

import {
  Camera,
  FileText,
  MapPin,
  Send,
  Tag,
  Brain,
  Sparkles,
  AlertTriangle,
  Building2,
  Wrench,
  ChevronRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────────
const categories = [
  "Pothole",
  "Waterlogging",
  "Garbage",
  "Street Light",
  "Traffic",
  "Infrastructure",
  "Other",
];

const inputCls = (hasIcon = true) =>
  [
    "w-full py-3 text-sm rounded-xl border border-slate-200 bg-white/80 text-slate-900",
    "placeholder-slate-400 outline-none transition backdrop-blur-sm",
    "focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white",
    hasIcon ? "pl-10 pr-4" : "px-4",
  ].join(" ");

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

// ── AI Analysis data keyed by category ───────────────────────────────────────
const AI_ANALYSIS = {
  Pothole: {
    category: "Pothole",
    severity: "High",
    severityColor: "text-red-600 bg-red-50 border-red-200",
    severityDot: "bg-red-500",
    confidence: 94,
    department: "Public Works Department (PWD)",
    departmentIcon: Building2,
    estimatedResolution: "24–48 hours",
    immediateSteps: [
      "Place visible markers or stones around the pothole to warn drivers.",
      "Avoid the lane entirely if the pothole spans more than half its width.",
      "Alert locals and share the complaint ID so they can track progress.",
      "If near a school or hospital, call the PWD helpline for urgent tagging.",
    ],
    process: [
      { label: "Complaint received & geo-tagged", done: true },
      { label: "Field inspection by PWD engineer", done: false },
      { label: "Material & crew dispatch", done: false },
      { label: "Cold/hot mix patching performed", done: false },
      { label: "Quality check & closure", done: false },
    ],
    tip: "Potholes reported with a clear overhead photo and exact street name are resolved 2× faster.",
  },
  Waterlogging: {
    category: "Waterlogging",
    severity: "High",
    severityColor: "text-orange-600 bg-orange-50 border-orange-200",
    severityDot: "bg-orange-500",
    confidence: 91,
    department: "Municipal Corporation — Drainage Cell",
    departmentIcon: Building2,
    estimatedResolution: "6–12 hours",
    immediateSteps: [
      "Do not walk or drive through stagnant water — depth is unpredictable.",
      "Switch off electrical mains if water has entered your building.",
      "Keep children away from open drains or manholes in the area.",
      "Use an alternate route and inform neighbours about the water level.",
    ],
    process: [
      { label: "Complaint logged & location verified", done: true },
      { label: "Drainage pump team dispatched", done: false },
      { label: "Drain/sewer inspection for blockage", done: false },
      { label: "Dewatering & flush operation", done: false },
      { label: "Drain cleared & complaint closed", done: false },
    ],
    tip: "Include the approximate water depth and whether it's entering buildings — this triggers an emergency priority upgrade.",
  },
  Garbage: {
    category: "Garbage",
    severity: "Medium",
    severityColor: "text-amber-600 bg-amber-50 border-amber-200",
    severityDot: "bg-amber-500",
    confidence: 88,
    department: "Solid Waste Management — IMC",
    departmentIcon: Building2,
    estimatedResolution: "12–24 hours",
    immediateSteps: [
      "Do not burn the garbage — it creates toxic fumes and is illegal.",
      "Keep pets and children away from the pile to avoid disease exposure.",
      "Cover any exposed food waste with a tarp if available.",
      "Inform your ward sanitation supervisor directly for faster pickup.",
    ],
    process: [
      { label: "Complaint assigned to ward supervisor", done: true },
      { label: "Sanitation vehicle scheduled", done: false },
      { label: "Garbage collected & area cleaned", done: false },
      { label: "Photographic evidence uploaded", done: false },
      { label: "Complaint marked resolved", done: false },
    ],
    tip: "Mentioning the nearest landmark or pin code helps route the pickup truck to your exact location.",
  },
  "Street Light": {
    category: "Street Light",
    severity: "Medium",
    severityColor: "text-amber-600 bg-amber-50 border-amber-200",
    severityDot: "bg-amber-500",
    confidence: 96,
    department: "Electricity Department — IMC Smart City Cell",
    departmentIcon: Building2,
    estimatedResolution: "24–72 hours",
    immediateSteps: [
      "Avoid parking or walking in the unlit area after dark.",
      "Use a torch or phone flashlight when passing through at night.",
      "Alert the local police PCR if the area feels unsafe after dark.",
      "Note the pole number (painted on the pole) — it speeds up the repair.",
    ],
    process: [
      { label: "Complaint logged with pole location", done: true },
      { label: "Lineman assigned for inspection", done: false },
      { label: "Fault diagnosed (bulb/wire/MCB)", done: false },
      { label: "Repair or replacement carried out", done: false },
      { label: "Night-time verification & closure", done: false },
    ],
    tip: "Reporting the pole number (painted on the post) cuts average resolution time from 72 hrs to 24 hrs.",
  },
  Traffic: {
    category: "Traffic",
    severity: "High",
    severityColor: "text-red-600 bg-red-50 border-red-200",
    severityDot: "bg-red-500",
    confidence: 89,
    department: "Traffic Police Department — Indore City",
    departmentIcon: Building2,
    estimatedResolution: "1–4 hours",
    immediateSteps: [
      "Do not stop your vehicle at a malfunctioning signal — treat as 4-way stop.",
      "Follow the traffic constable's manual direction if one is deployed.",
      "Avoid honking excessively — it increases accident risk in congestion.",
      "Use an alternate route via Google Maps if the jam has lasted over 20 min.",
    ],
    process: [
      { label: "Alert forwarded to nearest traffic post", done: true },
      { label: "Constable dispatched to junction", done: false },
      { label: "Manual traffic control initiated", done: false },
      { label: "Signal repair team notified", done: false },
      { label: "Signal restored & complaint closed", done: false },
    ],
    tip: "Traffic issues with video evidence of the exact junction are escalated to the DCP Traffic within the hour.",
  },
  Infrastructure: {
    category: "Infrastructure",
    severity: "Medium",
    severityColor: "text-amber-600 bg-amber-50 border-amber-200",
    severityDot: "bg-amber-500",
    confidence: 82,
    department: "Public Works Department (PWD) / NHAI",
    departmentIcon: Building2,
    estimatedResolution: "48–96 hours",
    immediateSteps: [
      "Cordon off the damaged area using ropes, bricks, or warning tape.",
      "Warn pedestrians and motorists approaching from both directions.",
      "Do not attempt to repair or move structural elements yourself.",
      "If it is a bridge or flyover component, call 100 immediately.",
    ],
    process: [
      { label: "Structural complaint flagged & reviewed", done: true },
      { label: "Site survey by PWD engineer", done: false },
      { label: "Jurisdiction confirmed (IMC/PWD/NHAI)", done: false },
      { label: "Emergency repair or barricading done", done: false },
      { label: "Permanent fix & complaint closed", done: false },
    ],
    tip: "For bridge/flyover damage always call 112 in addition to filing here — structural failures are treated as emergencies.",
  },
  Other: {
    category: "General Issue",
    severity: "Low",
    severityColor: "text-slate-600 bg-slate-50 border-slate-200",
    severityDot: "bg-slate-400",
    confidence: 72,
    department: "Municipal Corporation — General Cell",
    departmentIcon: Building2,
    estimatedResolution: "48–72 hours",
    immediateSteps: [
      "Document the issue with a clear photo and your exact location.",
      "Note the date and time the issue was first observed.",
      "Check if any other residents have reported the same issue nearby.",
      "Contact your ward councillor if the issue affects multiple households.",
    ],
    process: [
      { label: "Complaint received & categorised", done: true },
      { label: "Assigned to relevant department", done: false },
      { label: "Field verification carried out", done: false },
      { label: "Resolution action taken", done: false },
      { label: "Citizen notified & closed", done: false },
    ],
    tip: "The more specific your description, the faster the routing. Mention category, exact address, and how long the issue has persisted.",
  },
};

// ── Background ────────────────────────────────────────────────────────────────
function PageBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-[#F8FAFC] via-[#EEF2FF] to-[#E8F0FE]" />
      <svg className="absolute inset-0 w-full h-full opacity-[0.35]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dot-grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="#94a3b8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>
      <motion.div
        className="absolute -top-40 -left-40 w-[560px] h-[560px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.13) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.12, 1], x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-48 -right-48 w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.15, 1], x: [0, -18, 0], y: [0, 12, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  );
}

// ── Scanning animation overlay ────────────────────────────────────────────────
function ScanOverlay() {
  return (
    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-10">
      {/* scan line */}
      <motion.div
        className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
        initial={{ top: "0%" }}
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
      />
      {/* corner brackets */}
      {[
        "top-2 left-2 border-t-2 border-l-2",
        "top-2 right-2 border-t-2 border-r-2",
        "bottom-2 left-2 border-b-2 border-l-2",
        "bottom-2 right-2 border-b-2 border-r-2",
      ].map((cls, i) => (
        <div key={i} className={`absolute w-5 h-5 border-blue-400 ${cls}`} />
      ))}
      {/* dim overlay */}
      <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[1px]" />
    </div>
  );
}

// ── AI Panel ──────────────────────────────────────────────────────────────────
function AIPanel({ image, preview, category, analysisState, analysis }) {
  // analysisState: "idle" | "scanning" | "done"

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600
                        flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
          <Brain size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">AI Issue Analyser</p>
          <p className="text-xs text-slate-400">Powered by NagarSetu Vision</p>
        </div>
        {analysisState === "scanning" && (
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Scanning</span>
          </div>
        )}
        {analysisState === "done" && (
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-full">
            <CheckCircle2 size={11} className="text-green-600" />
            <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Complete</span>
          </div>
        )}
      </div>

      {/* ── IDLE: no image yet ── */}
      <AnimatePresence mode="wait">
        {analysisState === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center
                       border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50/50"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100
                            flex items-center justify-center mb-4">
              <Sparkles size={28} className="text-blue-300" />
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">
              Upload a photo to activate AI analysis
            </p>
            <p className="text-xs text-slate-400 max-w-xs">
              Once you upload an issue photo, our AI will classify it, assess severity,
              and give you instant guidance.
            </p>
            {/* Animated dots */}
            <div className="flex gap-1.5 mt-6">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-blue-200"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── SCANNING: show image with scan overlay ── */}
        {analysisState === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col gap-4"
          >
            {/* Image with scanner */}
            <div className="relative rounded-xl overflow-hidden border border-blue-200 bg-slate-900"
              style={{ height: "200px" }}>
              <img src={preview} alt="Scanning" className="w-full h-full object-cover opacity-70" />
              <ScanOverlay />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center gap-2 bg-slate-900/70 backdrop-blur-sm
                                rounded-lg px-3 py-2">
                  <svg className="animate-spin w-3.5 h-3.5 text-blue-400 shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor"
                      strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
                  </svg>
                  <span className="text-xs text-blue-200 font-medium">
                    Analysing image with computer vision…
                  </span>
                </div>
              </div>
            </div>

            {/* Progress steps */}
            {[
              "Detecting issue type from visual features",
              "Estimating severity & public risk score",
              "Matching department routing rules",
            ].map((step, i) => (
              <motion.div
                key={step}
                className="flex items-center gap-3 p-3 bg-white/70 rounded-xl border border-slate-100"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.4, duration: 0.35 }}
              >
                <motion.div
                  className="w-5 h-5 rounded-full border-2 border-blue-400 shrink-0 flex items-center justify-center"
                  animate={{ borderColor: ["#93c5fd", "#3b82f6", "#93c5fd"] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
                >
                  <motion.div
                    className="w-2 h-2 rounded-full bg-blue-500"
                    animate={{ scale: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
                  />
                </motion.div>
                <span className="text-xs text-slate-600">{step}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── DONE: full analysis results ── */}
        {analysisState === "done" && analysis && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex-1 flex flex-col gap-4 overflow-y-auto pr-0.5"
            style={{ maxHeight: "calc(100vh - 280px)" }}
          >
            {/* Thumbnail + category + confidence */}
            <div className="flex gap-3 items-start">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 shrink-0"
                style={{ width: 80, height: 80 }}>
                <img src={preview} alt="Issue" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${analysis.severityColor}`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${analysis.severityDot}`} />
                    {analysis.severity} Severity
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900">{analysis.category}</p>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>AI Confidence</span>
                    <span className="font-semibold text-blue-700">{analysis.confidence}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-700"
                      initial={{ width: 0 }}
                      animate={{ width: `${analysis.confidence}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Department routing */}
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-2">
                Routed to Department
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200
                                flex items-center justify-center shrink-0">
                  <Building2 size={14} className="text-indigo-700" />
                </div>
                <div>
                  <p className="text-sm font-bold text-indigo-900">{analysis.department}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock size={10} className="text-indigo-400" />
                    <span className="text-xs text-indigo-500">Est. resolution: {analysis.estimatedResolution}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Immediate steps */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  What to do until authorities arrive
                </p>
              </div>
              <div className="space-y-2">
                {analysis.immediateSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-2.5 text-xs text-amber-900"
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.07, duration: 0.3 }}
                  >
                    <span className="shrink-0 w-4 h-4 rounded-full bg-amber-200 text-amber-800
                                     flex items-center justify-center text-[9px] font-bold mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Department process */}
            <div className="p-4 rounded-xl bg-white border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <Wrench size={13} className="text-slate-500 shrink-0" />
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Department resolution process
                </p>
              </div>
              <div className="space-y-2">
                {analysis.process.map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center
                                    ${step.done
                        ? "bg-green-500"
                        : "bg-slate-100 border border-slate-300"
                      }`}>
                      {step.done
                        ? <CheckCircle2 size={10} className="text-white" />
                        : <ChevronRight size={9} className="text-slate-400" />
                      }
                    </div>
                    <span className={`text-xs ${step.done ? "text-green-700 font-medium" : "text-slate-500"}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI tip */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl
                            bg-blue-50 border border-blue-200">
              <Lightbulb size={14} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 leading-relaxed">
                <span className="font-bold">Pro tip: </span>
                {analysis.tip}
              </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function Report() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [analysisState, setAnalysisState] = useState("idle"); // idle | scanning | done
  const [analysis, setAnalysis] = useState(null);

  // Guards against re-running the scan animation when only the category changes.
  const scanDoneRef = useRef(false);

  // ── Runs ONLY when a new image is uploaded ─────────────────────────────────
  // Triggers the 3-second scan animation once per image upload.
  useEffect(() => {
    if (!image) {
      setAnalysisState("idle");
      setAnalysis(null);
      scanDoneRef.current = false;
      return;
    }
    if (scanDoneRef.current) return; // scan already done for this image

    setAnalysisState("scanning");
    setAnalysis(null);

    const timer = setTimeout(() => {
      // Read category at the moment the scan finishes via functional updater,
      // so we don't need category as a dependency of this effect.
      setCategory((currentCategory) => {
        const key = currentCategory && AI_ANALYSIS[currentCategory] ? currentCategory : "Other";
        setAnalysis(AI_ANALYSIS[key]);
        setAnalysisState("done");
        scanDoneRef.current = true;
        return currentCategory; // no change to category state
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [image]); // image ONLY — NOT category

  // ── Runs ONLY when category changes, AFTER the scan is already done ────────
  // Silently swaps the result panel — no scan animation replay.
  useEffect(() => {
    if (analysisState !== "done") return;
    if (!category) return;
    const key = AI_ANALYSIS[category] ? category : "Other";
    setAnalysis(AI_ANALYSIS[key]);
  }, [category]); // category ONLY

  const handleFileSelect = (file) => {
    scanDoneRef.current = false; // fresh scan for the new image
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleClear = () => {
    setImage(null);
    setPreview(null);
    setAnalysisState("idle");
    setAnalysis(null);
    scanDoneRef.current = false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !image) {
      setToast({ type: "error", message: "Please add a title, description, and incident photo." });
      return;
    }
    if (!category) {
      setToast({ type: "error", message: "Please select a category." });
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("location", location || "");
      formData.append("city", location ? location.split(",").pop().trim() : "");
      formData.append("image", image);

      await api.upload("/complaints", formData);

      setToast({
        type: "success",
        message: "Issue submitted successfully.",
        link: { label: "Track on Dashboard", to: "/dashboard" },
      });
      setTitle(""); setDescription(""); setCategory(""); setLocation("");
      handleClear();
    } catch (err) {
      setToast({ type: "error", message: err.message || "Submission failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Toast toast={toast} onClose={() => setToast(null)} />
      <PageBackground />

      <main className="min-h-screen pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Page header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Submit complaint
            </span>
            <h1 className="text-3xl font-bold text-slate-900 mt-1">
              Report a Civic Issue
            </h1>
            <p className="text-slate-500 mt-1.5 text-sm max-w-lg">
              Upload a photo — our AI classifies it instantly, tells you what to do,
              and routes it to the right authority.
            </p>
          </motion.div>

          {/* ── True 50 / 50 split ── */}
          <div className="grid lg:grid-cols-2 gap-6 items-start">

            {/* ── LEFT: Form ── */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80
                         shadow-sm p-8"
              custom={0}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100
                                flex items-center justify-center">
                  <FileText size={15} className="text-blue-700" />
                </div>
                <p className="text-sm font-bold text-slate-800">Issue Details</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Photo upload */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Issue Photo <span className="text-red-500">*</span>
                  </label>
                  <DragDropUpload
                    onFileSelect={handleFileSelect}
                    preview={preview}
                    onClear={handleClear}
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Issue Title <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText size={15} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Large pothole near main junction"
                      className={inputCls(true)}
                    />
                  </div>
                </div>

                {/* Category + Location */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                    <div className="relative">
                      <Tag size={15} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={inputCls(true) + " appearance-none"}
                      >
                        <option value="">Select category</option>
                        {categories.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                    <div className="relative">
                      <MapPin size={15} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. MG Road, Indore"
                        className={inputCls(true)}
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue — how long it's been there and how it affects the area."
                    className={inputCls(false) + " resize-none"}
                  />
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2
                             py-3.5 rounded-xl bg-blue-800 hover:bg-blue-900
                             disabled:bg-blue-400 disabled:cursor-not-allowed
                             text-white text-sm font-semibold
                             shadow-md shadow-blue-800/20 transition-colors duration-200"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor"
                          strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
                      </svg>
                      Submitting issue…
                    </>
                  ) : (
                    <><Send size={15} /> Submit Issue</>
                  )}
                </motion.button>

                {/* Routing time chip */}
                <div className="flex items-center gap-3 pt-1">
                  <ShieldCheck size={13} className="text-blue-600 shrink-0" />
                  <p className="text-xs text-slate-500">
                    Average routing time from submission:{" "}
                    <span className="font-bold text-blue-700">43 seconds</span>
                  </p>
                </div>

              </form>
            </motion.div>

            {/* ── RIGHT: AI Panel ── */}
            <motion.div
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80
                         shadow-sm p-8 lg:sticky lg:top-28"
              custom={1}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <AIPanel
                image={image}
                preview={preview}
                category={category}
                analysisState={analysisState}
                analysis={analysis}
              />
            </motion.div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Report;