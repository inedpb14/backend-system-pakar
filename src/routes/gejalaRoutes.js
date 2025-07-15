// backend/src/routes/gejalaRoutes.js

import express from "express";
import { createGejala, getAllGejala, getGejalaById, deleteGejala, updateGejala, validateGejala } from "../controllers/gejalaController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rute untuk mendapatkan semua gejala (publik) dan membuat gejala baru (hanya admin)
router.route("/")
  .get(getAllGejala) // This should be placed after the POST route for '/'
  .post(protect, admin, validateGejala, createGejala); // Apply validation middleware

// Rute untuk item tunggal (/api/gejala/:id)
router.route('/:id')
  .get(getGejalaById)
  .put(protect, admin, validateGejala, updateGejala) // Apply validation middleware
  .delete(protect, admin, deleteGejala); // Soft delete handled in controller

export default router;
