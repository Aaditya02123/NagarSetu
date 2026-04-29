import React from "react";
import { Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    initials: "RS",
    name: "Riya Sharma",
    role: "Resident",
    city: "Bhopal",
    color: "bg-blue-100 text-blue-800",
    quote:
      "I reported a massive pothole near my colony at 9 PM. By the next afternoon, a crew was already there filling it. I couldn't believe it — three years of complaints to the municipality and nothing happened. NagarSetu did it in under 24 hours.",
    rating: 5,
  },
  {
    initials: "AK",
    name: "Arjun Kulkarni",
    role: "Shop Owner",
    city: "Indore",
    color: "bg-green-100 text-green-800",
    quote:
      "Waterlogging outside my shop was killing business every monsoon. Uploaded a photo, the AI tagged it as 'high priority flooding risk', and the drainage team came within two days. The platform actually routes complaints to the right department — that's what makes it different.",
    rating: 5,
  },
  {
    initials: "PM",
    name: "Priya Mehra",
    role: "College Student",
    city: "Jabalpur",
    color: "bg-purple-100 text-purple-800",
    quote:
      "The dashboard tracking is what I love most. You can actually see your complaint move from 'Open' to 'In Progress' to 'Resolved'. It's not a black hole like other portals. Feels like someone is actually accountable.",
    rating: 5,
  },
];

function StarRating({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="#FBBF24">
          <path d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.44L7 8.885 3.91 10.51l.59-3.44L2 4.635l3.455-.505z" />
        </svg>
      ))}
    </div>
  );
}

// Shared card animation variant
const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.1,
      ease: "easeOut",
    },
  }),
};

function Testimonials() {
  return (
    <section className="py-24 bg-gradient-to-b from-[#F8FAFC] to-[#EEF2FF] px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Citizens who saw the difference
          </h2>
          <p className="text-slate-600 text-lg max-w-xl mx-auto">
            Real stories from people who reported issues and watched them get fixed.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map(({ initials, name, role, city, color, quote, rating }, i) => (
            <motion.div
              key={name}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative flex flex-col bg-white rounded-2xl border border-slate-200
                          shadow-sm hover:shadow-md transition-shadow duration-300 p-8"
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 opacity-10">
                <Quote size={48} className="text-blue-600" />
              </div>

              {/* Stars */}
              <StarRating count={rating} />

              {/* Quote text */}
              <p className="text-slate-700 leading-relaxed mt-5 mb-8 text-sm flex-1">
                "{quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${color}`}>
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{name}</p>
                  <p className="text-xs text-slate-500">{role} · {city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom aggregate */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full
                          bg-white border border-slate-200 shadow-sm">
            <StarRating count={5} />
            <span className="text-sm font-semibold text-slate-900">4.9 out of 5</span>
            <span className="text-sm text-slate-500">· Based on 340+ citizen reviews</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Testimonials;