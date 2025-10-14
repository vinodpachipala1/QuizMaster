import { cretaeAttempt, getAttemptsByUserId, getAttemptsByQuizId } from "../models/attemptsModel.js";

export const create_attempt = async(req, res) => {
    const {quiz_id, user_id, total_correct, total_questions} = req.body;
    try{
        await cretaeAttempt(quiz_id, user_id, total_correct, total_questions);
        res.send("Succesfull");
    } catch (err){
        res.status(401).send({error: "Internal Server Error"});
        console.log(err);
    }
}

export const get_attempts_by_userid = async(req, res) =>{
    const { id } = req.params;
    try{
        const result = await getAttemptsByUserId(id);
        res.send(result);
    } catch (err){
        res.status(401).send({error : "Internal Server Error"});
    }
}

export const get_attempts_by_quizid = async(req, res) =>{
    const { id } = req.params;
    try{
        const result = await getAttemptsByQuizId(id);
        res.send(result);
    } catch (err){
        res.status(401).send({error : "Internal Server Error"});
    }
}