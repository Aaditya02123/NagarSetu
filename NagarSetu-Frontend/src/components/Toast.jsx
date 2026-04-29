import React, { useEffect } from "react";
import { CheckCircle, XCircle, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * Toast notification component.
 *
 * Usage:
 *   setToast({ type: "success" | "error", message: "..." })
 *
 * Optional link field:
 *   setToast({
 *     type: "success",
 *     message: "Issue submitted successfully.",
 *     link: { label: "Track on Dashboard", to: "/dashboard" }
 *   })
 *
 * toast.link.to   — internal react-router path  (e.g. "/dashboard")
 * toast.link.href — external URL                (e.g. "https://...")
 * Only one of `to` or `href` is needed.
 */
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";

  const linkClass = `inline-flex items-center gap-1 font-semibold underline underline-offset-2
    mt-1 text-xs transition-opacity hover:opacity-70
    ${isSuccess ? "text-green-700" : "text-red-700"}`;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] flex items-start gap-3 px-4 py-3
                   rounded-xl shadow-xl border max-w-sm w-full animate-fade-in
                   ${isSuccess
                     ? "bg-green-50 border-green-200 text-green-800"
                     : "bg-red-50 border-red-200 text-red-800"
                   }`}
    >
      {isSuccess
        ? <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
        : <XCircle    size={18} className="text-red-500 mt-0.5 shrink-0" />
      }

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.message}</p>

        {/* Optional link — renders below the message */}
        {toast.link && (
          toast.link.to ? (
            <Link
              to={toast.link.to}
              onClick={onClose}
              className={linkClass}
            >
              {toast.link.label}
              <ArrowRight size={11} />
            </Link>
          ) : (
            <a
              href={toast.link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className={linkClass}
            >
              {toast.link.label}
              <ArrowRight size={11} />
            </a>
          )
        )}
      </div>

      <button onClick={onClose} className="shrink-0 opacity-50 hover:opacity-100 transition">
        <X size={14} />
      </button>
    </div>
    );
}

export default Toast;