import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BaseUrl } from "../config/BaseUrl";
import axios from "axios";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMsg, SetSuccessMsg] = useState(useLocation().state?.msg || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    SetSuccessMsg("");
    e.preventDefault();
    setIsLoading(true);
    try{
      const res = await axios.post(`${BaseUrl}/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      const token = localStorage.getItem("token")
      if(token){
        console.log(token);
        navigate("/");
      }
    }
    catch(err){
      console.log(err);
      if(err.response.data.error){
        setError(err.response.data.error);
      } else {
        setError("Internal Server Error")
      }
      
    }
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-yellow-100 via-pink-100 to-indigo-200 flex items-center justify-center p-4">
      <div className="hidden sm:block absolute top-10 -left-10 w-40 h-40 bg-pink-300 rounded-full opacity-50 animate-blob"></div>
      <div className="hidden sm:block absolute top-1/2 -right-10 w-32 h-32 bg-teal-300 rounded-full opacity-50 animate-blob animation-delay-2000"></div>
      <div className="hidden sm:block absolute bottom-10 left-20 w-24 h-24 bg-purple-300 rounded-full opacity-50 animate-blob animation-delay-4000"></div>

      <div className="relative w-full max-w-md mx-auto">
        
        <div className="text-center mb-4 sm:mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent px-2">
            Quiz Master
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-lg px-2">
            Test Your Knowledge, Challenge Your Mind
          </p>
        </div>

       
        <div className="bg-white/90 backdrop-blur-lg rounded-xl sm:rounded-xl shadow-lg sm:shadow-2xl border border-white/20 overflow-hidden transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-300">
          <div className="p-4 sm:p-8 space-y-3 sm:space-y-6">
            
            {isLoading && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 to-orange-400 animate-pulse"></div>
            )}

            <form className="space-y-3 sm:space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center">
                  <svg className="w-3 h-3 sm:w-5 sm:h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm border border-gray-200 rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white/80 hover:bg-white"
                  placeholder="Enter Email"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center">
                  <svg className="w-3 h-3 sm:w-5 sm:h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm border border-gray-200 rounded-lg sm:rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white/80 hover:bg-white"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm space-y-2 sm:space-y-0">
                <label className="flex items-center">
                  <input type="checkbox" className="w-3 h-3 sm:w-4 sm:h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500" />
                  <span className="ml-1 sm:ml-2 text-gray-600 text-xs sm:text-sm">Remember me</span>
                </label>
                <a href="/forgot-password" className="text-pink-600 hover:text-pink-500 font-medium transition-colors duration-200 text-xs sm:text-sm text-center sm:text-right">
                  Forgot password?
                </a>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full px-4 py-2 sm:py-3 font-semibold text-white rounded-lg sm:rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 text-sm ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </div>
                ) : (
                  "Start Quizzing!"
                )}
              </button>
              
            </form>{successMsg && 
            <p className="text-green-500 text-center">{successMsg}</p>}
            {error && <p className="text-center text-base text-red-500">{error}</p>}
          </div>
          
          <div className="px-4 py-2 sm:px-8 sm:py-4 bg-gray-50/50 border-t border-gray-200/80 text-center">
            <p className="text-xs text-gray-600">
              New to Quiz Master?{" "}
              <a href="/register" className="font-semibold text-pink-600 hover:text-pink-500 transition-colors duration-200">
                Join the challenge!
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;