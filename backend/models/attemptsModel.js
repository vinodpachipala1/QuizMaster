import pool from "../config/db.js";

export const cretaeAttempt = async(quizId, userId, total_correct, total_questions)=>{
    const result = await pool.query(
        `INSERT INTO attempts (quiz_id, user_id, total_correct, total_questions) VALUES ($1, $2, $3, $4)`,
        [quizId, userId, total_correct, total_questions])
}

export const getAttemptsByUserId = async(id) => {
    const result= await pool.query(
        `SELECT * FROM attempts WHERE user_id = $1`, [id]
    )
    return result.rows;
}

export const getAttemptsByQuizId = async(id) => {
    const result= await pool.query(
        `SELECT * FROM attempts WHERE quiz_id = $1`, [id]
    )
    return result.rows;
}