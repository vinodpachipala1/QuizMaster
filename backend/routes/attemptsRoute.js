import express from "express";
import { create_attempt, get_attempts_by_quizid, get_attempts_by_userid } from "../controllers/attemptsController.js";

const attemptRouter = express.Router();

attemptRouter.post("/create-attempt", create_attempt);
attemptRouter.get("/getAttemptsByUserId/:id", get_attempts_by_userid);
attemptRouter.get("/getAttemptsByQuizId/:id", get_attempts_by_quizid);
export default attemptRouter;