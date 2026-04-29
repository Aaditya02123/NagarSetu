import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';

import Home           from "./pages/Home";
import Report         from "./pages/Report";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import About          from "./pages/About";
import UserDashboard  from "./pages/UserDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound       from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about"    element={<About />} />

        {/* Citizen — must be logged in */}
        <Route path="/report"    element={<ProtectedRoute><Report /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

        {/* Admin — must be logged in AND role === "admin" */}
        <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;