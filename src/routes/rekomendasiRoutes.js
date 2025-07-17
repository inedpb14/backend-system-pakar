// backend/src/routes/rekomendasiRoutes.js
import express from "express";
import {
  createRekomendasi,
  getAllRekomendasi,
  getRekomendasiById,
  updateRekomendasi,
  deleteRekomendasi,
  validateRekomendasi,
} from "../controllers/rekomendasiController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getAllRekomendasi)
  .post(protect, admin, validateRekomendasi, createRekomendasi);

router
  .route("/:id")
  .get(getRekomendasiById)
  .put(protect, admin, validateRekomendasi, updateRekomendasi)
  .delete(protect, admin, deleteRekomendasi);

export default router;
