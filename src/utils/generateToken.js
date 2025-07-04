// backend/src/utils/generateToken.js

import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Token akan kedaluwarsa dalam H = jam, D = hari
  });

  // Anda juga bisa set token di http-only cookie di sini jika mau
  return token;
};

export default generateToken;
