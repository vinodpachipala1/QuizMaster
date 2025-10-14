import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BaseUrl } from "../config/BaseUrl";

const CreateQuizPage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
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
          localStorage.removeItem("token");
        }
      };
      verifyLogin();
    }
    else{
      alert("Please Login");
      navigate("/login");
    }
  }, [navigate]);

  const [step, setStep] = useState(1);
  const [quizDetails, setQuizDetails] = useState({
    title: "",
    description: "",
    category: "General",
    time_limit: 10,
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "A",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearMessages = () => {
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3000);
  };

  const handleQuizDetailChange = (e) => {
    const { name, value } = e.target;
    setQuizDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    const { question_text, option_a, option_b, option_c, option_d } =
      currentQuestion;

    if (!question_text || !option_a || !option_b || !option_c || !option_d) {
      setError("All question and option fields are required.");
      clearMessages();
      return;
    }

    const newQuestion = {
      id: Date.now(),
      ...currentQuestion,
    };

    setQuestions((prev) => [...prev, newQuestion]);
    setSuccess("Question added successfully!");
    clearMessages();

    setCurrentQuestion({
      question_text: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "A",
    });
  };

  const handleRemoveQuestion = (questionId) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const handleEditQuestion = (questionId) => {
    const questionToEdit = questions.find((q) => q.id === questionId);
    if (questionToEdit) {
      setCurrentQuestion(questionToEdit);
      handleRemoveQuestion(questionId);
    }
  };

  const CreateQuiz = async (e) => {
    e.preventDefault();

    if (!quizDetails.title) {
      setError("Quiz Title is required.");
      clearMessages();
      return;
    }

    if (questions.length === 0) {
      setError("Please add at least one question to the quiz.");
      clearMessages();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const quizData = {
        ...quizDetails,
        created_by : userData.id,
        questions: questions.map((q) => ({
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_option: q.correct_option,
        })),
      };
      console.log(quizDetails);

      // API call to create quiz with all questions at once
      const response = await axios.post(`${BaseUrl}/quizzes/createQuiz`, {
        quizData,
      });

      setSuccess("Quiz created successfully with all questions!");
      clearMessages();

      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate("/quizzes");
      }, 2000);
    } catch (err) {
      setError("Failed to create quiz. Please try again.");
      console.error("Error creating quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-4">
          Create a New Quiz
        </h1>
        <p className="text-gray-600 text-center mb-8 text-sm sm:text-base">
          Follow the steps below to build and publish your quiz.
        </p>

        {/* Progress Indicator */}
        <div className="w-full flex justify-center items-center mb-8">
          <div className="flex items-center">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-sm sm:text-base ${
                step >= 1 ? "bg-purple-600" : "bg-gray-400"
              }`}
            >
              1
            </div>
            <p
              className={`ml-2 font-semibold text-sm sm:text-base ${
                step >= 1 ? "text-purple-700" : "text-gray-500"
              }`}
            >
              Quiz Details
            </p>
          </div>
          <div
            className={`flex-auto border-t-2 mx-2 sm:mx-4 ${
              step >= 2 ? "border-purple-600" : "border-gray-300"
            }`}
          ></div>
          <div className="flex items-center">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-sm sm:text-base ${
                step >= 2 ? "bg-purple-600" : "bg-gray-400"
              }`}
            >
              2
            </div>
            <p
              className={`ml-2 font-semibold text-sm sm:text-base ${
                step >= 2 ? "text-purple-700" : "text-gray-500"
              }`}
            >
              Add Questions
            </p>
          </div>
        </div>

        {/* Step 1: Quiz Information */}
        {step === 1 && (
          <div className="bg-white/70 backdrop-blur-lg p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg border border-white/50 space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Step 1: Quiz Information
            </h2>
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Quiz Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                value={quizDetails.title}
                onChange={handleQuizDetailChange}
                className="mt-1 block w-full px-3 sm:px-4 py-2 bg-white/80 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description (Optional)
              </label>
              <textarea
                name="description"
                id="description"
                value={quizDetails.description}
                onChange={handleQuizDetailChange}
                rows="3"
                className="mt-1 block w-full px-3 sm:px-4 py-2 bg-white/80 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
              ></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <select
                  name="category"
                  id="category"
                  value={quizDetails.category}
                  onChange={handleQuizDetailChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 bg-white/80 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                >
                  <option>General</option>
                  <option>Technology</option>
                  <option>Science</option>
                  <option>History</option>
                  <option>Geography</option>
                  <option>Mathematics</option>
                  <option>Sports</option>
                  <option>Movies & Entertainment</option>
                  <option>Literature</option>
                  <option>Music</option>
                  <option>Politics</option>
                  <option>Art & Culture</option>
                  <option>Health & Medicine</option>
                  <option>Programming</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="time_limit"
                  className="block text-sm font-medium text-gray-700"
                >
                  Time Limit (Minutes)
                </label>
                <input
                  type="number"
                  name="time_limit"
                  id="time_limit"
                  value={quizDetails.time_limit}
                  onChange={handleQuizDetailChange}
                  min="1"
                  className="mt-1 block w-full px-3 sm:px-4 py-2 bg-white/80 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                />
              </div>
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!quizDetails.title}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 text-sm sm:text-base"
              >
                Next: Add Questions
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Add Questions */}
        {step === 2 && (
          <div>
            <div className="bg-white/70 backdrop-blur-lg p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg border border-white/50 space-y-6 mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                Step 2: Add Questions ({questions.length} added)
              </h2>
              <div>
                <label
                  htmlFor="question_text"
                  className="block text-sm font-medium text-gray-700"
                >
                  Question Text
                </label>
                <input
                  type="text"
                  name="question_text"
                  value={currentQuestion.question_text}
                  onChange={handleQuestionChange}
                  className="mt-1 block w-full px-3 sm:px-4 py-2 bg-white/80 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label
                    htmlFor="option_a"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Option A
                  </label>
                  <input
                    type="text"
                    name="option_a"
                    value={currentQuestion.option_a}
                    onChange={handleQuestionChange}
                    className="mt-1 block w-full px-3 sm:px-4 py-2 bg-white/80 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label
                    htmlFor="option_b"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Option B
                  </label>
                  <input
                    type="text"
                    name="option_b"
                    value={currentQuestion.option_b}
                    onChange={handleQuestionChange}
                    className="mt-1 block w-full px-3 sm:px-4 py-2 bg-white/80 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label
                    htmlFor="option_c"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Option C
                  </label>
                  <input
                    type="text"
                    name="option_c"
                    value={currentQuestion.option_c}
                    onChange={handleQuestionChange}
                    className="mt-1 block w-full px-3 sm:px-4 py-2 bg-white/80 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label
                    htmlFor="option_d"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Option D
                  </label>
                  <input
                    type="text"
                    name="option_d"
                    value={currentQuestion.option_d}
                    onChange={handleQuestionChange}
                    className="mt-1 block w-full px-3 sm:px-4 py-2 bg-white/80 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="correct_option"
                  className="block text-sm font-medium text-gray-700"
                >
                  Correct Option
                </label>
                <select
                  name="correct_option"
                  value={currentQuestion.correct_option}
                  onChange={handleQuestionChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 bg-white/80 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-all duration-300 text-sm sm:text-base"
                >
                  Back to Details
                </button>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-green-500 text-white font-semibold rounded-full shadow-md hover:bg-green-600 transition-all duration-300 text-sm sm:text-base"
                  >
                    Add Question
                  </button>
                  <button
                    type="button"
                    onClick={CreateQuiz}
                    disabled={loading || questions.length === 0}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-purple-600 text-white font-semibold rounded-full shadow-md hover:bg-purple-700 transition-all duration-300 disabled:opacity-50 text-sm sm:text-base"
                  >
                    {loading
                      ? "Creating Quiz..."
                      : `Create Quiz (${questions.length})`}
                  </button>
                </div>
              </div>
            </div>

            {/* Added Questions List */}
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                Added Questions ({questions.length})
              </h3>
              {questions.length === 0 ? (
                <p className="text-gray-500 text-sm sm:text-base">
                  No questions added yet. Fill out the form above to add your
                  first question.
                </p>
              ) : (
                questions.map((q, index) => (
                  <div
                    key={q.id}
                    className="bg-white/70 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-md border border-white/50 flex flex-col sm:flex-row justify-between items-start gap-3"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">
                        {index + 1}. {q.question_text}
                      </p>
                      <ul className="list-disc list-inside mt-2 text-xs sm:text-sm text-gray-600">
                        <li
                          className={
                            q.correct_option === "A"
                              ? "text-green-600 font-bold"
                              : ""
                          }
                        >
                          A: {q.option_a}
                        </li>
                        <li
                          className={
                            q.correct_option === "B"
                              ? "text-green-600 font-bold"
                              : ""
                          }
                        >
                          B: {q.option_b}
                        </li>
                        <li
                          className={
                            q.correct_option === "C"
                              ? "text-green-600 font-bold"
                              : ""
                          }
                        >
                          C: {q.option_c}
                        </li>
                        <li
                          className={
                            q.correct_option === "D"
                              ? "text-green-600 font-bold"
                              : ""
                          }
                        >
                          D: {q.option_d}
                        </li>
                      </ul>
                    </div>
                    <div className="flex space-x-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleEditQuestion(q.id)}
                        className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Global Error/Success Messages */}
        {error && (
          <div className="fixed bottom-20 sm:bottom-24 right-2 sm:right-5 bg-red-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow-xl animate-bounce text-sm sm:text-base max-w-xs sm:max-w-md">
            {error}
          </div>
        )}
        {success && (
          <div className="fixed bottom-2 sm:bottom-5 right-2 sm:right-5 bg-green-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow-xl text-sm sm:text-base max-w-xs sm:max-w-md">
            {success}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateQuizPage;