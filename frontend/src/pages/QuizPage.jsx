import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { BaseUrl } from "../config/BaseUrl";
import { motion, AnimatePresence } from "framer-motion";
import { Clock } from "lucide-react";
import QuestionCard from "../components/QuestionCard";
import ResultPage from "../components/ResultPage";

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizState, setQuizState] = useState("loading");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [userData, setUserData] = useState(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);

  const QUIZ_TIMER_END_TIME_KEY = `quiz_timer_end_time_${id}`;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const verifyLogin = async () => {
        try {
          const res = await axios.get(`${BaseUrl}/auth/verifyLogin`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserData(res.data);
        } catch (err) {
          console.log(err);
        }
      };
      verifyLogin();
    }
  }, []);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setQuizState("loading");
        const res = await axios.get(`${BaseUrl}/quizzes/${id}`);
        setQuiz(res.data);
        setQuestions(res.data.questions);

        if (res.data.time_limit) {
          const storedEndTime = localStorage.getItem(QUIZ_TIMER_END_TIME_KEY);
          const durationInSeconds = res.data.time_limit * 60;

          if (storedEndTime) {
            const remainingTime = Math.round(
              (parseInt(storedEndTime, 10) - Date.now()) / 1000
            );
            setTimeLeft(remainingTime > 0 ? remainingTime : 0);
          } else {
            const newEndTime = Date.now() + durationInSeconds * 1000;
            localStorage.setItem(
              QUIZ_TIMER_END_TIME_KEY,
              newEndTime.toString()
            );
            setTimeLeft(durationInSeconds);
          }
        }
        setQuizState("active");
      } catch (err) {
        console.error("Error fetching quiz data:", err);
        setQuizState("not_found");
      }
    };
    fetchQuizData();
  }, [id, QUIZ_TIMER_END_TIME_KEY]);

  useEffect(() => {
    if (quizState !== "active" || timeLeft === null) {
      return;
    }

    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, quizState]);

  // Track previous path to detect actual route changes (not reloads)
  useEffect(() => {
    // Store the initial path when component mounts
    const initialPath = location.pathname;
    
    return () => {
      // Only remove timer if the user actually navigated to a different route
      const currentPath = window.location.pathname;
      if (currentPath !== initialPath && quizState === "active" && timeLeft > 0) {
        localStorage.removeItem(QUIZ_TIMER_END_TIME_KEY);
        console.log("Timer cleared - user navigated to different route");
      }
    };
  }, [location.pathname, quizState, timeLeft, QUIZ_TIMER_END_TIME_KEY]);

  // Alternative approach: Use beforeunload to detect page reload vs route change
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // This runs only on page reload/close, not on route changes
      // We don't remove the timer here, allowing it to persist through reloads
      console.log("Page is reloading or closing - keeping timer");
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerSelect = (option) => {
    setUserAnswers((prev) => ({ ...prev, [currentQuestionIndex]: option }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleQuestionNavigation = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitQuiz = () => {
    setShowSubmitModal(true);
  };

  const handleAutoSubmit = async () => {
    // Clear the timer storage immediately
    localStorage.removeItem(QUIZ_TIMER_END_TIME_KEY);
    await submitQuizAttempt(true);
  };

  const submitQuizAttempt = async (isAutoSubmit = false) => {
    setSubmissionLoading(true);

    try {
      // Calculate score
      let totalCorrect = 0;
      questions.forEach((question, index) => {
        if (userAnswers[index] === question.correct_option) {
          totalCorrect++;
        }
      });

      // Only submit to backend if user is logged in
      if (userData) {
        const submissionData = {
          quiz_id: parseInt(id),
          user_id: userData.id,
          total_correct: totalCorrect,
          total_questions: questions.length,
        };
        await axios.post(`${BaseUrl}/attempts/create-attempt`, submissionData);
      }

      localStorage.removeItem(QUIZ_TIMER_END_TIME_KEY);
      setQuizState("submitted");
      setShowSubmitModal(false);
    } catch (error) {
      console.error("Error submitting quiz:", error);

      if (isAutoSubmit) {
        localStorage.removeItem(QUIZ_TIMER_END_TIME_KEY);
        setQuizState("submitted");
      } else {
        alert("Failed to submit quiz. Please try again.");
      }
    } finally {
      setSubmissionLoading(false);
    }
  };

  const confirmSubmit = async () => {
    await submitQuizAttempt();
  };

  const restartQuiz = () => {
    localStorage.removeItem(QUIZ_TIMER_END_TIME_KEY);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    if (quiz.time_limit) {
      const durationInSeconds = quiz.time_limit * 60;
      const newEndTime = Date.now() + durationInSeconds * 1000;
      localStorage.setItem(QUIZ_TIMER_END_TIME_KEY, newEndTime.toString());
      setTimeLeft(durationInSeconds);
    }
    setQuizState("active");
  };

  const currentQuestion = questions[currentQuestionIndex];
  const answeredQuestions = Object.keys(userAnswers).length;

  if (quizState === "loading") {
    return (
      <div className="from-purple-50 to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (quizState === "not_found" || !quiz) {
    return (
      <div className="flex items-center justify-center text-center p-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-700 mb-4">
            Quiz Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            We couldn't find the quiz you're looking for.
          </p>
          <button
            onClick={() => navigate("/quizzes")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            Go to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (quizState === "submitted") {
    return (
      <ResultPage
        questions={questions}
        userAnswers={userAnswers}
        quizTitle={quiz.title}
        onRestart={restartQuiz}
        onBackToQuizzes={() => navigate("/quizzes")}
      />
    );
  }

  return (
    <div className="from-indigo-50 via-white to-violet-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/30 backdrop-blur-xl rounded-2xl shadow-lg p-4 mb-6 flex flex-col sm:flex-row justify-between items-center border border-white/40 bg-gradient-to-b from-white/50 to-white/20">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{quiz.title}</h1>
            <p className="text-indigo-600 font-medium">{quiz.category}</p>
          </div>

          {timeLeft !== null && (
            <div className="flex items-center gap-2 mt-4 sm:mt-0 text-base font-semibold px-3 py-1.5 rounded-lg bg-white shadow-inner">
              <Clock
                className={`w-5 h-5 ${
                  timeLeft < 60 ? "text-red-500" : "text-yellow-500"
                }`}
              />
              <span
                className={`font-mono ${
                  timeLeft < 60 ? "text-red-600" : "text-gray-700"
                }`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Question Area */}
          <div className="flex-1">
            {/* ✨ QUESTION CARD CONTAINER: Added glossy effect */}
            <div className="bg-white/30 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/40 bg-gradient-to-b from-white/50 to-white/20">
              <AnimatePresence mode="wait">
                <QuestionCard
                  key={currentQuestionIndex}
                  question={currentQuestion}
                  onAnswerSelect={handleAnswerSelect}
                  selectedAnswer={userAnswers[currentQuestionIndex]}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={questions.length}
                />
              </AnimatePresence>
            </div>
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-100 disabled:opacity-50 transition-all"
              >
                Previous
              </button>
              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105"
                >
                  Next
                </button>
              )}
            </div>
          </div>

          <div className="lg:w-72">
            <div className="bg-white/30 backdrop-blur-xl rounded-2xl shadow-lg p-5 sticky top-6 border border-white/40 bg-gradient-to-b from-white/50 to-white/20">
              <h3 className="font-bold text-gray-800 mb-4">
                Question Navigator
              </h3>
              <div className="grid grid-cols-5 gap-1.5 mb-6">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionNavigation(index)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                      currentQuestionIndex === index
                        ? "bg-indigo-600 text-white scale-110 shadow-lg"
                        : userAnswers[index]
                        ? "bg-green-200 text-green-800"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={handleSubmitQuiz}
                className="w-full mt-4 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all"
              >
                End & Submit Quiz
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 bg-gradient-to-b from-white to-slate-50 shadow-inner-sm"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Ready to Submit?
            </h3>
            <p className="text-gray-600 mb-6">
              You have answered{" "}
              <span className="font-bold text-indigo-600">
                {answeredQuestions}
              </span>{" "}
              out of{" "}
              <span className="font-bold text-indigo-600">
                {questions.length}
              </span>{" "}
              questions.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowSubmitModal(false)}
                disabled={submissionLoading}
                className="flex-1 py-2.5 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                onClick={confirmSubmit}
                disabled={submissionLoading}
                className="flex-1 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {submissionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  "Confirm & Submit"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default QuizPage;