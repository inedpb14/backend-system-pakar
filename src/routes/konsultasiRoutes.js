// file: backend/src/routes/konsultasiRoutes.js

import express from "express";
import {
  prosesKonsultasi,
  getHasilBySubjek,
  getAllHasilForAdmin,
  getHasilDetail,
  deleteHasil,
  validateKonsultasi,
} from "../controllers/konsultasiController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- RUTE UNTUK SISWA ---
router.route("/proses").post(protect, validateKonsultasi, prosesKonsultasi);
router.route("/subjek/:id_subjek").get(protect, getHasilBySubjek);

// --- RUTE BARU UNTUK ADMIN ---
// Menggunakan '/admin/semua' agar tidak konflik dengan rute siswa
router.route("/admin/semua").get(protect, admin, getAllHasilForAdmin);

// Rute untuk detail dan delete menggunakan parameter ID
router.route("/:id").get(protect, getHasilDetail).delete(protect, admin, deleteHasil);

export default router;
