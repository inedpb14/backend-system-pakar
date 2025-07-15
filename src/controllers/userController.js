// backend/src/controllers/userController.js

import User from "../models/user.js";
import RiwayatKonsultasi from "../models/RiwayatKonsultasi.js"; // Import RiwayatKonsultasi model
import { check, validationResult } from "express-validator"; // Untuk validasi input
import generateToken from "../utils/generateToken.js"; // <-- perhatikan .js

// Validation rules for User login
const validateLogin = [
  check('username', 'Username wajib diisi').notEmpty(),
  check('password', 'Password wajib diisi').notEmpty(),
];

// Validation rules for User registration
const validateRegister = [
  check('username', 'Username wajib diisi').notEmpty(),
  check('password', 'Password wajib diisi dan minimal 6 karakter').isLength({ min: 6 }),
  check('role', 'Role wajib diisi').notEmpty().isIn(['admin', 'siswa']).withMessage('Role harus "admin" atau "siswa"'),
  // Validate kelasId only if role is 'siswa'
  check('kelas').optional().isMongoId().withMessage('ID Kelas tidak valid'),
];

// Validation rules for User update
const validateUpdateUser = [
  check('username', 'Username tidak boleh kosong').optional().notEmpty(),
  check('role', 'Role tidak valid').optional().isIn(['admin', 'siswa']).withMessage('Role harus "admin" atau "siswa"'),
  check('kelasId', 'ID Kelas tidak valid').optional().isMongoId().withMessage('ID Kelas tidak valid'),
  check('password', 'Password minimal 6 karakter').optional().isLength({ min: 6 }),
];

// @desc    Login user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        kelas: user.kelas, // Kirim info kelas saat login
        token: generateToken(res, user._id),
      });
    } else {
      res.status(401).json({ message: 'Username atau password salah' });
    }
  } catch (error) {
    console.error("Error during login:", error); // Log error
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public (atau bisa diubah ke Private/Admin jika hanya admin yang boleh mendaftar)
const registerUser = async (req, res) => {
  // Periksa hasil validasi
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, password, role, kelas } = req.body; // 'kelas' here is the ID

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: "Username sudah terdaftar" });
    }
    const user = await User.create({ username, password, role, kelas });
    res.status(201).json({
      _id: user._id,
      username: user.username,
      role: user.role,
      kelas: user.kelas,
      token: generateToken(res, user._id),
    });
  } catch (error) {
    console.error("Error during registration:", error); // Log error
    res
      .status(400)
      .json({ message: "Data pengguna tidak valid", error: error.message });
  }
};

// @desc    Get all users with role 'siswa' with pagination
// @route   GET /api/users/siswa
// @access  Private/Admin
const getAllSiswa = async (req, res) => {
  const pageSize = parseInt(req.query.limit) || 10; // Default 10 items per page
  const page = parseInt(req.query.page) || 1; // Default page 1

  const skip = (page - 1) * pageSize;

  try {
    const count = await User.countDocuments({ role: 'siswa' }); // Count only siswa
    const siswa = await User.find({ role: 'siswa' })
      .limit(pageSize) // Apply limit
      .skip(skip) // Apply skip
      .populate('kelas', 'namaKelas')
      .select('-password');
    
    res.json({
      siswa,
      page,
      pages: Math.ceil(count / pageSize),
      total: count // Include total count
    });
  } catch (error) {
    console.error("Error fetching all siswa:", error); // Log error
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('kelas', 'namaKelas').select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User tidak ditemukan' });
    }
  } catch (error) {
    // Handle CastError for invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID User tidak valid' });
    }
    console.error("Error fetching user by ID:", error); // Log other errors
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user (termasuk kelas)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  // Check validation results (apply validation middleware before this function)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.username = req.body.username ?? user.username; // Use nullish coalescing
      user.role = req.body.role ?? user.role;
      user.kelas = req.body.kelasId ?? user.kelas; // Terima kelasId dari form frontend

      // Jika password dikirim, update juga passwordnya
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        role: updatedUser.role,
        kelas: updatedUser.kelas,
      });
    } else {
      res.status(404).json({ message: 'User tidak ditemukan' });
    }
  } catch (error) {
    // Handle CastError for invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID User tidak valid' });
    }
    console.error("Error updating user:", error); // Log other errors
    res.status(400).json({ message: 'Update gagal', error: error.message });
  }
};

// @desc    Delete user (and associated data)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      // Hapus riwayat konsultasi yang terkait dengan pengguna ini
      await RiwayatKonsultasi.deleteMany({ siswa: user._id });
      
      // Hapus pengguna secara permanen
      await user.deleteOne();
      res.json({ message: 'User dan riwayat terkait berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'User tidak ditemukan' });
    }
  } catch (error) {
    // Handle CastError for invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID User tidak valid' });
    }
    console.error("Error deleting user:", error); // Log other errors
    res.status(500).json({ message: 'Server Error' });
  }
};


export {
  loginUser,
  registerUser,
  getAllSiswa,
  getUserById,
  updateUser,
  deleteUser,
  validateLogin, // Export validation rules
  validateRegister, // Export validation rules
  validateUpdateUser // Export validation rules
};