import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BaseUrl } from "../config/BaseUrl";

const Home = () => {
  const navigate = useNavigate();
  const [user, SetUser] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const VerifyLogin = async () => {
        try {
          const res = await axios.get(`${BaseUrl}/auth/verifyLogin`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log(res.data);
        } catch (err) {
          console.log(err);
          localStorage.removeItem("token");
        }
      };
      VerifyLogin();
      SetUser(true);
    }
  }, []);

  return (
    <div>
      <div className="relative w-full max-w-6xl mx-auto text-center px-4 sm:px-6">
        <div className="mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <span className="text-3xl sm:text-4xl">🎯</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 bg-clip-text text-transparent px-2 mb-4">
            Quiz Master
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Test Your Knowledge, Challenge Your Mind
          </p>
        </div>

        {!user && (
          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8 max-w-md mx-auto">
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-pink-200 text-sm sm:text-base sm:min-w-[140px]"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-purple-200 text-sm sm:text-base sm:min-w-[140px]"
            >
              Register
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 max-w-md mx-auto">
          <button
            onClick={() => navigate("/quizzes")}
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-green-200 text-sm sm:text-base sm:min-w-[140px]"
          >
            Take Quiz
          </button>
          <button
            onClick={() => navigate("/create-quiz")}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-orange-200 text-sm sm:text-base sm:min-w-[140px]"
          >
            Create Quiz
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 transform hover:scale-105 transition-all duration-300 mx-2 sm:mx-0">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-lg mb-2">
              Create Quizzes
            </h3>
            <p className="text-gray-600 text-sm">
              Design custom quizzes with multiple question types and challenges
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 transform hover:scale-105 transition-all duration-300 mx-2 sm:mx-0">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-lg mb-2">
              Take Quizzes
            </h3>
            <p className="text-gray-600 text-sm">
              Challenge yourself with exciting quizzes from our community
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 transform hover:scale-105 transition-all duration-300 mx-2 sm:mx-0">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-lg mb-2">
              Track Progress
            </h3>
            <p className="text-gray-600 text-sm">
              Monitor your scores and improve your knowledge over time
            </p>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 bg-white/80 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto shadow-lg border border-white/20 mx-4 sm:mx-auto">
          <h3 className="font-bold text-gray-800 text-lg sm:text-xl mb-3">
            Ready to Challenge Your Mind?
          </h3>
          <p className="text-gray-600 text-sm sm:text-base">
            Join thousands of quiz enthusiasts testing their knowledge across
            various topics. From science to pop culture, there's always
            something new to learn!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;