// backend/src/routes/userRoutes.js
import express from "express";
import {
  loginUser,
  registerUser,
  // getAllUsers, // Anda bisa membuat fungsi ini di controller jika perlu
  getUserById,
  updateUser,
  deleteUser,
  validateLogin,
  validateRegister,
  validateUpdateUser,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Rute Publik
router.post("/login", validateLogin, loginUser);
router.post("/register", validateRegister, registerUser);

// Rute Admin untuk manajemen pengguna
// router.route("/").get(protect, admin, getAllUsers); // Contoh jika ingin get all users

router
  .route("/:id")
  .get(protect, admin, getUserById)
  .put(protect, admin, validateUpdateUser, updateUser)
  .delete(protect, admin, deleteUser);

export default router;
