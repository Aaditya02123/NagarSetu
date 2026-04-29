import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Lightbulb, AlertCircle, Cpu,
  Upload, Brain, CheckCircle, Eye, MapPin, Zap, Users, ShieldCheck,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

/* ── Scroll-reveal hook ── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ── How it works steps ── */
const steps = [
  { Icon: Upload,       num: "01", title: "Citizen uploads",   desc: "Photo of any civic problem — pothole, garbage, flooded road — captured in seconds.",          color: "bg-blue-50 text-blue-800 border border-blue-200"   },
  { Icon: Brain,        num: "02", title: "AI classifies",     desc: "MobileNetV3 model identifies category and assigns a severity score from visual cues.",         color: "bg-purple-50 text-purple-800 border border-purple-200" },
  { Icon: Zap,          num: "03", title: "Auto-routed",       desc: "Complaint reaches the exact department — PWD, IMC, Electricity Board — without manual triage.", color: "bg-amber-50 text-amber-800 border border-amber-200"  },
  { Icon: CheckCircle,  num: "04", title: "Resolved & logged", desc: "Citizens track progress in real time. Every action is timestamped for full accountability.",   color: "bg-green-50 text-green-800 border border-green-200"  },
];

/* ── Team / pillars ── */
const pillars = [
  { Icon: Users,       title: "Citizen-first",  desc: "Designed so any citizen, tech-savvy or not, can file a complaint in under 60 seconds." },
  { Icon: Zap,         title: "AI-powered",     desc: "Computer vision and NLP work together so no complaint is miscategorised or misrouted."  },
  { Icon: ShieldCheck, title: "Accountable",    desc: "Every action is logged. Authorities are identifiable. Rejections always include a reason." },
  { Icon: Eye,         title: "Transparent",    desc: "Open audit trails mean citizens can always see what happened, and when, and who acted."   },
];

