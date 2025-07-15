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
router.route("/proses").post(protect, prosesKonsultasi);
router.route("/saya").get(protect, getRiwayatSaya);

// --- RUTE BARU UNTUK ADMIN ---
// Menggunakan '/admin/semua' agar tidak konflik dengan rute siswa
router.route("/admin/semua").get(protect, admin, getAllRiwayatForAdmin);

// Rute untuk detail dan delete menggunakan parameter ID
router.route("/:id").get(protect, admin, getRiwayatDetail).delete(protect, admin, deleteRiwayat);

export default router;
