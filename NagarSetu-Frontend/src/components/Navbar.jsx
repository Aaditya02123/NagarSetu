import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { getUser, getToken, logoutUser } from "../api";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();
  const navigate  = useNavigate();
  const isHome    = location.pathname === "/";

  // Re-read auth state on every route change
  const token = getToken();
  const user  = getUser();
  const isLoggedIn = !!token && !!user;
  const isAdmin    = user?.role === "admin";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition duration-200 ${
      isActive
        ? isHome ? "text-blue-700 font-semibold" : "text-blue-800 font-semibold"
        : isHome  ? "text-slate-600/90 hover:text-blue-700" : "text-slate-600 hover:text-blue-800"
    }`;

  // Nav links change based on auth state
  const navLinks = [
    { to: "/",         label: "Home"      },
    { to: "/report",   label: "Report"    },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/about",    label: "About"     },
  ];

  const menuVariants = {
    hidden:  { opacity: 0, y: -8, height: 0 },
    visible: { opacity: 1, y: 0, height: "auto", transition: { duration: 0.22, ease: "easeOut" } },
    exit:    { opacity: 0, y: -6, height: 0,    transition: { duration: 0.18, ease: "easeIn"  } },
  };

  const linkVariants = {
    hidden:  { opacity: 0, x: -8 },
    visible: (i) => ({
      opacity: 1, x: 0,
      transition: { delay: i * 0.05, duration: 0.2, ease: "easeOut" },
    }),
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isHome
        ? scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200"
          : "bg-white/60 backdrop-blur-sm border-b border-transparent"
        : scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200"
          : "bg-white/80 backdrop-blur-sm"
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-800 flex items-center justify-center">
            <span className="text-white font-bold text-sm">NS</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Nagar<span className="text-blue-800">Setu</span>
          </span>
        </NavLink>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === "/"}>
              {link.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          )}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {/* User greeting */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100">
                <div className="w-6 h-6 rounded-full bg-blue-800 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">
                    {user.first_name?.[0]?.toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {user.first_name}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600
                           hover:text-red-600 transition duration-200"
              >
                <LogOut size={14} />
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="text-sm font-medium text-slate-600 hover:text-blue-800 transition duration-200"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="text-sm font-semibold px-4 py-2 bg-blue-800 text-white rounded-lg
                           hover:bg-blue-900 transition duration-200 shadow-md shadow-blue-800/20"
              >
                Register
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden transition text-slate-700 hover:text-blue-800"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait" initial={false}>
            {menuOpen ? (
              <motion.span key="close"
                initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.15 }}
                style={{ display: "block" }}>
                <X size={22} />
              </motion.span>
            ) : (
              <motion.span key="open"
                initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.15 }}
                style={{ display: "block" }}>
                <Menu size={22} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden" animate="visible" exit="exit"
            className="md:hidden overflow-hidden bg-white border-t border-slate-100 shadow-lg"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link, i) => (
                <motion.div key={link.to} custom={i} variants={linkVariants} initial="hidden" animate="visible">
                  <NavLink
                    to={link.to} className={linkClass}
                    end={link.to === "/"} onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}

              {/* Admin link in mobile — only for admins */}
              {isAdmin && (
                <motion.div custom={navLinks.length} variants={linkVariants} initial="hidden" animate="visible">
                  <NavLink to="/admin" className={linkClass} onClick={() => setMenuOpen(false)}>
                    Admin Panel
                  </NavLink>
                </motion.div>
              )}

              {/* Auth section */}
              <motion.div
                custom={navLinks.length + 1}
                variants={linkVariants}
                initial="hidden"
                animate="visible"
                className="pt-2 border-t border-slate-100"
              >
                {isLoggedIn ? (
                  <div className="flex flex-col gap-3">
                    {/* User info */}
                    <div className="flex items-center gap-2.5 px-1">
                      <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">
                          {user.first_name?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    {/* Logout button */}
                    <button
                      onClick={() => { setMenuOpen(false); handleLogout(); }}
                      className="flex items-center justify-center gap-2 w-full text-sm font-medium
                                 py-2 rounded-lg border border-red-200 text-red-600
                                 hover:bg-red-50 transition"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <NavLink
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 text-center text-sm font-medium py-2 border border-slate-300
                                 text-slate-700 hover:border-blue-700 hover:text-blue-800 rounded-lg transition"
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 text-center text-sm font-semibold py-2 rounded-lg transition
                                 bg-blue-800 text-white hover:bg-blue-900"
                    >
                      Register
                    </NavLink>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;