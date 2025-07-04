// file: backend/src/routes/konsultasiRoutes.js

import express from "express";
import {
  prosesKonsultasi,
  getRiwayatSaya,
  getAllRiwayatForAdmin,
  getRiwayatDetail,
  deleteRiwayat,
} from "../controllers/konsultasiController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- RUTE UNTUK SISWA ---
router.post("/proses", protect, prosesKonsultasi);
router.get("/riwayat", protect, getRiwayatSaya);

// --- RUTE BARU UNTUK ADMIN ---
// Menggunakan '/admin/semua' agar tidak konflik dengan rute siswa
router.get("/admin/semua", protect, admin, getAllRiwayatForAdmin);

// Rute untuk detail dan delete menggunakan parameter ID
router
  .route("/:id")
  .get(protect, admin, getRiwayatDetail)
  .delete(protect, admin, deleteRiwayat);

export default router;
