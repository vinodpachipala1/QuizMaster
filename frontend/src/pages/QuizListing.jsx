import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseUrl } from "../config/BaseUrl";
import { useNavigate } from "react-router-dom";

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const quizzesPerPage = 50;

  useEffect(() => {
    const getQuizes = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BaseUrl}/quizzes/getallquizzes`);
        console.log(res.data[0]);
        setQuizzes(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    getQuizes();
  }, []);

  const categories = ["All", ...new Set(quizzes.map((quiz) => quiz.category))];

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || quiz.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const indexOfLastQuiz = currentPage * quizzesPerPage;
  const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;
  const currentQuizzes = filteredQuizzes.slice(
    indexOfFirstQuiz,
    indexOfLastQuiz
  );
  const totalPages = Math.ceil(filteredQuizzes.length / quizzesPerPage);

  const getCategoryColor = (category) => {
    const colors = {
      Technology: "bg-blue-100 text-blue-800",
      Science: "bg-green-100 text-green-800",
      History: "bg-yellow-100 text-yellow-800",
      Geography: "bg-purple-100 text-purple-800",
      Mathematics: "bg-red-100 text-red-800",
      Sports: "bg-orange-100 text-orange-800",
      "Movies & Entertainment": "bg-pink-100 text-pink-800",
      Literature: "bg-indigo-100 text-indigo-800",
      Music: "bg-teal-100 text-teal-800",
      Politics: "bg-gray-100 text-gray-800",
      "Art & Culture": "bg-amber-100 text-amber-800",
      "Health & Medicine": "bg-emerald-100 text-emerald-800",
      Programming: "bg-cyan-100 text-cyan-800",
      General: "bg-slate-100 text-slate-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: "bg-green-100 text-green-800",
      Medium: "bg-yellow-100 text-yellow-800",
      Hard: "bg-red-100 text-red-800",
    };
    return colors[difficulty] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="from-purple-50 to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading quizzes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Discover Quizzes
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Test your knowledge with our diverse collection of quizzes. Find
            your perfect challenge and start learning today!
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600 whitespace-nowrap">
              {filteredQuizzes.length}{" "}
              {filteredQuizzes.length === 1 ? "quiz" : "quizzes"} found
            </div>
          </div>
        </div>

        {/* Quizzes Grid */}
        {filteredQuizzes.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 p-8 max-w-md mx-auto">
              <svg
                className="h-16 w-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No quizzes found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filter criteria
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Quiz Image/Header */}
                <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-600"></div>

                <div className="p-6">
                  {/* Category Badge */}
                  <div className="flex justify-between items-start mb-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        quiz.category
                      )}`}
                    >
                      {quiz.category}
                    </span>
                    {quiz.difficulty && (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                          quiz.difficulty
                        )}`}
                      >
                        {quiz.difficulty}
                      </span>
                    )}
                  </div>

                  {/* Quiz Title */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {quiz.title}
                  </h3>

                  {/* Quiz Description */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {quiz.description ||
                      "Test your knowledge with this engaging quiz!"}
                  </p>

                  {/* Quiz Metadata */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <svg
                          className="h-4 w-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {quiz.time_limit || 10}m
                      </span>
                      <span className="flex items-center">
                        <svg
                          className="h-4 w-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        {quiz.questions_count || "Multiple"} Qs
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    Start Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        <div className="mt-12 text-center">
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 p-6 inline-block">
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <span className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                {quizzes.length} Total Quizzes
              </span>
              <span className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                {categories.length - 1} Categories
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination */}

      <div className="flex justify-center items-center mt-12 space-x-2">
        {/* Previous Button */}
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="flex items-center px-4 py-2 bg-white/70 backdrop-blur-lg border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/70"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous
        </button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {Array.from({ length: totalPages }, (_, i) => {
            const page = i + 1;
            // Show first page, last page, current page, and pages around current page
            const showPage =
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1);

            if (!showPage) {
              // Show ellipsis for hidden pages
              if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="px-3 py-2 text-gray-500">
                    ...
                  </span>
                );
              }
              return null;
            }

            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === page
                    ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md"
                    : "bg-white/70 backdrop-blur-lg border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-md"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="flex items-center px-4 py-2 bg-white/70 backdrop-blur-lg border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/70"
        >
          Next
          <svg
            className="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default QuizList;
