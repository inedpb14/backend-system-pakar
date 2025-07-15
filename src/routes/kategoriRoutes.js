import express from "express";
import {
  createKategori,
  getAllKategori,
  getKategoriById,
  updateKategori,
  deleteKategori,
  validateKategori,
} from "../controllers/kategoriController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rute untuk Admin
router.route("/").post(protect, admin, validateKategori, createKategori); // Apply validation middleware

router
  .route("/:id")
  .get(getKategoriById) // Public access might be okay
  .put(protect, admin, validateKategori, updateKategori) // Apply validation middleware
  .delete(protect, admin, deleteKategori); // Delete check handled in controller

// Rute Publik (biasanya getAll bisa diakses publik)
router.route("/").get(getAllKategori); // This should be placed after the POST route for '/'

export default router;
