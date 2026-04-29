import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function useCountUp(target, active, duration = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    const startTime = performance.now();
    let rafId;
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) rafId = requestAnimationFrame(tick);
      else setCount(target);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active, target, duration]);
  return count;
}

function StatCard({ value, suffix, label, color, bg, border, active, index }) {
  const count = useCountUp(value, active);

  return (
    <motion.div
      className={`flex flex-col items-center text-center p-8 rounded-2xl border ${bg} ${border}`}
      initial={{ opacity: 0, y: 20 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
    >
      <div className={`text-5xl font-extrabold tabular-nums mb-3 ${color}`}>
        {count}{suffix}
      </div>
      <p className="text-slate-600 font-medium text-sm">{label}</p>
    </motion.div>
  );
}

function Stats() {
  const [active, setActive] = useState(false);
  const [stats,  setStats]  = useState({
    total: 0, resolved: 0, departments: 0,
  });
  const ref = useRef(null);

  // Fetch live stats from the public endpoint (no auth required)
  useEffect(() => {
    fetch(`${BASE}/api/stats`)
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(console.error);
  }, []);

  // Trigger count-up animation when section scrolls into view
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const STAT_CARDS = [
    {
      value:  stats.total,
      suffix: "+",
      label:  "Issues Reported",
      color:  "text-blue-700",
      bg:     "bg-blue-50",
      border: "border-blue-200",
    },
    {
      value:  stats.resolved,
      suffix: "+",
      label:  "Issues Resolved",
      color:  "text-green-700",
      bg:     "bg-green-50",
      border: "border-green-200",
    },
    {
      value:  24,
      suffix: "/7",
      label:  "AI Monitoring",
      color:  "text-purple-700",
      bg:     "bg-purple-50",
      border: "border-purple-200",
    },
    {
      value:  stats.departments,
      suffix: "+",
      label:  "Departments Connected",
      color:  "text-amber-700",
      bg:     "bg-amber-50",
      border: "border-amber-200",
    },
  ];

  return (
    <section ref={ref} className="py-24 bg-white px-6">
      <div className="max-w-6xl mx-auto">

        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
            Impact
          </span>
          <h2 className="text-4xl font-bold text-slate-900">NagarSetu by the numbers</h2>
          <p className="text-slate-500 mt-3 text-lg max-w-md mx-auto">
            Real impact, tracked in real time across cities.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STAT_CARDS.map((s, i) => (
            <StatCard key={s.label} {...s} active={active} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}

export default Stats;