import React from "react";
import { Camera, AlertTriangle, BarChart3, ShieldCheck } from "lucide-react";

function Features() {
  return (
    <section className="py-24 bg-slate-950 text-white px-6">
      <div className="max-w-7xl mx-auto text-center">

        <h2 className="text-4xl font-bold mb-4">
          Powerful Features
        </h2>

        <p className="text-gray-400 mb-16">
          Smart technology to bridge the gap between citizens and authorities.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Feature 1 */}
          <div className="bg-white/5 p-8 rounded-xl border border-white/10 hover:border-sky-500 transition duration-300 hover:-translate-y-2">
            <Camera className="mb-4 text-sky-400" size={36} />
            <h3 className="text-xl font-semibold mb-3">
              AI Image Detection
            </h3>
            <p className="text-gray-400">
              Automatically detects potholes, traffic, and sewage issues from uploaded images.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/5 p-8 rounded-xl border border-white/10 hover:border-sky-500 transition duration-300 hover:-translate-y-2">
            <AlertTriangle className="mb-4 text-sky-400" size={36} />
            <h3 className="text-xl font-semibold mb-3">
              Priority-Based Routing
            </h3>
            <p className="text-gray-400">
              Critical issues are automatically prioritized and escalated.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/5 p-8 rounded-xl border border-white/10 hover:border-sky-500 transition duration-300 hover:-translate-y-2">
            <BarChart3 className="mb-4 text-sky-400" size={36} />
            <h3 className="text-xl font-semibold mb-3">
              Real-Time Tracking
            </h3>
            <p className="text-gray-400">
              Track complaint status from submission to resolution.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white/5 p-8 rounded-xl border border-white/10 hover:border-sky-500 transition duration-300 hover:-translate-y-2">
            <ShieldCheck className="mb-4 text-sky-400" size={36} />
            <h3 className="text-xl font-semibold mb-3">
              Transparent System
            </h3>
            <p className="text-gray-400">
              Ensures accountability and transparency in civic issue resolution.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Features;
