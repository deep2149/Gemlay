import express from "express";
import cors from "cors";
import otpRouter from "./utils/otp.routes.js";
import meRouter from "./auth/me.js";
import userRouter from "./User/user.js";
import  errorMiddleware  from "./middlewares/errorMiddleware.js";
import authRoutes from "./routes/auth.route.js";  


const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("Gemlay");
});

app.use("/api/auth", authRoutes);
app.use("/api/auth", otpRouter);
app.use("/user", userRouter);
app.use("/me", meRouter);





app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
