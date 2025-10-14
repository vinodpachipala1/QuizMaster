import { db } from "./db.js";

export const CreateTables = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS quizzes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        time_limit INT,
        created_by INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        questions JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );


      CREATE TABLE IF NOT EXISTS attempts (
        id SERIAL PRIMARY KEY,
        quiz_id INT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        total_correct INT NOT NULL,
        total_questions INT NOT NULL,
        attempted_at TIMESTAMPTZ DEFAULT NOW()  -- UTC by default
      ); 
    `);
    console.log("Tables Created Successfully!");
  } catch (err) {
    console.log(err);
  }
};

export default CreateTables;
