import React from "react";

function About() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-6">

      <div className="max-w-5xl mx-auto space-y-12">

        {/* Heading */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About NagarSetu
          </h1>
          <p className="text-gray-400 text-lg">
            Bridging Citizens and Authorities through Smart Civic Reporting
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8 space-y-4">
          <h2 className="text-2xl font-semibold text-sky-400">
            What is NagarSetu?
          </h2>
          <p className="text-gray-300 leading-relaxed">
            NagarSetu is an AI-powered civic issue reporting platform that enables 
            citizens to report real-time problems such as potholes, traffic congestion, 
            sewage overflow, and infrastructure damage. By leveraging image-based 
            analysis and automated prioritization, the platform ensures faster and 
            smarter resolution of complaints.
          </p>
        </div>

        {/* Problem Statement */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8 space-y-4">
          <h2 className="text-2xl font-semibold text-sky-400">
            The Problem
          </h2>
          <p className="text-gray-300 leading-relaxed">
            Traditional complaint systems are often slow, manual, and lack 
            prioritization mechanisms. Citizens struggle to track complaint 
            status, while authorities face difficulties in identifying urgent 
            issues efficiently.
          </p>
        </div>

        {/* Solution */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8 space-y-4">
          <h2 className="text-2xl font-semibold text-sky-400">
            Our Solution
          </h2>
          <p className="text-gray-300 leading-relaxed">
            NagarSetu uses AI to analyze uploaded images and categorize 
            complaints automatically. The system assigns priority scores 
            based on severity and location impact, ensuring critical 
            issues receive immediate attention.
          </p>
        </div>

        {/* How It Works */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8 space-y-4">
          <h2 className="text-2xl font-semibold text-sky-400">
            How It Works
          </h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Citizen uploads an image of a civic issue.</li>
            <li>AI model analyzes and categorizes the problem.</li>
            <li>Complaint is prioritized automatically.</li>
            <li>Authorities receive and act on the issue.</li>
            <li>Citizen tracks status in real time.</li>
          </ul>
        </div>

        {/* Vision */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8 space-y-4">
          <h2 className="text-2xl font-semibold text-sky-400">
            Our Vision
          </h2>
          <p className="text-gray-300 leading-relaxed">
            To create smarter cities by enabling transparent, efficient, 
            and AI-driven civic governance that empowers both citizens 
            and authorities.
          </p>
        </div>

      </div>

    </section>
  );
}

export default About;