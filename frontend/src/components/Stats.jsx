import React from "react";

function Stats() {
  return (
    <section className="py-20 bg-slate-900 text-white px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10 text-center">

        <div>
          <h3 className="text-4xl font-bold text-sky-400">1200+</h3>
          <p className="text-gray-400 mt-2">Issues Reported</p>
        </div>

        <div>
          <h3 className="text-4xl font-bold text-sky-400">980+</h3>
          <p className="text-gray-400 mt-2">Issues Resolved</p>
        </div>

        <div>
          <h3 className="text-4xl font-bold text-sky-400">24/7</h3>
          <p className="text-gray-400 mt-2">AI Monitoring</p>
        </div>

        <div>
          <h3 className="text-4xl font-bold text-sky-400">15+</h3>
          <p className="text-gray-400 mt-2">Departments Connected</p>
        </div>

      </div>
    </section>
  );
}

export default Stats;
