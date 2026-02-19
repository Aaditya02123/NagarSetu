import React from "react";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import Stats from "../components/Stats";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

function Home(){
    return(
    <>
        <Navbar />
        <Hero />
        <HowItWorks/>
        <Features/>
        <Stats/>
        <CTA/>
        <Footer/>
    </>
    );
}
export default Home;