import { Router } from "express";
import prisma from "../db/config.js";
import verifyTokenUser from "../middlewares/authMiddleware.js";
import { tryCatch } from "../utils/tryCatch.js";

const meRouter = Router();

meRouter.get(
  "/me",
  verifyTokenUser,
  tryCatch(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    return res.json({ data: user });
  })
);

export default meRouter;
