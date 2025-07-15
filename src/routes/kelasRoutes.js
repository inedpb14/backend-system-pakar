// backend/src/routes/kelasRoutes.js

import express from "express";
import {
  createKelas,
  getAllKelas,
  getKelasById,
  updateKelas,
  deleteKelas,
  validateKelas, // Import validation rules
} from "../controllers/kelasController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rute untuk Admin
router
  .route("/")
  .post(protect, admin, validateKelas, createKelas); // Apply validation middleware

router
  .route("/:id")
  .get(getKelasById) // Public access might be okay
  .put(protect, admin, validateKelas, updateKelas) // Apply validation middleware
  .delete(protect, admin, deleteKelas); // Delete check handled in controller

// Rute Publik (biasanya getAll bisa diakses publik)
router.route("/").get(getAllKelas); // This should be placed after the POST route for '/'

export default router;
