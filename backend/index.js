import express from "express";
import cors from "cors";

import { CreateTables } from "./config/CreateTables.js";

import userRouter from "./routes/userRoute.js";
import quizzesRouter from "./routes/quizzesRoute.js";
import attemptRouter from "./routes/attemptsRoute.js";

const app = express();
const port = 3001;

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.set("trust proxy", 1);
CreateTables();

app.use("/auth", userRouter);
app.use("/quizzes", quizzesRouter);
app.use("/attempts", attemptRouter);

app.listen(port, () => {
  console.log(`listenig to port ${port}`);
});
