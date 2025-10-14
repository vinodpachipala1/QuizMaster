import React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

// ScoreCircle adapted for the new glassmorphism layout
const ScoreCircle = ({ score, total }) => {
  const percentage = total > 0 ? (score / total) * 100 : 0;
  const circumference = 2 * Math.PI * 52; // r = 52
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color changes from red -> pink -> indigo based on score
  const strokeColor =
    percentage >= 80 ? "#4f46e5" : // indigo-600
    percentage >= 50 ? "#a855f7" : // purple-500
                     "#ef4444";   // red-500

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        {/* Background Circle */}
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="8"
        />
        {/* Progress Circle */}
        <motion.circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "circOut", delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl font-bold text-slate-800">
          {Math.round(percentage)}
        </span>
        <span className="text-2xl font-bold text-slate-500">%</span>
      </div>
    </div>
  );
};

const ResultPage = ({ questions, userAnswers, quizTitle, onRestart, onBackToQuizzes }) => {
  const score = React.useMemo(
    () =>
      questions.reduce((acc, question, index) => {
        return userAnswers[index] === question.correct_option ? acc + 1 : acc;
      }, 0),
    [questions, userAnswers]
  );

  return (
    // The parent Layout provides the gradient background. This component just centers its content.
    <div className="w-full">
      <div className="max-w-2xl mx-auto px-4">
        {/* Main Results Card - Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white/60 backdrop-blur-lg rounded-2xl border border-white/30 shadow-lg p-6 sm:p-8 text-center"
        >
          <h1 className="text-2xl font-semibold text-slate-700">Results for</h1>
          <p className="text-3xl sm:text-4xl font-bold text-indigo-600 mt-1 mb-6">{quizTitle}</p>
          
          <div className="my-8 flex justify-center">
            <ScoreCircle score={score} total={questions.length} />
          </div>
          <p className="text-slate-600 -mt-2 mb-8">
            You answered <span className="font-semibold text-slate-800">{score} of {questions.length}</span> questions correctly.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={onRestart} 
              className="flex-1 py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try Again
            </button>
            <button 
              onClick={onBackToQuizzes} 
              className="flex-1 py-3 px-4 bg-white/80 text-indigo-700 font-semibold rounded-lg border border-indigo-200 hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Quizzes
            </button>
          </div>
        </motion.div>

        {/* Answer Review Section */}
        <div className="mt-12 mb-8">
          <h2 className="text-xl font-bold text-slate-700 mb-5 text-center sm:text-left">Review Your Answers</h2>
          <div className="space-y-4">
            {questions.map((q, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === q.correct_option;
              
              const userAnswerText = userAnswer ? q[`option_${userAnswer.toLowerCase()}`] : 'Not Answered';
              const correctAnswerText = q[`option_${q.correct_option.toLowerCase()}`];

              return (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  // Glassmorphism for answer cards
                  className={`bg-white/60 backdrop-blur-lg rounded-xl border border-white/30 p-5 border-l-4 ${isCorrect ? 'border-teal-500' : 'border-red-500'}`}
                >
                  <p className="font-semibold text-slate-800 mb-4">{index + 1}. {q.question_text}</p>
                  
                  <div className="flex items-center gap-3 text-sm">
                    {isCorrect ? 
                      <Check className="w-5 h-5 text-teal-600 flex-shrink-0" /> : 
                      <X className="w-5 h-5 text-red-600 flex-shrink-0" />
                    }
                    <span className="text-slate-500">Your answer:</span>
                    <span className={`font-semibold ${isCorrect ? 'text-teal-700' : 'text-red-700'}`}>{userAnswerText}</span>
                  </div>

                  {!isCorrect && (
                     <div className="flex items-center gap-3 text-sm mt-3 pl-8">
                        <span className="text-slate-500">Correct answer:</span>
                        <span className="font-semibold text-teal-700">{correctAnswerText}</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;