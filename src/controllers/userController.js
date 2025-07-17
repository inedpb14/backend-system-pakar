// backend/src/controllers/userController.js

import User from "../models/User.js";
import Subjek from "../models/Subjek.js"; // Diperlukan untuk proses delete
import { check, validationResult } from "express-validator";
import generateToken from "../utils/generateToken.js";

// Wrapper untuk menangani error pada fungsi async
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Aturan validasi
export const validateLogin = [
  check("email", "Email wajib diisi dan valid").isEmail(),
  check("password", "Password wajib diisi").notEmpty(),
];

export const validateRegister = [
  check("namaLengkap", "Nama Lengkap wajib diisi").notEmpty().trim(),
  check("email", "Email wajib diisi dan valid").isEmail(),
  check("password", "Password minimal 6 karakter").isLength({ min: 6 }),
  check("role", "Role wajib diisi")
    .notEmpty()
    .isIn(["admin", "guru", "pengguna"]),
];

export const validateUpdateUser = [
  check("namaLengkap", "Nama Lengkap tidak boleh kosong")
    .optional()
    .notEmpty()
    .trim(),
  check("email", "Format email tidak valid").optional().isEmail(),
  check("role", "Role tidak valid")
    .optional()
    .isIn(["admin", "guru", "pengguna"]),
];

// @desc    Login user & get token
export const loginUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.json({
      _id: user._id,
      namaLengkap: user.namaLengkap,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(401);
    throw new Error("Email atau password salah");
  }
});

// @desc    Register a new user
export const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { namaLengkap, email, password, role } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User dengan email tersebut sudah terdaftar");
  }

  const user = await User.create({ namaLengkap, email, password, role });

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      namaLengkap: user.namaLengkap,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(400);
    throw new Error("Data pengguna tidak valid");
  }
});

// @desc    Get all users (for admin)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const pageSize = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const [users, count] = await Promise.all([
    User.find({})
      .limit(pageSize)
      .skip((page - 1) * pageSize)
      .select("-password")
      .sort({ createdAt: -1 }),
    User.countDocuments({}),
  ]);

  res.json({
    users,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get user by ID (for admin)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User tidak ditemukan");
  }
});

// @desc    Update user (for admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const user = await User.findById(req.params.id);

  if (user) {
    user.namaLengkap = req.body.namaLengkap || user.namaLengkap;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;

    // Jika ada password baru, middleware pre-save akan otomatis meng-hashnya
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      namaLengkap: updatedUser.namaLengkap,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error("User tidak ditemukan");
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === "admin") {
      res.status(400);
      throw new Error("Tidak dapat menghapus pengguna admin.");
    }

    // Hapus juga Subjek yang terkait dengan User ini
    await Subjek.deleteMany({ id_user: user._id });

    await user.deleteOne();
    res.json({ message: "User dan data subjek terkait berhasil dihapus." });
  } else {
    res.status(404);
    throw new Error("User tidak ditemukan");
  }
});
