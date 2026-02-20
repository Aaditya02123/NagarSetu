import React, { useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const[menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="fixed w-full z-50 backdrop-blur-lg bg-white/5 border-b border-white/10">

      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-slate-900 text-white flex flex-col items-center space-y-6 py-6 shadow-lg">
          
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>

          <Link to="/report" onClick={() => setMenuOpen(false)}>
            Report
          </Link>

          <Link to="/login" onClick={() => setMenuOpen(false)}>
            Login
          </Link>

          <Link to="/register" onClick={() => setMenuOpen(false)}>
            Register
          </Link>

          <Link to="/register" onClick={() => setMenuOpen(false)}>
            About Us
          </Link>

        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <h1 className="text-2xl font-bold text-sky-400">
          NagarSetu
        </h1>
        <button
          className = "md:hidden text-gray-300 text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* Links */}
        <div className="hidden md:flex items-center space-x-8 text-gray-300">

          <Link 
            to="/" 
            className="hover:text-sky-400 transition duration-300"
          >
            Home
          </Link>

          <Link 
            to="/login" 
            className="hover:text-sky-400 transition duration-300"
          >
            Login
          </Link>

          <Link 
            to="/Register" 
            className="hover:text-sky-400 transition duration-300"
          >
            Register
          </Link>

          <Link to="/report" className="hover:text-sky-400 transition duration-300">Report</Link>

          <Link to="/about" className="hover:text-sky-400 transition duration-300">About Us</Link>


        </div>
      </div>
    </nav>
  );
}

export default Navbar;
