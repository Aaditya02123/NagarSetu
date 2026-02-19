import React, { useState } from "react";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("citizen");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      alert("❌ Please fill all required fields")
      console.log("❌ Please fill all required fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("❌ Passwords do not match")  
      console.log("❌ Passwords do not match");
      return;
    }
    alert("✅ Registration Successful");
    console.log("✅ Registration Successful");
    console.log({ firstName, lastName, email, phone, role });
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-6">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto space-y-8"
      >

        {/* -------- Personal Information Card -------- */}
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-xl">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold">
              Personal Information
            </h2>
            <p className="text-sm text-gray-400">
              Enter your details to create your account
            </p>
          </div>

          <div className="p-6 space-y-6">

            {/* First & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div className="space-y-2">
                <label className="text-sm text-gray-300">
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-800 border border-gray-600 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none"
                  placeholder="Your First Name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-800 border border-gray-600 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none"
                  placeholder="Your Last Name"
                />
              </div>

            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm text-gray-300">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-800 border border-gray-600 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none"
                placeholder="Your Email Address"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm text-gray-300">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-800 border border-gray-600 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none"
                placeholder="Enter Password"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-300">
                Confirm Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-800 border border-gray-600 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none"
                placeholder="Confirm Password"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm text-gray-300">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-800 border border-gray-600 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none"
                placeholder="Enter 10-digit phone number"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm mb-3 text-gray-300">
                Select Role
              </label>

              <div className="flex bg-slate-800 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setRole("citizen")}
                  className={`flex-1 py-2 rounded-md transition ${
                    role === "citizen"
                      ? "bg-sky-500 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Citizen
                </button>

                <button
                  type="button"
                  onClick={() => setRole("authority")}
                  className={`flex-1 py-2 rounded-md transition ${
                    role === "authority"
                      ? "bg-sky-500 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Authority
                </button>
              </div>
            </div>

          </div>
        </div>

       

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-4 bg-sky-500 hover:bg-sky-600 rounded-lg font-semibold transition duration-300 shadow-lg shadow-sky-500/30"
        >
          Create Account
        </button>

      </form>
    </section>
  );
}

export default Register;
