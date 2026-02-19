import React from "react";
import { Upload, Brain, CheckCircle } from "lucide-react";

function HowItWorks() {
  return (
    <section className="py-24 bg-slate-900 text-white px-6">
      <div className="max-w-6xl mx-auto text-center">

        <h2 className="text-4xl font-bold mb-16">
          How NagarSetu Works
        </h2>

        <div className="grid md:grid-cols-3 gap-12">

          {/* Step 1 */}
          <div className="bg-white/5 p-8 rounded-xl border border-white/10 hover:border-sky-500 transition duration-300">
            <Upload className="mx-auto mb-6 text-sky-400" size={40} />
            <h3 className="text-xl font-semibold mb-4">
              Upload Issue
            </h3>
            <p className="text-gray-400">
              Take a photo of potholes, traffic or sewage issues and upload instantly.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white/5 p-8 rounded-xl border border-white/10 hover:border-sky-500 transition duration-300">
            <Brain className="mx-auto mb-6 text-sky-400" size={40} />
            <h3 className="text-xl font-semibold mb-4">
              AI Analysis
            </h3>
            <p className="text-gray-400">
              Our AI system analyzes the issue and assigns priority automatically.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white/5 p-8 rounded-xl border border-white/10 hover:border-sky-500 transition duration-300">
            <CheckCircle className="mx-auto mb-6 text-sky-400" size={40} />
            <h3 className="text-xl font-semibold mb-4">
              Authority Action
            </h3>
            <p className="text-gray-400">
              Authorities receive the complaint and resolve it based on priority.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
