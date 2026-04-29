import React from "react";
import { Upload, Brain, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    Icon: Upload,
    step: "01",
    title: "Upload the issue",
    desc: "Take a photo of the civic problem and upload it instantly through the app.",
    color: "text-blue-800 bg-blue-50 border border-blue-200",
  },
  {
    Icon: Brain,
    step: "02",
    title: "AI analysis",
    desc: "Our AI model analyses the image, categorises the issue and assigns a priority score.",
    color: "text-purple-800 bg-purple-50 border border-purple-200",
  },
  {
    Icon: CheckCircle,
    step: "03",
    title: "Authority action",
    desc: "The right department receives the complaint and resolves it based on priority.",
    color: "text-green-800 bg-green-50 border border-green-200",
  },
];

function HowItWorks() {
  return (
    <section className="py-24 bg-gradient-to-b from-[#F8FAFC] to-[#EEF2FF] px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
            How it works
          </span>
          <h2 className="text-4xl font-bold text-slate-900">
            Three steps to a better city
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-14 left-1/3 right-1/3 h-px bg-slate-200 z-0" />

          {steps.map(({ Icon, step, title, desc, color }, i) => (
            <motion.div
              key={step}
              className="relative z-10 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
            >
              {/* Icon — subtle scale on hover */}
              <motion.div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-sm ${color}`}
                whileHover={{ scale: 1.08, transition: { duration: 0.2 } }}
              >
                <Icon size={24} />
              </motion.div>

              <span className="text-xs font-bold text-slate-500 tracking-widest mb-2">STEP {step}</span>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{title}</h3>
              <p className="text-slate-600 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;