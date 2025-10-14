import pool from "../config/db.js";

export const createQuiz = async(title, description, category, time_limit, created_by, questions) => {
    const result = await pool.query(
        `INSERT INTO quizzes (title, description, category, time_limit, created_by, questions) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [title, description, category, time_limit, created_by, questions]
    );
    return result.rows[0];
}

export const getAllQuizzes = async() => {
    const result = await pool.query(`SELECT * FROM quizzes`);
    return result.rows;
}

export const getQuizById = async(id) => {
    const result = await pool.query(`SELECT * FROM quizzes WHERE id = $1`,[id]);
    return result.rows[0];
}

export const getQuizzesByUserID = async(id) => {
    
    const result = await pool.query(`SELECT * FROM quizzes WHERE created_by = $1`,[1]);
    console.log(result.rows)
    return result.rows;
}