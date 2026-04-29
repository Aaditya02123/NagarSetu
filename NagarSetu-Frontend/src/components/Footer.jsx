import React, { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

function Footer() {
  const location = useLocation(); // ✅ track route changes
  const isHome = location.pathname === "/";

  // ✅ scroll on route change (same as navbar)
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location.pathname]);

  return (
    <footer
      className={`pt-16 pb-8 px-6 ${
        isHome
          ? "bg-white/70 text-slate-600 backdrop-blur-md border-t border-slate-200"
          : "bg-[#2C2C2C] text-slate-400"
      }`}
    >
      <div
        className={`max-w-6xl mx-auto grid md:grid-cols-3 gap-10 pb-12 ${
          isHome ? "border-b border-slate-200" : "border-b border-slate-700/50"
        }`}
      >

        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">NS</span>
            </div>
            <span className={`text-lg font-bold ${isHome ? "text-slate-900" : "text-white"}`}>
              Nagar
              <span className={isHome ? "text-blue-700" : "text-blue-400"}>Setu</span>
            </span>
          </div>
          <p className={`text-sm leading-relaxed ${isHome ? "text-slate-600" : "text-slate-400"}`}>
            Bridging the gap between citizens and authorities using AI-powered civic reporting.
          </p>
        </div>

        <div>
          <h4
            className={`font-semibold mb-4 text-sm uppercase tracking-wider ${
              isHome ? "text-slate-900" : "text-white"
            }`}
          >
            Quick Links
          </h4>
          <ul className="space-y-2 text-sm">
            {[
              { to: "/", label: "Home" },
              { to: "/report", label: "Report Issue" },
              { to: "/dashboard", label: "Dashboard" },
              { to: "/about", label: "About Us" },
              { to: "/login", label: "Login" },
            ].map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={`transition duration-200 ${
                    isHome
                      ? "text-slate-600 hover:text-blue-700"
                      : "text-slate-400 hover:text-blue-400"
                  }`}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4
            className={`font-semibold mb-4 text-sm uppercase tracking-wider ${
              isHome ? "text-slate-900" : "text-white"
            }`}
          >
            Contact
          </h4>
          <ul className="space-y-3 text-sm">
            <li
              className={`flex items-center gap-2 ${
                isHome ? "text-slate-600" : "text-slate-400"
              }`}
            >
              <Mail size={14} className={isHome ? "text-blue-700" : "text-blue-400"} />
              support@nagarsetu.com
            </li>
            <li
              className={`flex items-center gap-2 ${
                isHome ? "text-slate-600" : "text-slate-400"
              }`}
            >
              <Phone size={14} className={isHome ? "text-blue-700" : "text-blue-400"} />
              +91 98765 43210
            </li>
            <li
              className={`flex items-center gap-2 ${
                isHome ? "text-slate-600" : "text-slate-400"
              }`}
            >
              <MapPin size={14} className={isHome ? "text-blue-700" : "text-blue-400"} />
              India
            </li>
          </ul>
        </div>

      </div>

      <div
        className={`pt-8 text-center text-sm ${isHome ? "text-slate-500/90" : "text-slate-500"}`}
      >
        © {new Date().getFullYear()} NagarSetu. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;