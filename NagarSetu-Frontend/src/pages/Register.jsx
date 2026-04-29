import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Toast from "../components/Toast";
import { registerUser } from "/src/api";

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
  visible: { transition: { staggerChildren: 0.065, delayChildren: 0.25 } },
};

const fieldVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

function getStrength(pwd) {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 8)          score++;
  if (/[A-Z]/.test(pwd))        score++;
  if (/[0-9]/.test(pwd))        score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map = [
    { label: "",       color: ""            },
    { label: "Weak",   color: "bg-red-400"  },
    { label: "Fair",   color: "bg-amber-400"},
    { label: "Good",   color: "bg-blue-400" },
    { label: "Strong", color: "bg-green-500"},
  ];
  return { score, ...map[score] };
}

function PasswordStrength({ password }) {
  const { score, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2"
    >
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? color : "bg-slate-100"}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            style={{ transformOrigin: "left" }}
          />
        ))}
      </div>
      {label && (
        <p className={`text-xs font-medium ${score <= 1 ? "text-red-500" : score === 2 ? "text-amber-500" : score === 3 ? "text-blue-500" : "text-green-600"}`}>
          {label} password
        </p>
      )}
    </motion.div>
  );
}

function InputField({ id, type, value, onChange, placeholder, icon: Icon, error, rightElement }) {
  return (
    <div>
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
    </div>
  );
}

function FeatureBullet({ text }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
        <CheckCircle2 size={12} className="text-blue-700" />
      </div>
      <span className="text-sm text-slate-600">{text}</span>
    </div>
  );
}

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    phone: "", password: "", confirmPassword: "",
  });

  const [showPwd,     setShowPwd]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [toast,       setToast]       = useState(null);
  const [errors,      setErrors]      = useState({});

  // Restricted change handlers
  const setName = (key) => (e) => {
    // Allow only letters (upper + lower case) and spaces
    const val = e.target.value.replace(/[^a-zA-Z ]/g, "");
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const setPhone = (e) => {
    // Allow only digits 0-9, max 10 digits
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
    setForm((prev) => ({ ...prev, phone: val }));
  };

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const validate = () => {
    const err = {};
    if (!form.firstName)                                   err.firstName       = "First name is required.";
    else if (!/^[a-zA-Z ]+$/.test(form.firstName))        err.firstName       = "First name can only contain letters.";
    if (!form.lastName)                                    err.lastName        = "Last name is required.";
    else if (!/^[a-zA-Z ]+$/.test(form.lastName))         err.lastName        = "Last name can only contain letters.";
    if (!form.email)                                       err.email           = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email))            err.email           = "Enter a valid email address.";
    if (form.phone && !/^[0-9]{10}$/.test(form.phone))   err.phone           = "Enter a valid 10-digit phone number.";
    if (!form.password)                                    err.password        = "Password is required.";
    else if (form.password.length < 8)                     err.password        = "Minimum 8 characters.";
    if (!form.confirmPassword)                             err.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)       err.confirmPassword = "Passwords do not match.";
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length) { setErrors(err); return; }
    setErrors({});
    setLoading(true);
  
    try {
      await registerUser({
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        phone:     form.phone || null,
        password:  form.password,
      });
      setToast({
        type: "success",
        message: "Account created successfully!",
        link: { label: "Sign in now", to: "/login" },
      });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      if (err.message.includes("already exists")) {
        setErrors({ email: "This email is already registered." });
      } else {
        setToast({ type: "error", message: err.message });
      }
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
        {[
          { w: 320, h: 320, top: "-100px",  left: "-100px", color: "rgba(37,99,235,0.07)"   },
          { w: 220, h: 220, bottom: "-60px", right: "-60px", color: "rgba(99,102,241,0.06)" },
          { w: 160, h: 160, top: "40%",     left: "5%",     color: "rgba(14,165,233,0.05)"  },
        ].map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: orb.w, height: orb.h,
              top: orb.top, left: orb.left, right: orb.right, bottom: orb.bottom,
              background: orb.color, filter: "blur(48px)",
            }}
            animate={{ scale: [1, 1.07, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 7, delay: i * 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.16) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="w-full max-w-lg relative z-10">

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
              Join NagarSetu
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Create your citizen account and start making your city better
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
                <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Citizen Account</p>
                <p className="text-xs text-blue-500">Report issues · Track status · Make an impact</p>
              </div>
            </motion.div>

            {/* Form fields */}
            <form onSubmit={handleSubmit} noValidate>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-5"
            >

              {/* First + Last name */}
              <motion.div variants={fieldVariants} className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <InputField
                    id="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={setName("firstName")}
                    placeholder="Aaditya"
                    icon={User}
                    error={errors.firstName}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <InputField
                    id="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={setName("lastName")}
                    placeholder="Soni"
                    icon={User}
                    error={errors.lastName}
                  />
                </div>
              </motion.div>

              {/* Email */}
              <motion.div variants={fieldVariants}>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <InputField
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="you@example.com"
                  icon={Mail}
                  error={errors.email}
                />
              </motion.div>

              {/* Phone */}
              <motion.div variants={fieldVariants}>
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Phone Number <span className="text-slate-400 text-xs font-normal">(optional)</span>
                </label>
                <InputField
                  id="phone"
                  type="text"
                  value={form.phone}
                  onChange={setPhone}
                  placeholder="+91 98765 43210"
                  icon={Phone}
                  error={errors.phone}
                />
              </motion.div>

              {/* Password */}
              <motion.div variants={fieldVariants}>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <InputField
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Min 8 characters"
                  icon={Lock}
                  error={errors.password}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="text-slate-400 hover:text-slate-700 transition-colors duration-200"
                    >
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />
                <AnimatePresence>
                  {form.password && <PasswordStrength password={form.password} />}
                </AnimatePresence>
              </motion.div>

              {/* Confirm Password */}
              <motion.div variants={fieldVariants}>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <InputField
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  placeholder="Repeat your password"
                  icon={Lock}
                  error={errors.confirmPassword}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="text-slate-400 hover:text-slate-700 transition-colors duration-200"
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />
              </motion.div>

              {/* Benefits strip */}
              <motion.div
                variants={fieldVariants}
                className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2"
              >
                <FeatureBullet text="Report potholes, waterlogging & more instantly" />
                <FeatureBullet text="Track complaint status from Open → Resolved" />
                <FeatureBullet text="Free forever · No spam · No ads" />
              </motion.div>

              {/* Submit */}
              <motion.div variants={fieldVariants}>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.01, y: -1 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700
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
                        Creating account...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        Create Account
                        <ArrowRight size={16} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>

            </motion.div>
            </form>
          </motion.div>

          {/* Footer link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="text-center text-sm text-slate-500 mt-6"
          >
            Already have an account?{" "}
            <NavLink
              to="/login"
              className="text-blue-600 font-semibold hover:text-blue-800
                         hover:underline underline-offset-2 transition-colors duration-200"
            >
              Sign in
            </NavLink>
          </motion.p>

        </div>
      </div>
      <Footer />
    </>
  );
}

export default Register;