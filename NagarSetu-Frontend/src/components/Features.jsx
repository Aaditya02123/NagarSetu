import React, { useEffect, useRef, useState } from "react";
import { Camera, AlertTriangle, BarChart3, ShieldCheck } from "lucide-react";

const features = [
  {
    id: "detection",
    Icon: Camera,
    tab: "AI Detection",
    title: "AI Image Detection",
    desc: "Upload any photo and our MobileNetV3 model instantly identifies the civic issue type — pothole, waterlogging, garbage, broken infrastructure, and more — with a severity score attached.",
    color: "bg-blue-50 text-blue-800 border border-blue-200",
    accent: "blue",
    preview: {
      badge: "Pothole · High severity",
      badgeColor: "bg-red-100 text-red-700 border border-red-200",
      label: "AI Classification Result",
      bars: [
        { label: "Pothole",        pct: 91, color: "bg-blue-600" },
        { label: "Infrastructure", pct: 6,  color: "bg-slate-300" },
        { label: "Other",          pct: 3,  color: "bg-slate-200" },
      ],
      note: "Classified in 0.4 s · Confidence 91%",
    },
  },
  {
    id: "routing",
    Icon: AlertTriangle,
    tab: "Smart Routing",
    title: "Priority-Based Routing",
    desc: "Every complaint is automatically matched to the right government department — PWD, municipal corporation, electricity board — and ranked by urgency so critical issues never get buried.",
    color: "bg-amber-50 text-amber-800 border border-amber-200",
    accent: "amber",
    preview: {
      badge: "Auto-routed · 3 depts",
      badgeColor: "bg-amber-100 text-amber-700 border border-amber-200",
      label: "Department routing",
      items: [
        { dept: "PWD",                   issue: "Pothole",     priority: "High",   dot: "bg-red-500"   },
        { dept: "Municipal Corp.",        issue: "Waterlogging",priority: "High",   dot: "bg-red-500"   },
        { dept: "Electricity Board",      issue: "Street Light",priority: "Medium", dot: "bg-amber-400" },
      ],
    },
  },
  {
    id: "tracking",
    Icon: BarChart3,
    tab: "Live Tracking",
    title: "Real-Time Tracking",
    desc: "Every submission gets a unique complaint ID. Track progress through four clear stages — Submitted, Under Review, In Progress, Resolved — with timestamps and department updates.",
    color: "bg-green-50 text-green-800 border border-green-200",
    accent: "green",
    preview: {
      badge: "NS-002 · In Progress",
      badgeColor: "bg-blue-100 text-blue-700 border border-blue-200",
      label: "Complaint timeline",
      steps: [
        { label: "Submitted",    date: "18 Mar",  done: true  },
        { label: "Under Review", date: "19 Mar",  done: true  },
        { label: "In Progress",  date: "22 Mar",  done: true  },
        { label: "Resolved",     date: null,      done: false },
      ],
    },
  },
  {
    id: "transparency",
    Icon: ShieldCheck,
    tab: "Transparency",
    title: "Full Accountability",
    desc: "Every action taken on a complaint is logged with timestamp, authority name, and department. Citizens and auditors can see the full resolution trail — no black holes, no excuses.",
    color: "bg-slate-50 text-slate-700 border border-slate-200",
    accent: "slate",
    preview: {
      badge: "Audit log · 4 events",
      badgeColor: "bg-green-100 text-green-700 border border-green-200",
      label: "Resolution audit trail",
      logs: [
        { event: "Complaint filed",       by: "Citizen",          time: "12 Mar 9:04 AM"  },
        { event: "Assigned to PWD",        by: "Auto-router",      time: "12 Mar 9:05 AM"  },
        { event: "Work order created",     by: "Suresh M. (PWD)",  time: "16 Mar 11:20 AM" },
        { event: "Marked resolved",        by: "Suresh M. (PWD)",  time: "20 Mar 3:45 PM"  },
      ],
    },
  },
];

