import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
// import { PrismaClient } from "@prisma/client";
import prisma from "./db/config";
import axios from "axios";

const prisma = new PrismaClient();
const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

const JWT_SECRET = "YOUR_SECRET_KEY";

// Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
};



// Request OTP 
app.post("/auth/send-otp", async (req, res) => {
  const { phone } = req.body;

  if (!phone) return res.status(400).json({ msg: "Phone is required" });


  res.json({ msg: "OTP sent", otp: 1234 });
});

// Verify OTP
app.post("/auth/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  if (otp !== "1234") return res.status(400).json({ msg: "Invalid OTP" });

  let user = await prisma.user.findUnique({ where: { phone } });

  if (!user) {
    user = await prisma.user.create({ data: { phone } });
  }

  const token = generateToken(user);

  res.json({ msg: "Login Success", token, user });
});



app.post("/auth/google", async (req, res) => {
  const { access_token } = req.body;

  // Fetch user info from Google
  const googleRes = await axios.get(
    `https://www.googleapis.com/oauth2/v3/userinfo`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  );

  const g = googleRes.data;

  let user = await prisma.user.findUnique({
    where: { email: g.email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        googleId: g.sub,
        email: g.email,
        name: g.name,
      },
    });
  }

  const token = generateToken(user);

  res.json({ msg: "Google Login Success", token, user });
});

app.listen(5000, () => console.log("Server running on port 5000"));
