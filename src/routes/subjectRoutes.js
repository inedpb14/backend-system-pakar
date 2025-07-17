// backend/src/routes/subjekRoutes.js

import express from "express";

import {
  createSubjek,
  getAllSubjek,
  getSubjekById,
  updateSubjek,
  deleteSubjek,
  validateSubjek, // Jangan lupa buat validatornya juga
} from "../controllers/subjekController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rute untuk mendapatkan semua subjek (hanya admin)
// dan membuat subjek baru (bisa oleh guru atau admin)
router
  .route("/")
  .get(protect, admin, getAllSubjek)
  .post(protect, validateSubjek, createSubjek);

// Rute untuk satu subjek spesifik berdasarkan ID
router
  .route("/:id")
  .get(protect, getSubjekById) // Pengguna terotentikasi bisa melihat detail subjek
  .put(protect, validateSubjek, updateSubjek) // Hanya admin/guru yang bisa update
  .delete(protect, admin, deleteSubjek); // Hanya admin yang bisa menghapus subjek

export default router;