/* ── Preview renderers ── */
function DetectionPreview({ preview }) {
  return (
    <div className="space-y-3">
      {preview.bars.map(({ label, pct, color }) => (
        <div key={label}>
          <div className="flex justify-between text-xs text-slate-600 mb-1 font-medium">
            <span>{label}</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${color} rounded-full transition-all duration-700`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ))}
      <p className="text-xs text-slate-400 pt-1">{preview.note}</p>
    </div>
  );
}

function RoutingPreview({ preview }) {
  return (
    <div className="space-y-2">
      {preview.items.map(({ dept, issue, priority, dot }) => (
        <div
          key={dept}
          className="flex items-center justify-between px-3 py-2.5 bg-white rounded-xl border border-slate-100"
        >
          <div className="flex items-center gap-2.5">
            <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
            <span className="text-sm font-semibold text-slate-800">{dept}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{issue}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md
              ${priority === "High"
                ? "bg-red-50 text-red-700"
                : "bg-amber-50 text-amber-700"}`}>
              {priority}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TrackingPreview({ preview }) {
  return (
    <div className="flex items-start gap-0 pt-2">
      {preview.steps.map(({ label, date, done }, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center flex-1 min-w-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs font-bold
              ${done ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-300"}`}>
              {done ? (
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : i + 1}
            </div>
            <p className={`text-xs mt-1.5 text-center font-medium leading-tight
              ${done ? "text-blue-700" : "text-slate-400"}`}>{label}</p>
            {date && <p className="text-xs text-slate-400 mt-0.5">{date}</p>}
          </div>
          {i < preview.steps.length - 1 && (
            <div className={`h-0.5 flex-1 mx-1 mt-3.5
              ${done && preview.steps[i + 1]?.done ? "bg-blue-600" : "bg-slate-200"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function TransparencyPreview({ preview }) {
  return (
    <div className="space-y-2">
      {preview.logs.map(({ event, by, time }) => (
        <div key={event} className="flex items-start gap-3 px-3 py-2.5 bg-white rounded-xl border border-slate-100">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{event}</p>
            <p className="text-xs text-slate-400 mt-0.5">{by} · {time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function FeaturePreview({ feature, visible }) {
  const { preview, id } = feature;

  return (
    <div
      className={`relative rounded-3xl border border-slate-200 bg-slate-50/80 backdrop-blur-sm p-6
                  transition-all duration-500
                  ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {preview.label}
        </p>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${preview.badgeColor}`}>
          {preview.badge}
        </span>
      </div>

      {/* Mock phone chrome */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        {/* Simulated top bar */}
        <div className="flex items-center gap-1.5 mb-4 pb-3 border-b border-slate-100">
          <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
          <div className="flex-1 mx-2 h-5 bg-slate-100 rounded-md" />
        </div>

        {id === "detection"     && <DetectionPreview    preview={preview} />}
        {id === "routing"       && <RoutingPreview      preview={preview} />}
        {id === "tracking"      && <TrackingPreview     preview={preview} />}
        {id === "transparency"  && <TransparencyPreview preview={preview} />}
      </div>

      {/* Decorative dot grid */}
      <div
        className="absolute bottom-4 right-4 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
          backgroundSize: "12px 12px",
          width: 72,
          height: 72,
        }}
      />
    </div>
  );
}

function Features() {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const current = features[active];

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-[#F8FAFC] to-[#EEF2FF] px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div
          className={`text-center mb-14 transition-all duration-500
                      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
            Features
          </span>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Powerful tools for smarter cities
          </h2>
          <p className="text-slate-600 text-lg max-w-xl mx-auto">
            Smart technology to bridge the gap between citizens and authorities.
          </p>
        </div>

        {/* Tab pills — inspired by reference layout */}
        <div
          className={`flex flex-wrap justify-center gap-2 mb-12 transition-all duration-500 delay-100
                      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {features.map(({ id, tab, Icon }, i) => (
            <button
              key={id}
              onClick={() => setActive(i)}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold
                          border transition-all duration-200
                          ${active === i
                            ? "bg-blue-800 text-white border-blue-800 shadow-md shadow-blue-800/20"
                            : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700"
                          }`}
            >
              <Icon size={14} />
              {tab}
            </button>
          ))}
        </div>

        {/* Main split layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — feature detail */}
          <div
            key={current.id}
            className={`transition-all duration-400
                        ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${current.color}`}>
              <current.Icon size={24} />
            </div>

            <h3 className="text-3xl font-bold text-slate-900 mb-4 leading-snug">
              {current.title}
            </h3>
            <p className="text-slate-600 text-base leading-relaxed mb-8">
              {current.desc}
            </p>

            {/* Feature mini-list */}
            <div className="space-y-3">
              {[
                current.id === "detection"    && ["Vision model trained on civic data", "7 issue categories supported", "Severity scoring in milliseconds"],
                current.id === "routing"      && ["Maps to PWD, IMC, electricity & more", "Priority queue for authorities", "Zero manual triage needed"],
                current.id === "tracking"     && ["Unique complaint ID per submission", "4-stage progress pipeline", "Live status from your dashboard"],
                current.id === "transparency" && ["Full timestamp audit trail", "Authority name logged at each step", "Rejection reason always provided"],
              ].filter(Boolean)[0].map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-slate-700 text-sm font-medium">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — live preview panel */}
          <FeaturePreview feature={current} visible={visible} />

        </div>
      </div>
    </section>
  );
}

export default Features;