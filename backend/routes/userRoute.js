import express from "express";
import { login, register, verifyToken } from "../controllers/userController.js";


const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/verifyLogin", verifyToken, (req, res)=>{
    res.status(201).send(req.user);
});
export default userRouter;