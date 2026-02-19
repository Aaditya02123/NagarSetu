import React, {useState} from "react";

function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState("Citizen");
    const handleSubmit = (e) => {
        e.preventDefault();
        if(!email || !password){
            console.log("Login failed : Fields are empty.")
            alert("Please fill all fields")
            return;
        }
        console.log("✅ Login Successful!");
        console.log("Email:", email);
        console.log("Role:", role);
        alert("Login Successful.")
    }

    return (
        <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-6">
            
            <div className="bg-white/5 backdrop-blur-lg p-10 rounded-2xl border border-white/10 w-full max-w-md shadow-xl">
            
            {/* Heading */}
            <h2 className="text-3xl font-bold text-center mb-2">
                Welcome Back
            </h2>
            <p className="text-gray-400 text-center mb-8">
                Login to continue to NagarSetu
            </p>

            <form onSubmit = {handleSubmit} className="space-y-6">

                {/*Role */}
                <div>
                    <label className = "block text-sm md-2 text gray-300">
                        Select Role
                    </label>
                    <div className = "flex bg-slate-800 rounded-lg p-1">
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
                {/* Email */}
                <div>
                <label className="block text-sm mb-2 text-gray-300">
                    Email
                </label>
                <input
                    type="email"
                    value={email}
                    placeholder="Enter your email"
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded-lg bg-slate-800 border border-gray-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400 outline-none transition"
                />
                </div>

                {/* Password */}
                <div>
                <label className="block text-sm mb-2 text-gray-300">
                    Password
                </label>

                <div className="relative">
                    <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    placeholder="Enter your password"
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 rounded-lg bg-slate-800 border border-gray-600 focus:border-sky-400 focus:ring-2 focus:ring-sky-400 outline-none transition"
                    />

                    {/* Toggle */}
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-sm text-sky-400 hover:text-sky-300"
                    >
                    {showPassword ? "Hide" : "Show"}
                    </button>
                </div>
                </div>

                {/* Login Button */}
                <button
                type="submit"
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 transition duration-300 rounded-lg font-semibold shadow-lg shadow-sky-500/30 hover:scale-[1.02]"
                >
                Login
                </button>
                
                {/* Divider */}
                <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="mx-4 text-gray-400 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-600"></div>
                </div>

                {/* Google Login */}
                <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition duration-300"
                >
                {/* Google SVG Icon */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="w-5 h-5"
                >
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.22 9.22 3.6l6.9-6.9C35.64 2.1 30.2 0 24 0 14.64 0 6.36 5.48 2.44 13.44l8.02 6.22C12.42 13.32 17.7 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.1 24.5c0-1.64-.14-3.22-.4-4.76H24v9.02h12.44c-.54 2.9-2.2 5.36-4.7 7.04l7.24 5.62C43.94 36.9 46.1 31.2 46.1 24.5z"/>
                    <path fill="#FBBC05" d="M10.46 28.66c-1-2.9-1-6.02 0-8.92l-8.02-6.22C-1.02 18.1-1.02 29.9 2.44 34.48l8.02-5.82z"/>
                    <path fill="#34A853" d="M24 48c6.2 0 11.64-2.04 15.52-5.56l-7.24-5.62c-2 1.34-4.56 2.12-8.28 2.12-6.3 0-11.58-3.82-13.54-9.16l-8.02 5.82C6.36 42.52 14.64 48 24 48z"/>
                </svg>

                Continue with Google
                </button>

            </form>

            {/* Footer Text */}
            <p className="text-center text-sm text-gray-400 mt-6">
                Don’t have an account? 
                <span className="text-sky-400 cursor-pointer hover:underline ml-1">
                Register
                </span>
            </p>

            </div>

        </section>
    );
}
export default Login;