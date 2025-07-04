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
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rute Publik
router.post("/login", loginUser);
router.post("/register", registerUser);

// Rute Khusus Admin
router.get("/siswa", protect, admin, getAllSiswa); // Rute baru untuk mendapatkan semua siswa

router
  .route("/:id")
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router;
