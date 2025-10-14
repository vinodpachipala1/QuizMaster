import React from "react";
import { motion } from "framer-motion";

const QuestionCard = ({
  question,
  onAnswerSelect,
  selectedAnswer,
  questionNumber,
  totalQuestions,
}) => {
  if (!question) return null;

  return (
    <motion.div
      key={questionNumber}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-sm font-semibold text-indigo-600 mb-2">
        Question {questionNumber} of {totalQuestions}
      </p>

      <h2 className="text-xl font-semibold text-gray-800 mb-6 leading-snug">
        {question.question_text}
      </h2>

      <div className="space-y-3">
        {["A", "B", "C", "D"].map((option) => (
          <label
            key={option}
            className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
              selectedAnswer === option
                ? "border-indigo-600 bg-indigo-50 shadow-lg"
                : "border-gray-200 hover:border-indigo-300"
            }`}
          >
            <input
              type="radio"
              name={`question-${questionNumber}`}
              value={option}
              checked={selectedAnswer === option}
              onChange={() => onAnswerSelect(option)}
              className="hidden"
            />
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center border-2 mr-4 ${
                selectedAnswer === option
                  ? "border-indigo-600 bg-indigo-600"
                  : "border-gray-400"
              }`}
            >
              {selectedAnswer === option && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </span>
            <span className="flex-1 text-gray-700 font-medium">
              {question[`option_${option.toLowerCase()}`]}
            </span>
          </label>
        ))}
      </div>
    </motion.div>
  );
};

export default QuestionCard;
