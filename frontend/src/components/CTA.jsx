import React from "react";
import { useNavigate } from "react-router-dom";

function CTA() {
  const navigate = useNavigate();
  return (
    <section className="py-24 bg-gradient-to-r from-sky-600 to-blue-700 text-white text-center px-6">
      <div className="max-w-4xl mx-auto">

        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Make Your City Better Today
        </h2>

        <p className="text-lg mb-10 text-blue-100">
          Report civic problems instantly and help authorities act faster.
        </p>

        <button
          onClick={() => navigate("/report")}
          className="px-10 py-4 bg-white text-blue-700 font-semibold rounded-lg shadow-lg hover:scale-105 transition duration-300"
        >
          Report an Issue Now
        </button>


      </div>
    </section>
  );
}

export default CTA;
