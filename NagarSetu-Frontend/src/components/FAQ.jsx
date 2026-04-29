import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const faqs = [
  {
    q: "How does the AI classify my reported issue?",
    a: "When you upload a photo, our computer vision model analyses the image and automatically identifies the type of civic problem — pothole, waterlogging, garbage, broken infrastructure, and more. It then assigns a severity score based on visual indicators like size, spread, and risk to public safety.",
  },
  {
    q: "Which cities and departments are currently supported?",
    a: "NagarSetu is currently active across 10+ cities in Madhya Pradesh including Bhopal, Indore, Jabalpur, Gwalior, and Ujjain. We are connected to municipal corporations, PWD, traffic police, and electricity boards in these cities.",
  },
  {
    q: "How can I track my complaint after submitting it?",
    a: "Every submission gets a unique complaint ID. You can track its status — Open, In Progress, or Resolved — directly from your dashboard. You'll also receive notifications when the assigned department updates the status of your report.",
  },
  {
    q: "What if my complaint is ignored or not resolved?",
    a: "NagarSetu has an automatic escalation system. If a complaint is not acted upon within the expected resolution time, it is automatically escalated to a senior authority in the department. Critical issues are flagged for immediate attention.",
  },
  {
    q: "Is my personal information kept private?",
    a: "Yes. Your contact details are never shared with external parties. Authorities only see your complaint details and location — not your personal profile. You can also submit issues anonymously if you prefer.",
  },
  {
    q: "Can I report issues on behalf of someone else?",
    a: "Absolutely. Any registered citizen can report an issue for any location. You don't need to live in the area — if you witness a civic problem anywhere, you can report it through NagarSetu.",
  },
];

function FAQItem({ q, a, index }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      className="border border-slate-200 rounded-2xl bg-white overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left
                   hover:bg-slate-50 transition-colors duration-200 group"
        aria-expanded={open}
      >
        <span className={`text-sm font-semibold transition-colors duration-200
                          ${open ? "text-blue-800" : "text-slate-900 group-hover:text-blue-800"}`}>
          {q}
        </span>
        <motion.span
          className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center
                      transition-colors duration-200
                      ${open
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-700"
                      }`}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          {open ? <Minus size={14} /> : <Plus size={14} />}
        </motion.span>
      </button>

      {/* Answer — true height:auto animation via Framer Motion */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <p className="px-6 pb-5 pt-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FAQ() {
  return (
    <section className="py-24 bg-white px-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
            FAQ
          </span>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Frequently asked questions
          </h2>
          <p className="text-slate-600 text-lg">
            Everything you need to know before reporting your first issue.
          </p>
        </motion.div>

        {/* FAQ list */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-12 text-center p-8 rounded-2xl bg-blue-50 border border-blue-100"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <p className="text-slate-700 font-medium mb-3">
            Still have questions? We're here to help.
          </p>
          <a
            href="mailto:support@nagarsetu.com"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700
                       hover:text-blue-900 transition-colors duration-200 underline underline-offset-4"
          >
            Contact support →
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export default FAQ;