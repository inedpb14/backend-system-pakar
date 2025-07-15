// backend/src/routes/userRoutes.js

import express from "express";
import {
  loginUser,
  registerUser,
  getAllSiswa,
  getUserById,
  updateUser,
  deleteUser,
  validateLogin, // Import validation rules
  validateRegister, // Import validation rules
  validateUpdateUser, // Import validation rules
} from "../controllers/userController.js";
import rateLimit from "express-rate-limit";
// import { body } from "express-validator"; // No longer needed here, imported from controller
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
// Apply login validation middleware
router.post("/login", validateLogin, loginUser, loginLimiter);

// Rute Register User
// Saat ini rute ini bersifat publik.
// Jika ingin membatasi hanya untuk admin, tambahkan middleware 'protect' dan 'admin' di sini:
// router.post("/register", protect, admin, validateRegister, registerUser);
// Jika tetap publik, pastikan validasi sudah cukup.
router.post(
  "/register",
  // Aturan validasi diimpor dari controller
  validateRegister,
  registerUser
);

// Rute Khusus Admin
router.get("/siswa", protect, admin, getAllSiswa); // Rute baru untuk mendapatkan semua siswa

router
  .route("/:id")
  .get(protect, admin, getUserById)
  // Apply update user validation middleware
  .put(protect, admin, validateUpdateUser, updateUser)
  .delete(protect, admin, deleteUser);

export default router;
