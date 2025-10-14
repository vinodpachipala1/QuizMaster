import express from "express";
import { create_quiz, get_all_quizzes, get_quiz_by_Id, get_quizzes_by_User_Id } from "../controllers/QuizzesController.js";

const quizzesRouter = express.Router();

quizzesRouter.post("/createQuiz", create_quiz);
quizzesRouter.get("/getallquizzes", get_all_quizzes);
quizzesRouter.get("/:id", get_quiz_by_Id);
quizzesRouter.get("/ByUserId/:id", get_quizzes_by_User_Id);
export default quizzesRouter;