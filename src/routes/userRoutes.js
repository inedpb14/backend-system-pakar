// backend/src/routes/userRoutes.js

import express from "express";
import {
  loginUser,
  registerUser,
  getAllSiswa,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import rateLimit from "express-rate-limit";
import { body } from "express-validator"; // Untuk validasi input
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();
// 2. Konfigurasi limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Jendela waktu: 15 menit
  max: 10, // Maksimal 10 percobaan login per IP dalam 15 menit
  message: 'Terlalu banyak percobaan login dari IP ini, silakan coba lagi setelah 15 menit',
  standardHeaders: true, // Kirim info rate limit di header `RateLimit-*`
  legacyHeaders: false, // Nonaktifkan header `X-RateLimit-*`
});



// Rute Publik
router.post("/login", loginUser, loginLimiter);
router.post(
  "/register",
  // Aturan validasi
  body("username", "Username minimal 4 karakter")
    .isLength({ min: 4 })
    .trim()
    .escape(),
  body("password", "Password minimal 6 karakter").isLength({ min: 6 }),
  body("role").optional().isIn(["admin", "siswa"]),
  registerUser
);

// Rute Khusus Admin
router.get("/siswa", protect, admin, getAllSiswa); // Rute baru untuk mendapatkan semua siswa

router
  .route("/:id")
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router;
