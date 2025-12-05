import { Router } from "express";

const router = Router();


const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// SEND OTP
router.post("/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone)
      return res.status(400).json({ message: "Phone number is required" });

    const otp = generateOTP();


    req.app.locals[phone] = otp;

  
    console.log(`OTP for ${phone}: ${otp}`);

    res.json({
      message: "OTP generated successfully!",
      otpForTesting: otp, 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate OTP" });
  }
});

// VERIFY OTP
router.post("/verify-otp", (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp)
    return res.status(400).json({ message: "Phone & OTP required" });

  if (req.app.locals[phone] === otp) {
    delete req.app.locals[phone];

    return res.json({
      message: "OTP verified successfully!",
      user: { phone },
      token: "dummy-jwt-token", 
    });
  }

  res.status(400).json({ message: "Invalid OTP" });
});

export default router;
