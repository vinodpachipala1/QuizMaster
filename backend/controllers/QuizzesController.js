import {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  getQuizzesByUserID,
} from "../models/QuizzesModel.js";

export const create_quiz = async (req, res) => {
  console.log(req.body);
  try {
    const { title, description, category, time_limit, created_by, questions } =
      req.body.quizData;
    const questionsJSON = JSON.stringify(questions);
    const result = await createQuiz(
      title,
      description,
      category,
      time_limit,
      created_by,
      questionsJSON
    );
    res.send("Successful");
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Failed to Create" });
  }
};

export const get_all_quizzes = async (req, res) => {
  try {
    const quizzes = await getAllQuizzes();
    res.send(quizzes);
  } catch (err) {
    res.status(401).send({ error: "Erroe Fetching Data" });
  }
};

export const get_quiz_by_Id = async (req, res) => {
  const { id } = req.params;
  try {
    const quiz = await getQuizById(id);
    res.send(quiz);
  } catch (err) {
    res.status(401).send({ error: "Quiz Not Found" });
  }
};

export const get_quizzes_by_User_Id = async (req, res) => {
  
  const { id } = req.params;
  console.log(id);
  try {
    const quizzes = await getQuizzesByUserID(id);
    res.send(quizzes);
  } catch (err) {
    res.status(401).send({ error: "Error Loading QUizzes"})
  }
};
