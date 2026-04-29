import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPin, Pause, Play } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const slides = [
  { src: "/images/pothole.jpg", label: "Potholes" },
  { src: "/images/traffic.jpg", label: "Traffic congestion" },
  { src: "/images/waterlogging.jpg", label: "Waterlogging" },
];

function Hero() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);

  const startInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4500);
  };

  useEffect(() => {
    if (!paused) startInterval();
    else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [paused]);

  const goTo = (i) => {
    setCurrent(i);
    if (!paused) startInterval(); // reset timer on manual nav
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#070B16]">

      {/* Background slideshow — AnimatePresence handles crossfade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          className="absolute inset-0 bg-cover bg-center brightness-60 saturate-150"
          style={{ backgroundImage: `url(${slides[current].src})` }}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070B16]/30 via-[#0B1220]/55 to-[#070B16]/90" />

      {/* Subtle Radial Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(14,165,233,0.18),_transparent_55%)]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center">

        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full
            bg-blue-500/15 border border-blue-400/20 text-blue-200 text-sm font-medium"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <MapPin size={13} />
          <span>AI-Powered Civic Reporting</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        >
          Report Issues.{" "}
          <span className="text-blue-300">Drive Change.</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-slate-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28, ease: "easeOut" }}
        >
          Upload a photo of any civic problem — potholes, waterlogging, broken infrastructure.
          Our AI classifies it instantly and routes it to the right authorities.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.42, ease: "easeOut" }}
        >
          <button
            onClick={() => navigate("/report")}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5
              bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-xl
              shadow-lg shadow-blue-800/25 transition-all duration-200 hover:-translate-y-0.5"
          >
            Report an Issue <ArrowRight size={16} />
          </button>

          <button
            onClick={() => navigate("/about")}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5
              bg-white/10 border border-white/20 hover:border-blue-400/40
              text-white/90 hover:text-blue-200 font-semibold rounded-xl
              transition-all duration-200 hover:-translate-y-0.5"
          >
            Learn More
          </button>
        </motion.div>

        {/* Dots + Pause control */}
        <motion.div
          className="flex justify-center items-center gap-3 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {/* Pause / Play button — WCAG 2.2.2 compliance */}
          <button
            onClick={() => setPaused((p) => !p)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 border border-white/20
                       flex items-center justify-center transition-all duration-200"
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
          >
            {paused
              ? <Play size={11} className="text-white/80" />
              : <Pause size={11} className="text-white/80" />
            }
          </button>

          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`transition-all duration-300 rounded-full ${
                i === current
                  ? "w-8 h-2 bg-blue-400"
                  : "w-2 h-2 bg-white/25 hover:bg-white/35"
              }`}
              aria-label={`View ${s.label}`}
            />
          ))}
        </motion.div>

        {/* Label */}
        <AnimatePresence mode="wait">
          <motion.p
            key={current}
            className="mt-3 text-sm text-slate-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            Showing: {slides[current].label}
          </motion.p>
        </AnimatePresence>

      </div>
    </section>
  );
}

export default Hero;