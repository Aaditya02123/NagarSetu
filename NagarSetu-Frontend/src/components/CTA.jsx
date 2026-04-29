import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import { motion, AnimatePresence, animate, useMotionValue, useTransform } from "framer-motion";
import api from "../api";

/* ── tiny floating particle dots rendered inside the card ── */
const PARTICLES = [
  { cx: "10%",  cy: "20%", r: 3,  delay: 0    },
  { cx: "88%",  cy: "15%", r: 2,  delay: 0.6  },
  { cx: "75%",  cy: "80%", r: 4,  delay: 1.1  },
  { cx: "20%",  cy: "75%", r: 2,  delay: 0.3  },
  { cx: "50%",  cy: "92%", r: 3,  delay: 0.9  },
  { cx: "92%",  cy: "50%", r: 2,  delay: 1.5  },
  { cx: "5%",   cy: "50%", r: 2,  delay: 1.8  },
  { cx: "60%",  cy: "8%",  r: 3,  delay: 0.4  },
];

/* ── morphing button: idle → loading → success ── */
function MorphButton({ label, onClick, primary }) {
  const [state, setState] = useState("idle"); // idle | loading | done

  const handleClick = async () => {
    if (state !== "idle") return;
    setState("loading");
    await new Promise((r) => setTimeout(r, 1600));
    setState("done");
    await new Promise((r) => setTimeout(r, 1400));
    setState("idle");
    onClick();
  };

  const isRound = state === "loading" || state === "done";

  return (
    <motion.button
      onClick={handleClick}
      animate={{
        width: isRound ? 52 : primary ? 172 : 160,
        borderRadius: isRound ? 26 : 12,
        backgroundColor:
          state === "done"
            ? "#16a34a"
            : primary
            ? "#ffffff"
            : "rgba(255,255,255,0.12)",
      }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`relative inline-flex items-center justify-center overflow-hidden
                  font-semibold text-sm
                  ${primary ? "text-blue-900 shadow-md" : "text-white border border-white/30"}
                  ${state === "done" ? "text-white border-transparent" : ""}
                  disabled:cursor-not-allowed`}
      style={{ height: 48, flexShrink: 0 }}
      whileTap={{ scale: 0.97 }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {state === "idle" && (
          <motion.span
            key="idle"
            className="flex items-center gap-2 whitespace-nowrap"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.18 }}
          >
            {label} {primary && <ArrowRight size={15} />}
          </motion.span>
        )}
        {state === "loading" && (
          <motion.span
            key="loading"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.18 }}
          >
            <svg
              className="animate-spin"
              width="20" height="20" viewBox="0 0 24 24" fill="none"
            >
              <circle
                cx="12" cy="12" r="10"
                stroke={primary ? "#1e3a8a" : "white"}
                strokeWidth="3"
                strokeDasharray="60"
                strokeDashoffset="20"
              />
            </svg>
          </motion.span>
        )}
        {state === "done" && (
          <motion.span
            key="done"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.18 }}
          >
            <CheckCircle size={20} color="white" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ── main CTA ── */
function CTA() {
  const navigate = useNavigate();
  const cardRef = useRef(null);

  // Live citizen data from /api/auth/public-stats
  const [citizenTotal,    setCitizenTotal]    = useState(null);
  const [citizenPreviews, setCitizenPreviews] = useState([]);

  useEffect(() => {
    api.get("/auth/public-stats")
      .then((data) => {
        setCitizenTotal(data.total ?? 0);
        setCitizenPreviews(data.previews ?? []);
      })
      .catch(() => {
        // Silently keep null so the social proof line stays hidden on error
      });
  }, []);

  /* subtle magnetic tilt on the whole card */
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    animate(card, {
      rotateY: x * 6,
      rotateX: -y * 6,
    }, { duration: 0.12, ease: "linear" });
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    animate(card, { rotateY: 0, rotateX: 0 }, { duration: 0.6, ease: "easeOut" });
  };

  /* stagger variants for inner content */
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1, delayChildren: 0.25 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  // Format the count label: "2,400+" style if real data, else "..." while loading
  const countLabel = citizenTotal === null
    ? "..."
    : citizenTotal >= 1000
      ? `${(citizenTotal / 1000).toFixed(1).replace(/\.0$/, "")}k+`
      : `${citizenTotal}+`;

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-[#F8FAFC] to-[#EEF2FF]">
      {/* Card entrance */}
      <motion.div
        ref={cardRef}
        className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl
                   bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700
                   px-10 py-16 text-center shadow-2xl shadow-blue-900/25"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >

        {/* ── Animated floating orbs ── */}
        <motion.div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-blue-500/20 pointer-events-none"
          animate={{ scale: [1, 1.15, 1], x: [0, 10, 0], y: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-indigo-900/20 pointer-events-none"
          animate={{ scale: [1, 1.2, 1], x: [0, -8, 0], y: [0, 12, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-blue-400/10 pointer-events-none"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        {/* ── Particle dots ── */}
        {PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/20 pointer-events-none"
            style={{
              left: p.cx,
              top: p.cy,
              width: p.r * 2,
              height: p.r * 2,
            }}
            animate={{ y: [0, -10, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{
              duration: 3.5 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: p.delay,
            }}
          />
        ))}

        {/* ── Staggered inner content ── */}
        <motion.div
          className="relative z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          {/* Badge */}
          <motion.span
            variants={itemVariants}
            className="inline-block px-3 py-1 mb-6 bg-white/20 text-white
                       text-xs font-semibold rounded-full uppercase tracking-wider"
          >
            Get started today
          </motion.span>

          {/* Heading */}
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
          >
            Make your city
            <br />
            <span className="text-blue-200">better today</span>
          </motion.h2>

          {/* Subtext */}
          <motion.p
            variants={itemVariants}
            className="text-blue-100 text-lg mb-10 max-w-lg mx-auto"
          >
            Report civic problems instantly and help authorities act faster.
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <MorphButton
              label="Report an Issue"
              primary
              onClick={() => navigate("/report")}
            />
            <MorphButton
              label="Create Account"
              primary={false}
              onClick={() => navigate("/register")}
            />
          </motion.div>

          {/* Social proof — live citizen data */}
          {citizenTotal !== null && (
            <motion.div
              variants={itemVariants}
              className="mt-10 flex items-center justify-center gap-2 text-blue-200 text-sm"
            >
              {/* Avatar stack — real initials of last 3 registered citizens */}
              {citizenPreviews.length > 0 && (
                <div className="flex -space-x-2">
                  {citizenPreviews.map((u, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full bg-white/20 border-2 border-blue-600
                                 flex items-center justify-center text-white text-xs font-semibold"
                    >
                      {u.initials}
                    </div>
                  ))}
                </div>
              )}
              <span>
                Joined by{" "}
                <strong className="text-white font-semibold">{countLabel}</strong>{" "}
                citizens
              </span>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}

export default CTA;