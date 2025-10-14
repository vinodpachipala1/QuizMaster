import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "../pages/Layout";
import LoginPage from "../pages/login";
import RegisterPage from "../pages/register";
import QuizList from "../pages/QuizListing";
import Home from "../pages/Home";
import CreateQuizPage from "../pages/CreateQuiz";
import QuizPage from "../pages/QuizPage";
import Dashboard from "../pages/Dashboard";

const Router = () => {
  return (
    <BrowserRouter>
    
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/quizzes" element={<QuizList />} />
          <Route path="/create-quiz" element={<CreateQuizPage />} />
          <Route path="/quiz/:id" element={<QuizPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
