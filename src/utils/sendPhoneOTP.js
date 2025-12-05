import axios from "axios";

export const sendPhoneOTP = async (phone, otp) => {
  try {
    const url = `https://api.msg91.com/api/v5/otp?mobile=91${phone}&otp=${otp}`;

    const headers = {
      authkey: process.env.MSG91_AUTH_KEY
    };

    const response = await axios.get(url, { headers });

    return response.data;
  } catch (err) {
    console.error("MSG91 ERROR:", err.response?.data || err.message);
    throw new Error("Failed to send OTP via MSG91");
  }
};
