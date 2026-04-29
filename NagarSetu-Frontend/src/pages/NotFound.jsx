import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center px-6">
      <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
      
      <h2 className="text-2xl font-semibold text-slate-800 mb-2">
        Page Not Found
      </h2>
      
      <p className="text-slate-500 mb-6 max-w-md">
        The page you're looking for doesn’t exist or has been moved.
      </p>

      <Link
        to="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Go Back Home
      </Link>
    </div>
  );
}

export default NotFound;