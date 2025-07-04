// backend/src/routes/gejalaRoutes.js

import express from "express";
import { createGejala, getAllGejala, getGejalaById, deleteGejala, updateGejala } from "../controllers/gejalaController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rute untuk mendapatkan semua gejala (publik) dan membuat gejala baru (hanya admin)
router.route("/").get(getAllGejala).post(protect, admin, createGejala);

// Rute untuk item tunggal (/api/gejala/:id)
router.route('/:id')
  .get(getGejalaById)
  .put(protect, admin, updateGejala)
  .delete(protect, admin, deleteGejala);
export default router;
