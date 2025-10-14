import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BaseUrl } from "../config/BaseUrl";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [createdQuizzes, setCreatedQuizzes] = useState([]);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState([]);
  const [quizAttemptCounts, setQuizAttemptCounts] = useState({});
  const [quizAttemptDetails, setQuizAttemptDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [modalView, setModalView] = useState("questions"); // "questions" or "stats"

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Verify user and get user data
        const res = await axios.get(`${BaseUrl}/auth/verifyLogin`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(res.data);

        const userId = res.data.id;
        console.log("User ID:", userId);

        // Fetch user's created quizzes and attempts in parallel
        const createdQuizzesRes = await axios.get(
          `${BaseUrl}/quizzes/ByUserId/${userId}`
        );
        const attempted = await axios.get(
          `${BaseUrl}/attempts/getAttemptsByUserId/${userId}`
        );

        console.log("Attempted Quizzes Response:", attempted.data);

        // Process attempted quizzes - show each quiz only once with best score
        const processedAttempts = processAttemptedQuizzes(attempted.data || []);
        setAttemptedQuizzes(processedAttempts);

        console.log("Created Quizzes:", createdQuizzesRes.data);

        const createdQuizzesData = createdQuizzesRes.data || [];
        setCreatedQuizzes(createdQuizzesData);

        // Fetch attempt counts and details for each created quiz
        if (createdQuizzesData.length > 0) {
          const attemptCounts = {};
          const attemptDetails = {};

          for (const quiz of createdQuizzesData) {
            try {
              const attemptsRes = await axios.get(
                `${BaseUrl}/attempts/getAttemptsByQuizId/${quiz.id}`
              );
              const attempts = attemptsRes.data || [];
              attemptCounts[quiz.id] = attempts.length;

              // Calculate stats for this quiz and sort attempts by time
              if (attempts.length > 0) {
                // Sort attempts by attempted_at (newest first)
                const sortedAttempts = attempts.sort(
                  (a, b) => new Date(b.attempted_at) - new Date(a.attempted_at)
                );

                attemptDetails[quiz.id] = {
                  totalAttempts: attempts.length,
                  attempts: sortedAttempts.slice(0, 10), // Last 10 attempts
                };
              } else {
                attemptDetails[quiz.id] = {
                  totalAttempts: 0,
                  attempts: [],
                };
              }
            } catch (err) {
              console.error(
                `Error fetching attempts for quiz ${quiz.id}:`,
                err
              );
              attemptCounts[quiz.id] = 0;
              attemptDetails[quiz.id] = {
                totalAttempts: 0,
                attempts: [],
              };
            }
          }
          setQuizAttemptCounts(attemptCounts);
          setQuizAttemptDetails(attemptDetails);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Process attempted quizzes to show each quiz only once with best score
  const processAttemptedQuizzes = (attempts) => {
    const quizMap = new Map();

    attempts.forEach((attempt) => {
      const quizId = attempt.quiz_id;
      const currentScore = calculateAttemptScore(attempt);

      if (!quizMap.has(quizId)) {
        // First time seeing this quiz, add it
        quizMap.set(quizId, {
          ...attempt,
          best_score: currentScore,
          first_attempt: attempt.attempted_at,
          total_attempts: 1,
        });
      } else {
        // Update with best score and track attempts
        const existing = quizMap.get(quizId);
        const newBestScore = Math.max(existing.best_score, currentScore);

        quizMap.set(quizId, {
          ...existing,
          best_score: newBestScore,
          total_attempts: existing.total_attempts + 1,
        });
      }
    });

    return Array.from(quizMap.values()).sort(
      (a, b) => new Date(b.attempted_at) - new Date(a.attempted_at)
    );
  };

  // Calculate stats from the data
  const calculateStats = () => {
    const totalAttempts = attemptedQuizzes.length;
    const quizzesCreated = createdQuizzes.length;

    return {
      totalAttempts,
      quizzesCreated,
    };
  };

  const stats = calculateStats();

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await axios.delete(`${BaseUrl}/quizzes/${quizId}`);

        // Refresh created quizzes after deletion
        const token = localStorage.getItem("token");
        const userId = userData.id;

        const createdQuizzesRes = await axios.get(
          `${BaseUrl}/quizzes/ByUserId/${userId}`
        );
        setCreatedQuizzes(createdQuizzesRes.data || []);
      } catch (err) {
        console.error("Error deleting quiz:", err);
        alert("Failed to delete quiz. Please try again.");
      }
    }
  };

  const handleViewQuiz = async (quizId) => {
    try {
      const response = await axios.get(`${BaseUrl}/quizzes/${quizId}`);
      setSelectedQuiz(response.data);
      setModalView("questions"); // Default to questions view
      setShowQuizModal(true);
    } catch (err) {
      console.error("Error fetching quiz details:", err);
      alert("Failed to load quiz details.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Safe score calculation for individual attempts
  const calculateAttemptScore = (attempt) => {
    if (
      attempt.total_correct !== undefined &&
      attempt.total_questions !== undefined &&
      attempt.total_questions > 0
    ) {
      return (attempt.total_correct / attempt.total_questions) * 100;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className=" py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Welcome Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {userData?.name || userData?.username} 👋
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
            Here's an overview of your quiz performance and created quizzes.
          </p>
        </div>

        {/* Statistics Section - Compact Design */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 max-w-2xl mx-auto">
          {/* Total Quizzes Attempted */}
          <div className="bg-white/70 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-md border border-white/50 p-3 sm:p-4 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-2 sm:mb-3 mx-auto">
              <span className="text-lg sm:text-xl text-white">🧠</span>
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-1">
              {stats.totalAttempts}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-tight">
              Total Quizzes Attempted
            </p>
          </div>

          {/* Quizzes Created */}
          <div className="bg-white/70 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-md border border-white/50 p-3 sm:p-4 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-2 sm:mb-3 mx-auto">
              <span className="text-lg sm:text-xl text-white">📚</span>
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-1">
              {stats.quizzesCreated}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-tight">
              Quizzes Created
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
          {/* Recent Quiz Attempts */}
          <div className="bg-white/70 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-md border border-white/50 p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
              <span className="mr-2 text-lg sm:text-xl">📊</span>
              Your Quiz Attempts
            </h2>

            {attemptedQuizzes.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {attemptedQuizzes.slice(0, 5).map((attempt, index) => {
                  const bestScore = attempt.best_score;
                  const hasValidScore = bestScore > 0;

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 sm:p-4 bg-white/50 rounded-lg sm:rounded-xl border border-white/30 hover:bg-white/70 transition-all duration-200"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-xs sm:text-sm line-clamp-1">
                          {attempt.quiz_title || "Quiz"}
                        </h4>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1 text-xs text-gray-600 space-y-1 sm:space-y-0">
                          <span className="flex items-center">
                            Best Score:{" "}
                            {hasValidScore ? (
                              <>
                                <strong
                                  className={`ml-1 ${
                                    bestScore >= 70
                                      ? "text-green-600"
                                      : bestScore >= 50
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {Math.round(bestScore)}%
                                </strong>
                                {attempt.total_attempts > 1 && (
                                  <span className="text-gray-500 ml-1">
                                    ({attempt.total_attempts} attempts)
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-500 ml-1">
                                Not available
                              </span>
                            )}
                          </span>
                          <span className="text-xs">
                            Last:{" "}
                            {new Date(attempt.attempted_at).toLocaleString(
                              "en-IN",
                              {
                                timeZone: "Asia/Kolkata",
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: true,
                              }
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <button
                          onClick={() => navigate(`/quiz/${attempt.quiz_id}`)}
                          className="text-xs font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 sm:px-3 py-1 rounded-md shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📝</div>
                <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                  No quiz attempts yet
                </p>
                <button
                  onClick={() => navigate("/quizzes")}
                  className="font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 sm:px-6 py-2 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 text-sm sm:text-base"
                >
                  Take Your First Quiz
                </button>
              </div>
            )}
          </div>

          {/* Your Created Quizzes */}
          <div className="bg-white/70 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-md border border-white/50 p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
              <span className="mr-2 text-lg sm:text-xl">🎯</span>
              Your Created Quizzes
            </h2>

            {createdQuizzes.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {createdQuizzes.slice(0, 5).map((quiz, index) => (
                  <div
                    key={quiz.id}
                    className="flex items-center justify-between p-3 sm:p-4 bg-white/50 rounded-lg sm:rounded-xl border border-white/30 hover:bg-white/70 transition-all duration-200"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 text-xs sm:text-sm line-clamp-1">
                        {quiz.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 text-xs text-gray-600">
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {quiz.category}
                        </span>
                        <span className="whitespace-nowrap">
                          Created: {formatDate(quiz.created_at)}
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {quizAttemptCounts[quiz.id] || 0} attempts
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1 sm:space-x-2 ml-2 flex-shrink-0">
                      <button
                        onClick={() => handleViewQuiz(quiz.id)}
                        className="text-xs font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 sm:px-3 py-1 rounded-md shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        view
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="text-xs font-semibold bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 sm:px-3 py-1 rounded-md shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🆕</div>
                <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                  You haven't created any quizzes yet
                </p>
                <button
                  onClick={() => navigate("/create-quiz")}
                  className="font-semibold bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white px-4 sm:px-6 py-2 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm sm:text-base"
                >
                  Create Your First Quiz
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Call-to-Action Section */}
        <div className="bg-white/70 backdrop-blur-lg rounded-xl sm:rounded-2xl shadow-md border border-white/50 p-4 sm:p-6 md:p-8 text-center hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">
            Ready for Your Next Challenge?
          </h2>
          <p className="text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base px-2">
            Continue your learning journey by taking more quizzes or creating
            your own to share with the community.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => navigate("/create-quiz")}
              className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 md:px-8 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 text-sm sm:text-base"
            >
              🎯 Create New Quiz
            </button>
            <button
              onClick={() => navigate("/quizzes")}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 md:px-8 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 text-sm sm:text-base"
            >
              📋 View All Quizzes
            </button>
          </div>
        </div>
      </div>

      {/* Quiz Details Modal */}
      {showQuizModal && selectedQuiz && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 break-words">
                    {selectedQuiz.title}
                  </h3>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base break-words">
                    {selectedQuiz.description}
                  </p>
                </div>
                <button
                  onClick={() => setShowQuizModal(false)}
                  className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-200/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 ml-2 flex-shrink-0"
                >
                  <span className="text-xl sm:text-2xl -mt-0.5">×</span>
                </button>
              </div>

              {/* View Toggle Buttons */}
              <div className="flex space-x-2 mt-3 sm:mt-4">
                <button
                  onClick={() => setModalView("questions")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-xs sm:text-sm ${
                    modalView === "questions"
                      ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg focus:ring-blue-500"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400"
                  }`}
                >
                  ❓ Questions
                </button>
                <button
                  onClick={() => setModalView("stats")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-xs sm:text-sm ${
                    modalView === "stats"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg focus:ring-green-500"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400"
                  }`}
                >
                  📊 Statistics
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-3 sm:p-4 md:p-6 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto">
              {modalView === "questions" ? (
                // Questions View
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
                    <span className="mr-2">📝</span>
                    All Questions & Answers
                  </h4>

                  <div className="space-y-4 sm:space-y-6">
                    {selectedQuiz.questions?.map((question, index) => (
                      <div
                        key={question.id}
                        className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 border border-gray-200"
                      >
                        <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <span className="bg-blue-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                            {index + 1}
                          </span>
                          <h5 className="text-base sm:text-lg font-semibold text-gray-800 break-words">
                            {question.question_text}
                          </h5>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 ml-7 sm:ml-9">
                          {["A", "B", "C", "D"].map((option) => (
                            <div
                              key={option}
                              className={`p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 ${
                                question.correct_option === option
                                  ? "bg-green-100 border-green-500 text-green-800 shadow-sm"
                                  : "bg-white border-gray-300 text-gray-700"
                              }`}
                            >
                              <div className="flex items-center gap-1 sm:gap-2">
                                <span
                                  className={`font-bold text-xs sm:text-sm ${
                                    question.correct_option === option
                                      ? "text-green-700"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {option}:
                                </span>
                                <span className="text-xs sm:text-sm break-words">
                                  {question[`option_${option.toLowerCase()}`]}
                                </span>
                                {question.correct_option === option && (
                                  <span className="bg-green-500 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ml-auto whitespace-nowrap">
                                    Correct
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Statistics View
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
                    <span className="mr-2">📈</span>
                    Quiz Attempt History
                  </h4>

                  {quizAttemptDetails[selectedQuiz.id] ? (
                    <div className="space-y-4 sm:space-y-6">
                      {/* Total Attempts Card */}
                      <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center border border-blue-200">
                        <div className="text-xl sm:text-2xl font-bold text-blue-700">
                          {quizAttemptDetails[selectedQuiz.id].totalAttempts}
                        </div>
                        <div className="text-xs sm:text-sm text-blue-600">
                          Total Attempts
                        </div>
                      </div>

                      {/* Attempts List - Sorted by Time */}
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                          <span className="mr-2">🕒</span>
                          Attempt History (Newest First)
                        </h5>
                        {quizAttemptDetails[selectedQuiz.id].attempts.length >
                        0 ? (
                          <div className="space-y-2 sm:space-y-3">
                            {quizAttemptDetails[selectedQuiz.id].attempts.map(
                              (attempt, index) => {
                                const score = calculateAttemptScore(attempt);
                                return (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 sm:space-x-3">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                                          {index + 1}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                                            User #{attempt.user_id}
                                          </div>
                                          <div className="text-xs text-gray-600">
                                            Score:{" "}
                                            <span
                                              className={
                                                score >= 70
                                                  ? "text-green-600 font-bold"
                                                  : score >= 50
                                                  ? "text-yellow-600 font-bold"
                                                  : "text-red-600 font-bold"
                                              }
                                            >
                                              {Math.round(score)}%
                                            </span>{" "}
                                            ({attempt.total_correct}/
                                            {attempt.total_questions})
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right ml-2 flex-shrink-0">
                                      <div className="text-xs text-gray-500 font-medium whitespace-nowrap">
                                        {formatDate(attempt.attempted_at)}
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        {formatTime(attempt.time_taken)}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                            No attempts yet for this quiz
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
                      Loading statistics...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 md:p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                  <span className="bg-purple-100 text-purple-800 px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                    {selectedQuiz.category}
                  </span>
                  <span className="whitespace-nowrap">
                    Time: {selectedQuiz.time_limit} min
                  </span>
                  <span className="whitespace-nowrap">
                    Q's: {selectedQuiz.questions?.length || 0}
                  </span>
                </div>
                <button
                  onClick={() => setShowQuizModal(false)}
                  className="font-semibold bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm sm:text-base mt-2 sm:mt-0"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
