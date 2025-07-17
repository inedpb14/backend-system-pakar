// backend/src/routes/aturanRoutes.js

import express from "express";
import { 
  createAturan, 
  getAllAturan, 
  getAturanById, 
  updateAturan, 
  deleteAturan, 
  getAturanByKarakteristikId, // Import the new function
  validateAturan, // Import validation rules
} from "../controllers/aturanController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rute untuk Admin
router.route("/")
  .post(protect, admin, validateAturan, createAturan) // Apply validation middleware
  .get(getAllAturan); // This should be placed after the POST route for '/'

router.route("/bykarakteristik/:karakteristikId")
  .get(protect, admin, getAturanByKarakteristikId); // New route for admin helper

// Rute untuk Admin dan Publik (tergantung kebutuhan getById)
router.route("/:id")
  .get(getAturanById) // Public access for getting by ID might be okay
  .put(protect, admin, validateAturan, updateAturan) // Apply validation middleware
  .delete(protect, admin, deleteAturan);

export default router;
