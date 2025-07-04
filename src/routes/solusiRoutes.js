// backend/src/routes/solusiRoutes.js

import express from "express";
import { createSolusi, getAllSolusi, deleteSolusi, getSolusiById, updateSolusi } from "../controllers/solusiController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Definisikan rute untuk /api/solusi
router.route("/").get(getAllSolusi).post(protect, admin, createSolusi);
// Rute untuk item tunggal (/api/solusi/:id)
router.route('/:id')
  .get(getSolusiById)
  .put(protect, admin, updateSolusi)
  .delete(protect, admin, deleteSolusi);
export default router;
