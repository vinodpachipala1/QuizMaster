import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full mt-14">
      <div className="w-full py-6 bg-white/30 backdrop-blur-xl border-t border-white/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-700">
            <p>&copy; 2025 QuizMaster. All rights reserved.</p>
            <p>Made with ❤️ by Team QuizMaster</p>
          </div>

          <nav className="flex items-center space-x-6">
            <Link
              to="/privacy"
              className="text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors duration-300"
            >
              Privacy Policy
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors duration-300"
            >
              Contact Us
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
