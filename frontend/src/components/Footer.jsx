import React from "react";

function Footer() {
  return (
    <footer className="bg-slate-950 text-gray-400 py-12 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">

        <div>
          <h3 className="text-sky-400 text-xl font-bold mb-4">
            NagarSetu
          </h3>
          <p>
            Bridging the gap between citizens and authorities using AI-powered civic reporting.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li className="hover:text-sky-400 cursor-pointer">Home</li>
            <li className="hover:text-sky-400 cursor-pointer">Report Issue</li>
            <li className="hover:text-sky-400 cursor-pointer">Login</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Contact</h4>
          <p>Email: support@nagarsetu.com</p>
          <p>Phone: +91 9876543210</p>
        </div>

      </div>

      <div className="text-center mt-10 text-sm text-gray-500">
        © {new Date().getFullYear()} NagarSetu. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
