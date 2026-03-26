import express from 'express'

import { getCurrentUser, login, register, updatePassword, updateUserProfile } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
const authRouter = express.Router();


authRouter.post("/register", register)
authRouter.post("/login", login)

authRouter.get("/getMe", authMiddleware, getCurrentUser);

authRouter.put("/updateProfile", authMiddleware, updateUserProfile);
authRouter.put("/updatePassword", authMiddleware, updatePassword);

export default authRouter;