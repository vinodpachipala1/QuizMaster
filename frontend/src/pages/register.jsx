import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BaseUrl } from "../config/BaseUrl";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post(`${BaseUrl}/auth/register`, {
        fullName,
        email,
        password,
      });
      console.log("hello");
      navigate("/login", { state: { msg: "Registration Successful!" } });
    } catch (err) {
      console.log(err.response.data.error);
      setError(err.response.data.error);
    }
    console.log("Registering with:", { fullName, email, password });
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-yellow-100 via-pink-100 to-indigo-200 flex items-center justify-center p-4">
      <div className="absolute top-20 right-5 w-32 h-32 bg-teal-300 rounded-full opacity-50 animate-blob animation-delay-1000"></div>
      <div className="absolute bottom-20 -left-10 w-28 h-28 bg-purple-300 rounded-full opacity-50 animate-blob animation-delay-3000"></div>
      <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-yellow-300 rounded-full opacity-50 animate-blob animation-delay-5000"></div>

      <div className="relative w-full max-w-sm md:max-w-md">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
            Join Quiz Master
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-lg">
            Unlock a world of quizzes!
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4">
            {isLoading && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 to-orange-400 animate-pulse"></div>
            )}

            <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label
                  htmlFor="fullName"
                  className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center"
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white/60 hover:bg-white"
                  placeholder="Your Full Name"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center"
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white/60 hover:bg-white"
                  placeholder="Enter Email"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center"
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white/60 hover:bg-white"
                  placeholder="Choose a strong password"
                  disabled={isLoading}
                />
              </div>
              {error && (
                <p className="text-center text-base text-red-500">{error}</p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full px-4 py-2 sm:py-2.5 font-semibold text-white rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 text-sm ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="text-xs sm:text-sm">Registering...</span>
                  </div>
                ) : (
                  "Create My Account!"
                )}
              </button>
            </form>
          </div>

          <div className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gray-50/50 border-t border-gray-200/80 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-semibold text-pink-600 hover:text-pink-500 transition-colors duration-200"
              >
                Log in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;