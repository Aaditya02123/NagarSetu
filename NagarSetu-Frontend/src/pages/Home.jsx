import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import Stats from "../components/Stats";
import CTA from "../components/CTA";
import Testimonial from "../components/Testimonial";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f7fb] text-slate-900">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(14,116,144,0.10),transparent_30%),radial-gradient(circle_at_top_right,rgba(30,64,175,0.10),transparent_32%),linear-gradient(to_bottom,#f8fbff,#eef4fb_45%,#f7fafc)]" />
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Stats />
      <Testimonial />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

export default Home;
