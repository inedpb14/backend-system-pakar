import express from "express";
import {
  createKategori,
  getAllKategori,
  deleteKategori,
  getKategoriById,
  updateKategori,
} from "../controllers/kategoriController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();
router.route("/").get(getAllKategori).post(protect, admin, createKategori);

// Daftarkan rute baru untuk /:id
router
  .route("/:id")
  .get(getKategoriById)
  .put(protect, admin, updateKategori)
  .delete(protect, admin, deleteKategori);
export default router;
