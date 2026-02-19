import React from "react";
import { useState, useEffect } from "react";

function Hero() {
    const images = [
    "/images/traffic.jpg",
    "/images/pothole.jpg",
    "/images/waterlogging.jpg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }, 2000); // change every 4 seconds

    return () => clearInterval(interval);
  }, []);
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-6"
              style={{
              backgroundImage: `url(${images[currentIndex]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
      }}>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.15),_transparent_60%)]"></div>

      <div className="relative z-10 text-center max-w-4xl">

        {/* Badge */}
        <div className="mb-6 inline-block px-4 py-1 text-sm bg-sky-500/20 text-sky-400 rounded-full border border-sky-500/30">
          AI Powered Civic Reporting
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
          Report Civic Issues <br />
          <span className="text-sky-400">Smarter & Faster</span>
        </h1>

        {/* Subtitle */}
        <p className="text-gray-300 text-lg md:text-xl mb-10">
          Upload images of potholes, traffic congestion or sewage problems.
          NagarSetu connects you directly with authorities using AI-based
          prioritization.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">

          <button className="px-8 py-3 bg-sky-500 hover:bg-sky-600 transition duration-300 rounded-lg font-semibold shadow-lg shadow-sky-500/30">
            Report an Issue
          </button>

          <button className="px-8 py-3 border border-gray-500 hover:border-sky-400 hover:text-sky-400 transition duration-300 rounded-lg font-semibold">
            Learn More
          </button>

        </div>

      </div>
    </section>
  );
}

export default Hero;
