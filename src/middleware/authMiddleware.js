// backend/src/middleware/authMiddleware.js

import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  
  let token;

  // 1. Cek apakah header 'Authorization' ada dan diawali dengan 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 2. Ambil token dari header (menghilangkan 'Bearer ')
      token = req.headers.authorization.split(" ")[1];

      // 3. Verifikasi token menggunakan JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Dapatkan data user dari ID di dalam token dan tempelkan ke object request
      req.user = await User.findById(decoded.userId).select("-password");

      // Lanjutkan ke proses selanjutnya (controller)
      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      res.status(401).json({ message: "Tidak terotorisasi, token gagal" });
    }
  }

  // Jika tidak ada token sama sekali di header
  if (!token) {
    res.status(401).json({ message: "Tidak terotorisasi, tidak ada token" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Tidak diizinkan, hanya untuk admin" });
  }
};

export { protect, admin };
