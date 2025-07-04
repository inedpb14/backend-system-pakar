// backend/src/controllers/userController.js

import User from "../models/user.js";
import { validationResult } from "express-validator"; // Untuk validasi input
import generateToken from "../utils/generateToken.js"; // <-- perhatikan .js

// @desc    Login user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
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
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public (atau bisa diubah ke Private/Admin jika hanya admin yang boleh mendaftar)
const registerUser = async (req, res) => {
  const { username, password, role, kelas } = req.body;
  // Periksa hasil validasi
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
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
    res
      .status(400)
      .json({ message: "Data pengguna tidak valid", error: error.message });
  }
};

// @desc    Get all users with role 'siswa'
// @route   GET /api/users/siswa
// @access  Private/Admin
const getAllSiswa = async (req, res) => {
  try {
    const siswa = await User.find({ role: 'siswa' }).populate('kelas', 'namaKelas').select('-password');
    res.json(siswa);
  } catch (error) {
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
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user (termasuk kelas)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.username = req.body.username || user.username;
      user.role = req.body.role || user.role;
      user.kelas = req.body.kelasId || user.kelas; // Terima kelasId dari form frontend

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
    res.status(400).json({ message: 'Update gagal', error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'User tidak ditemukan' });
    }
  } catch (error) {
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
};