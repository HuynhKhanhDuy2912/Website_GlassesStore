import express from "express";
import { register, login, logout } from "../controllers/auth.controller.js";
import { resetPasswordDirect } from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.put("/reset-password-direct", resetPasswordDirect);

export default router;
