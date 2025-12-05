import { Router } from "express";
import prisma from "../db/config.js";
import verifyTokenUser from "../middlewares/authMiddleware.js";
import bcrypt from "bcryptjs";
import { tryCatch } from "../utils/tryCatch.js";
import { generateToken } from "../utils/jwt.utils.js";

const userRouter = Router();

/* REGISTER */
userRouter.post(
  "/register",
  tryCatch(async (req, res) => {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    res.json({ message: "User registered successfully", user });
  })
);

/* LOGIN */
userRouter.post(
  "/login",
  tryCatch(async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({ where: { email } });

    if (!user)
      return res.status(400).json({ message: "User must be registered" });

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user.id);

    res.json({ user, token });
  })
);

export default userRouter;
