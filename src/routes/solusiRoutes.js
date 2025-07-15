// backend/src/routes/solusiRoutes.js

import express from "express";
import { createSolusi, getAllSolusi, deleteSolusi, getSolusiById, updateSolusi, validateSolusi } from "../controllers/solusiController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Definisikan rute untuk /api/solusi
router.route("/")
  .get(getAllSolusi) // This should be placed after the POST route for '/'
  .post(protect, admin, validateSolusi, createSolusi); // Apply validation middleware
// Rute untuk item tunggal (/api/solusi/:id)
router.route('/:id')
  .get(getSolusiById)
  .put(protect, admin, validateSolusi, updateSolusi) // Apply validation middleware
  .delete(protect, admin, deleteSolusi); // Soft delete handled in controller

export default router;
