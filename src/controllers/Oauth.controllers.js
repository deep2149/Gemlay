import { Router } from "express";
import { tryCatch } from "../utils/tryCatch.js";
import { OAuth2Client } from "google-auth-library";
import prisma from "../db/config.js";
import { generateToken } from "../utils/jwt.util.js";

const OauthRouter = Router();

OauthRouter.get(
  "/google",
  tryCatch(async (req, res) => {
    const redirectUrl = process.env.GOOGLE_REDIRECT_URL;

    const oAuth2Client = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      redirectUrl
    );

    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "openid",
      ],
    });

    res.redirect(authorizeUrl);
  })
);

OauthRouter.get(
  "/google/callback",
  tryCatch(async (req, res) => {
    const code = req.query.code;
    const redirectUrl = process.env.GOOGLE_REDIRECT_URL;

    const oAuth2Client = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      redirectUrl
    );

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Fetch user info from Google
    const userInfoRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );

    const googleUser = await userInfoRes.json();

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
          emailVerified: true,
        },
      });
    }

    const jwtToken = generateToken(user.id);

    // Redirect to frontend with token
    return res.redirect(
      `http://localhost:5173/google-success?token=${jwtToken}`
    );
  })
);

export default OauthRouter;
