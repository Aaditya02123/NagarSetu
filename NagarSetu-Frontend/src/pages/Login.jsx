import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "../components/Toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { setToken, setUser } from "/src/Api";


// Framer Motion variants
const pageVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
  },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
};

const fieldVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const floatingOrbs = [
  { w: 280, h: 280, top: "-80px", left: "-80px",  color: "rgba(37,99,235,0.08)",  delay: 0 },
  { w: 200, h: 200, top: "60%",   right: "-60px",  color: "rgba(99,102,241,0.07)", delay: 1.5 },
  { w: 140, h: 140, top: "30%",   left: "10%",     color: "rgba(14,165,233,0.06)", delay: 3 },
];

function FloatingLabel({ label, htmlFor, required }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-semibold text-slate-700 mb-1.5"
    >
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function InputField({ id, type, value, onChange, placeholder, icon: Icon, error, rightElement }) {
  return (
    <motion.div variants={fieldVariants}>
      <div className="relative group">
        <Icon
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400
                     group-focus-within:text-blue-500 transition-colors duration-200 z-10"
        />
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pl-10 pr-${rightElement ? "10" : "4"} py-3 text-sm rounded-xl border
                      bg-white text-slate-900 placeholder-slate-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400
                      transition-all duration-200
                      ${error ? "border-red-400 bg-red-50/30" : "border-slate-200 hover:border-slate-300"}`}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-red-500 text-xs mt-1.5 flex items-center gap-1"
          >
            <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Login() {
  const navigate = useNavigate();
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [toast,        setToast]        = useState(null);
  const [errors,       setErrors]       = useState({});

  const validate = () => {
    const e = {};
    if (!email)                             e.email    = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email))  e.email    = "Enter a valid email address.";
    if (!password)                          e.password = "Password is required.";
    return e;
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const reset = (msg) => {
      setEmail("");
      setPassword("");
      setToast({ type: "error", message: msg });
    };

    try {
      const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
      let res;
      try {
        res = await fetch(`${BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
      } catch {
        reset("Cannot reach the server. Please check your connection.");
        return;
      }

      let data = {};
      try { data = await res.json(); } catch { /* empty body */ }

      if (res.status === 401 || res.status === 403) {
        reset("No account found with these credentials. Please check your email and password.");
        return;
      }

      if (!res.ok) {
        const msg =
          typeof data.detail === "string"
            ? data.detail
            : Array.isArray(data.detail)
            ? data.detail.map((d) => d.msg).join(", ")
            : "Something went wrong. Please try again.";
        reset(msg);
        return;
      }

      setToken(data.access_token);
      setUser(data.user);
      setToast({ type: "success", message: `Welcome back, ${data.user.first_name}!` });
      setTimeout(() => navigate(data.user.role === "admin" ? "/admin" : "/dashboard"), 1500);

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40
                      flex items-center justify-center px-6 pt-28 pb-16 relative overflow-hidden">

        {/* Decorative orbs */}
        {floatingOrbs.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: orb.w, height: orb.h,
              top: orb.top, left: orb.left, right: orb.right,
              background: orb.color,
              filter: "blur(40px)",
            }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 6, delay: orb.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.18) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="w-full max-w-md relative z-10">

          {/* Logo + heading */}
          <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-8"
          >
            <NavLink to="/" className="inline-flex items-center gap-2.5 justify-center mb-6">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -3 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800
                           flex items-center justify-center shadow-lg shadow-blue-500/25"
              >
                <span className="text-white font-bold text-sm">NS</span>
              </motion.div>
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                Nagar<span className="text-blue-700">Setu</span>
              </span>
            </NavLink>

            <h1 className="text-3xl font-bold text-slate-900 leading-tight">
              Welcome back
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Sign in to track and manage your civic reports
            </p>
          </motion.div>

          {/* Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white
                       shadow-xl shadow-slate-200/60 p-8"
          >
            {/* Citizen badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.35 }}
              className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl
                         bg-blue-50 border border-blue-100"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <Shield size={14} className="text-blue-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Citizen Login</p>
                <p className="text-xs text-blue-500">Report and track civic issues</p>
              </div>
            </motion.div>

            {/* Fields */}
            <form
              onSubmit={handleSubmit}
              noValidate
            >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <FloatingLabel label="Email Address" htmlFor="email" required />
                <InputField
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  icon={Mail}
                  error={errors.email}
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <FloatingLabel label="Password" htmlFor="password" required />
                  <motion.button
                    whileHover={{ x: 1 }}
                    type="button"
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium
                               transition-colors duration-200 -mt-1"
                  >
                    Forgot password?
                  </motion.button>
                </div>
                <InputField
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  icon={Lock}
                  error={errors.password}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-700 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />
              </div>

              {/* Submit */}
              <motion.div variants={fieldVariants}>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.01, y: -1 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="w-full py-3.5 mt-1 bg-gradient-to-r from-blue-600 to-blue-700
                             hover:from-blue-700 hover:to-blue-800
                             disabled:from-blue-400 disabled:to-blue-400
                             text-white font-semibold rounded-xl transition-all duration-200
                             shadow-md shadow-blue-200 flex items-center justify-center gap-2
                             disabled:cursor-not-allowed"
                >
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor"
                            strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
                        </svg>
                        Signing in...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        Sign In
                        <ArrowRight size={16} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>

              {/* Divider */}
              <motion.div variants={fieldVariants} className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400 font-medium">OR</span>
                <div className="flex-1 h-px bg-slate-100" />
              </motion.div>

              {/* Google */}
              <motion.div variants={fieldVariants}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 py-3
                             border border-slate-200 rounded-xl bg-white hover:bg-slate-50
                             hover:border-slate-300 transition-all duration-200
                             text-sm font-medium text-slate-700 shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.22 3.6l6.9-6.9C35.64 2.1 30.2 0 24 0 14.64 0 6.36 5.48 2.44 13.44l8.02 6.22C12.42 13.32 17.7 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.1 24.5c0-1.64-.14-3.22-.4-4.76H24v9.02h12.44c-.54 2.9-2.2 5.36-4.7 7.04l7.24 5.62C43.94 36.9 46.1 31.2 46.1 24.5z" />
                    <path fill="#FBBC05" d="M10.46 28.66c-1-2.9-1-6.02 0-8.92l-8.02-6.22C-1.02 18.1-1.02 29.9 2.44 34.48l8.02-5.82z" />
                    <path fill="#34A853" d="M24 48c6.2 0 11.64-2.04 15.52-5.56l-7.24-5.62c-2 1.34-4.56 2.12-8.28 2.12-6.3 0-11.58-3.82-13.54-9.16l-8.02 5.82C6.36 42.52 14.64 48 24 48z" />
                  </svg>
                  Continue with Google
                </motion.button>
              </motion.div>
            </motion.div>
            </form>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-sm text-slate-500 mt-6"
          >
            Don't have an account?{" "}
            <NavLink
              to="/register"
              className="text-blue-600 font-semibold hover:text-blue-800
                         hover:underline underline-offset-2 transition-colors duration-200"
            >
              Create one free
            </NavLink>
          </motion.p>

        </div>
      </div>
      <Footer />
    </>
  );
}

export default Login;