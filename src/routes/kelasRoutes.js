// backend/src/routes/kelasRoutes.js

import express from "express";
import {
  createKelas,
  getAllKelas,
  getKelasById,
  updateKelas,
  deleteKelas,
} from "../controllers/kelasController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rute untuk collection (/api/kelas)
router
  .route("/")
  .get(getAllKelas) // GET untuk semua kelas bisa diakses publik
  .post(protect, admin, createKelas); // POST hanya untuk admin

// Rute untuk item tunggal (/api/kelas/:id)
router
  .route("/:id")
  .get(getKelasById) // GET satu kelas bisa diakses publik
  .put(protect, admin, updateKelas) // PUT hanya untuk admin
  .delete(protect, admin, deleteKelas); // DELETE hanya untuk admin

export default router;
