import prisma from "../db/config.js";
import axios from "axios";

export const userService = {
  async getUserData(accessToken) {
    try {
      const response = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Google userinfo error:", error);
      throw new Error("Failed to fetch user info");
    }
  },

  async findUserByEmail(email) {
    return await prisma.user.findUnique({ where: { email } });
  },
};
