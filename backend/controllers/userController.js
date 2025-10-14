import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail, findUserById } from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await createUser(fullName, email, hashed);
    res.json(user);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'User already exists'
      });
    }
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}

export const login = async(req, res) => {
  const { email, password } = req.body;
  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match){
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name},
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
}

export const verifyToken = async(req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if(!token) return res.status(401).json({ error: "Not logged in" });

  jwt.verify(token, process.env.JWT_SECRET,  (err, user) => {
    if (err){
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  })
}

