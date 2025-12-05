import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

const router = Router();

const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI,
});

//Redirect user to Google login page
router.get("/google", (req, res) => {
  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
  });

  return res.redirect(url);
});

//Handle Google redirect
router.get("/google/callback", async (req, res) => {
  const code = req.query.code;

  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();


  const token = jwt.sign(
    { id: payload.sub, email: payload.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );


  res.redirect(`http://localhost:5173/landingPage?token=${token}`);
});






export default router;
