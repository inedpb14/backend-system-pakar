// backend/src/routes/aturanRoutes.js

import express from "express";
import { createAturan, getAllAturan, deleteAturan,getAturanById,updateAturan } from "../controllers/aturanController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getAllAturan).post(protect, admin, createAturan);

router
  .route("/:id")
  .get(getAturanById) 
  .put(protect, admin, updateAturan)
  .delete(protect, admin, deleteAturan);

export default router;
