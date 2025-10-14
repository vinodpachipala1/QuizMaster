import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { BaseUrl } from "../config/BaseUrl";

const Header = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const verifyLogin = async () => {
        try {
          const res = await axios.get(`${BaseUrl}/auth/verifyLogin`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setIsLoggedIn(true);
          setUserData(res.data);
        } catch (err) {
          console.log(err);
          localStorage.removeItem("token");
        }
      };
      verifyLogin();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserData(null);
  };

  const linkStyle =
    "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300";
  const activeLinkStyle = "text-purple-700 bg-white/50 shadow-sm";
  const inactiveLinkStyle =
    "text-gray-700 hover:text-purple-700 hover:bg-white/40";

  // Navigation links without the welcome message
  const navLinks = (
    <>
      <Link
        to="/"
        className={`${linkStyle} ${
          location.pathname === "/" ? activeLinkStyle : inactiveLinkStyle
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        Home
      </Link>
      <Link
        to="/quizzes"
        className={`${linkStyle} ${
          location.pathname === "/quizzes" ? activeLinkStyle : inactiveLinkStyle
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        Browse Quizzes
      </Link>

      {isLoggedIn && userData ? (
        <>
          <Link
            to="/dashboard"
            className={`${linkStyle} ${
              location.pathname === "/dashboard"
                ? activeLinkStyle
                : inactiveLinkStyle
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/create-quiz"
            className="text-sm font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-5 py-2 rounded-full hover:shadow-lg transition-shadow duration-300 text-center"
            onClick={() => setIsMenuOpen(false)}
          >
            Create Quiz
          </Link>
        </>
      ) : (
        <>
          <Link
            to="/login"
            className="text-sm font-semibold bg-white/40 text-purple-700 px-5 py-2 rounded-full hover:bg-white/80 transition-all duration-300 shadow-sm text-center"
            onClick={() => setIsMenuOpen(false)}
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-5 py-2 rounded-full hover:shadow-lg transition-shadow duration-300 text-center"
            onClick={() => setIsMenuOpen(false)}
          >
            Sign Up
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="absolute top-0 left-0 w-full z-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="w-full bg-white/30 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md transform group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-xl">Q</span>
              </div>
              <h1 className="text-2xl font-bold text-purple-600 transition-colors duration-300">
                QuizMaster
              </h1>
            </div>
            
            
            <nav className="hidden md:flex items-center space-x-2">
              {navLinks}

              {/* User Avatar Dropdown */}
              {isLoggedIn && userData && (
                <div className="flex items-center space-x-2 ml-2">
                  <div className="relative group">
                    <button className="flex items-center space-x-2 bg-white/50 px-3 py-2 rounded-full hover:bg-white/70 transition-all duration-300">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {userData.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {userData.name.split(" ")[0]}
                      </span>
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <div className="px-4 py-2 border-b border-gray-200/50">
                        <p className="text-sm font-semibold text-gray-800">
                          {userData.name}
                        </p>
                        <p className="text-xs text-gray-600">Welcome back!</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </nav>
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              {isLoggedIn && userData && (
                <span className="text-sm font-semibold text-gray-700 hidden sm:block">
                  Hi, {userData.name}
                </span>
              )}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Open menu"
                className="p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-white/50"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={
                      isMenuOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16m-7 6h7"
                    }
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <nav className="md:hidden mt-2 bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg p-4">
            {/* Welcome Message (Mobile Only - Top) */}
            {isLoggedIn && userData && (
              <div className="text-center border-b border-gray-200/80 pb-4 mb-4">
                <span className="font-semibold text-gray-800">
                  Welcome, {userData.name}!
                </span>
              </div>
            )}
            <div className="flex flex-col items-stretch space-y-3">
              {navLinks}
              {isLoggedIn && userData && (
                <button
                  onClick={handleLogout}
                  className={`${linkStyle} ${inactiveLinkStyle} text-center w-full`}
                >
                  Logout
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
