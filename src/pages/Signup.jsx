import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { StarsBackground } from "../components/animate-ui/components/backgrounds/stars.jsx";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        login(data.user);
        navigate("/");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StarsBackground className="min-h-screen flex bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Back button */}
      <Link
        to="/"
        className="absolute top-4 sm:top-6 left-4 sm:left-6 text-white hover:text-gray-300 transition z-50"
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
      </Link>

      {/* Left side info section */}
      <div className="hidden xl:flex flex-1 items-center justify-center p-8 relative z-10">
        <div className="text-center text-white">
          <h1 className="text-4xl xl:text-5xl font-bold mb-6 animate-pulse">Join AuraStore</h1>
          <p className="text-lg xl:text-xl text-gray-300 mb-8">
            Start your fashion journey today
          </p>
          <div className="space-y-4 max-w-sm mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 xl:p-4 flex items-center space-x-3 xl:space-x-4 hover:scale-105 transition-transform duration-300">
              <div className="text-white">
                <svg className="w-6 h-6 xl:w-8 xl:h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm xl:text-base font-semibold">Personalized Style</p>
                <p className="text-xs xl:text-sm text-gray-300">Curated just for you</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 xl:p-4 flex items-center space-x-3 xl:space-x-4 hover:scale-105 transition-transform duration-300">
              <div className="text-white">
                <svg className="w-6 h-6 xl:w-8 xl:h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm xl:text-base font-semibold">Exclusive Access</p>
                <p className="text-xs xl:text-sm text-gray-300">
                  Early access to new drops
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 xl:p-4 flex items-center space-x-3 xl:space-x-4 hover:scale-105 transition-transform duration-300">
              <div className="text-white">
                <svg className="w-6 h-6 xl:w-8 xl:h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm xl:text-base font-semibold">Member Rewards</p>
                <p className="text-xs xl:text-sm text-gray-300">
                  Earn points on every purchase
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side signup form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 transform hover:scale-105 transition-transform duration-300">
            <div className="text-center mb-6 sm:mb-8">
              <img
                src="/final_logo_2.png"
                alt="AuraStore"
                className="h-10 sm:h-12 mx-auto mb-4 sm:mb-6"
              />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Create Account
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Join our community of style enthusiasts
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Create a password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 sm:py-3 text-sm sm:text-base rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-sm sm:text-base text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-purple-600 font-semibold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </StarsBackground>
  );
}

export default Signup;