function About() {
  const [heroRef, heroVisible]       = useReveal(0.1);
  const [problemRef, problemVisible] = useReveal(0.15);
  const [stepsRef, stepsVisible]     = useReveal(0.1);
  const [pillarsRef, pillarsVisible] = useReveal(0.15);
  const [visionRef, visionVisible]   = useReveal(0.2);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white">

        {/* ══ HERO ══ */}
        <section
          ref={heroRef}
          className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#0B1628] to-[#0F1F3D] pt-32 pb-24 px-6"
        >
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Glow orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-5xl mx-auto">

            {/* Back link */}
            <NavLink
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-400
                         hover:text-blue-400 transition duration-200 mb-12 group"
            >
              <div className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-800/60
                              flex items-center justify-center
                              group-hover:border-blue-500/50 group-hover:bg-blue-900/30 transition duration-200">
                <ArrowLeft size={14} />
              </div>
              Back to Home
            </NavLink>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left text */}
              <div
                className={`transition-all duration-700
                            ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              >
                <span className="inline-block px-3 py-1 bg-blue-500/15 text-blue-300 border border-blue-500/25
                                 text-xs font-semibold rounded-full uppercase tracking-wider mb-6">
                  About NagarSetu
                </span>
                <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                  Built to fix<br />
                  <span className="text-blue-400">broken cities.</span>
                </h1>
                <p className="text-slate-300 text-lg leading-relaxed max-w-md">
                  NagarSetu is an AI-powered civic issue reporting platform that bridges
                  the gap between frustrated citizens and overwhelmed municipal authorities.
                </p>
              </div>

              {/* Right — mission card */}
              <div
                className={`transition-all duration-700 delay-200
                            ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 space-y-6">
                  {[
                    { label: "Mission",  text: "Make civic reporting effortless and impossible to ignore."              },
                    { label: "Method",   text: "AI image classification + automated department routing + live tracking." },
                    { label: "Impact",   text: "Faster resolutions. Accountable authorities. Empowered citizens."       },
                  ].map(({ label, text }) => (
                    <div key={label} className="border-l-2 border-blue-500/50 pl-5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-1">{label}</p>
                      <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ PROBLEM / SOLUTION BENTO ══ */}
        <section
          ref={problemRef}
          className="py-24 px-6 bg-gradient-to-b from-slate-50 to-white"
        >
          <div className="max-w-5xl mx-auto">

            <div
              className={`text-center mb-14 transition-all duration-500
                          ${problemVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200
                               text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
                Why we exist
              </span>
              <h2 className="text-4xl font-bold text-slate-900">The problem we're solving</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">

              {/* Problem card */}
              <div
                className={`relative overflow-hidden rounded-3xl border border-red-100 bg-red-50 p-8
                            transition-all duration-500
                            ${problemVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: "100ms" }}
              >
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-red-100 rounded-full opacity-60 pointer-events-none" />
                <div className="w-12 h-12 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center mb-5">
                  <AlertCircle size={22} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">The problem</h3>
                <p className="text-slate-600 leading-relaxed text-sm mb-5">
                  Traditional complaint portals are slow, manual, and opaque. Citizens
                  file complaints into a black hole — no confirmation, no ETA, no accountability.
                  Authorities receive hundreds of unclassified, unprioritised reports daily.
                </p>
                <div className="space-y-2">
                  {["No automated routing — manual triage only", "No priority system — broken dustbin = flooded road", "No audit trail — complaints just disappear"].map(x => (
                    <div key={x} className="flex items-start gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                      <span className="text-sm text-slate-600">{x}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-6">

                {/* Solution card */}
                <div
                  className={`relative overflow-hidden rounded-3xl border border-blue-100 bg-blue-50 p-8
                              transition-all duration-500
                              ${problemVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: "200ms" }}
                >
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-100 rounded-full opacity-60 pointer-events-none" />
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center mb-5">
                    <Cpu size={22} className="text-blue-700" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Our solution</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    NagarSetu uses computer vision to classify issues from a photo in under a second,
                    assigns severity scores, auto-routes to the right department, and gives citizens
                    a live timeline — all without a single manual step from an authority.
                  </p>
                </div>

                {/* Vision card */}
                <div
                  className={`relative overflow-hidden rounded-3xl border border-green-100 bg-green-50 p-8
                              transition-all duration-500
                              ${problemVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: "300ms" }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-green-100 border border-green-200 flex items-center justify-center mb-5">
                    <Eye size={22} className="text-green-700" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Our vision</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Smarter cities through transparent, AI-driven civic governance that
                    empowers both citizens and authorities.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ══ HOW IT WORKS ══ */}
        <section
          ref={stepsRef}
          className="py-24 px-6 bg-gradient-to-b from-white to-[#EEF2FF]"
        >
          <div className="max-w-5xl mx-auto">

            <div
              className={`text-center mb-16 transition-all duration-500
                          ${stepsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200
                               text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
                How it works
              </span>
              <h2 className="text-4xl font-bold text-slate-900">Four steps from problem to resolution</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {steps.map(({ Icon, num, title, desc, color }, i) => (
                <div
                  key={num}
                  className={`group relative bg-white rounded-3xl border border-slate-200 p-8
                              shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300
                              ${stepsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: stepsVisible ? `${i * 100}ms` : "0ms" }}
                >
                  <span className="absolute top-6 right-7 text-7xl font-black text-slate-100 select-none leading-none">
                    {num}
                  </span>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${color}`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 relative z-10">{title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed relative z-10">{desc}</p>
                  {(i === 0 || i === 2) && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-6 rounded-full
                                    bg-blue-600 border-4 border-white shadow-sm z-20 -translate-y-1/2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ PILLARS ══ */}
        <section
          ref={pillarsRef}
          className="py-24 px-6 bg-[#EEF2FF]"
        >
          <div className="max-w-5xl mx-auto">

            <div
              className={`text-center mb-14 transition-all duration-500
                          ${pillarsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            >
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200
                               text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
                Our principles
              </span>
              <h2 className="text-4xl font-bold text-slate-900">What we stand for</h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {pillars.map(({ Icon, title, desc }, i) => (
                <div
                  key={title}
                  className={`bg-white rounded-2xl border border-slate-200 p-6
                              shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300
                              ${pillarsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                  style={{ transitionDelay: pillarsVisible ? `${i * 80}ms` : "0ms" }}
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100
                                  flex items-center justify-center mb-4">
                    <Icon size={18} className="text-blue-700" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ VISION CTA ══ */}
        <section
          ref={visionRef}
          className="py-24 px-6 bg-gradient-to-b from-[#EEF2FF] to-white"
        >
          <div
            className={`max-w-3xl mx-auto text-center transition-all duration-700
                        ${visionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                            bg-blue-800 mb-8 shadow-xl shadow-blue-900/25">
              <Lightbulb size={28} className="text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Every city deserves<br />
              <span className="text-blue-800">a working system.</span>
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
              NagarSetu is proof that civic technology doesn't have to be bureaucratic.
              It can be fast, intelligent, and built for real people.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <NavLink
                to="/report"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5
                           bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-xl
                           shadow-md shadow-blue-800/20 transition-all duration-200 hover:-translate-y-0.5"
              >
                Report an issue <ArrowRight size={15} />
              </NavLink>
              <NavLink
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5
                           border border-slate-200 bg-white text-slate-700 font-semibold rounded-xl
                           hover:border-blue-300 hover:text-blue-700 transition-all duration-200 hover:-translate-y-0.5"
              >
                Create account
              </NavLink>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}

export default About;