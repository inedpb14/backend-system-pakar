import express from "express";
import {
  createKarakteristik,
  getAllKarakteristik,
  getKarakteristikById,
  updateKarakteristik,
  deleteKarakteristik,
  validateKarakteristik,
} from "../controllers/karakteristikController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .post(protect, admin, validateKarakteristik, createKarakteristik)
  .get(getAllKarakteristik);

router
  .route("/:id")
  .get(getKarakteristikById)
  .put(protect, admin, validateKarakteristik, updateKarakteristik)
  .delete(protect, admin, deleteKarakteristik);

export default router;
