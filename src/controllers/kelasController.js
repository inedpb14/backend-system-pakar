// backend/src/controllers/kelasController.js

import Kelas from "../models/Kelas.js";
import User from "../models/user.js";
import { check, validationResult } from "express-validator";

// Validation rules for Kelas
const validateKelas = [check("namaKelas", "Nama Kelas wajib diisi").notEmpty()];

// @desc    Membuat kelas baru
// @route   POST /api/kelas
// @access  Private/Admin
const createKelas = async (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { namaKelas, deskripsi } = req.body;
  try {
    const kelasExists = await Kelas.findOne({ namaKelas });
    if (kelasExists) {
      return res.status(400).json({ message: "Nama kelas sudah ada" });
    }
    const kelas = await Kelas.create({ namaKelas, deskripsi });
    res.status(201).json(kelas);
  } catch (error) {
    console.error("Error creating kelas:", error); // Log error
    res
      .status(400)
      .json({ message: "Gagal membuat kelas", error: error.message });
  }
};

// @desc    Mendapatkan semua kelas
// @route   GET /api/kelas
// @access  Public
const getAllKelas = async (req, res) => {
  const pageSize = parseInt(req.query.limit) || 10; // Default 10 items per page
  const page = parseInt(req.query.page) || 1; // Default page 1

  const skip = (page - 1) * pageSize;

  try {
    const count = await Kelas.countDocuments({}); // Get total count
    const kelas = await Kelas.find({})
      .limit(pageSize) // Apply limit
      .skip(skip); // Apply skip

    res.json({
      kelas,
      page,
      pages: Math.ceil(count / pageSize),
      total: count, // Include total count
    });
  } catch (error) {
    console.error("Error fetching all kelas:", error); // Log error
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// @desc    Mendapatkan kelas by ID
// @route   GET /api/kelas/:id
// @access  Public
const getKelasById = async (req, res) => {
  try {
    const kelas = await Kelas.findById(req.params.id);
    if (kelas) {
      res.json(kelas);
    } else {
      res.status(404).json({ message: "Kelas tidak ditemukan" });
    }
  } catch (error) {
    // Handle CastError for invalid ID format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID Kelas tidak valid" });
    }
    console.error("Error fetching kelas by ID:", error); // Log other errors
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update kelas
// @route   PUT /api/kelas/:id
// @access  Private/Admin
const updateKelas = async (req, res) => {
  // Check validation results (apply validation middleware before this function)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { namaKelas, deskripsi } = req.body;
  try {
    const kelas = await Kelas.findById(req.params.id);
    if (kelas) {
      kelas.namaKelas = namaKelas ?? kelas.namaKelas; // Use nullish coalescing
      kelas.deskripsi = deskripsi ?? kelas.deskripsi; // Mengizinkan deskripsi kosong
      const updatedKelas = await kelas.save();
      res.json(updatedKelas);
    } else {
      res.status(404).json({ message: "Kelas tidak ditemukan" });
    }
  } catch (error) {
    // Handle CastError for invalid ID format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID Kelas tidak valid" });
    }
    console.error("Error updating kelas:", error); // Log other errors
    res.status(400).json({ message: "Update gagal", error: error.message });
  }
};

// @desc    Delete kelas
// @route   DELETE /api/kelas/:id
// @access  Private/Admin
const deleteKelas = async (req, res) => {
  try {
    const kelas = await Kelas.findById(req.params.id);
    if (kelas) {
      await kelas.deleteOne();
      res.json({ message: "Kelas berhasil dihapus" });
    } else {
      res.status(404).json({ message: "Kelas tidak ditemukan" });
    }
  } catch (error) {
    // Handle CastError for invalid ID format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID Kelas tidak valid" });
    }
    console.error("Error deleting kelas:", error); // Log other errors
    res.status(500).json({ message: "Server Error" });
  }
};

export {
  createKelas,
  getAllKelas,
  getKelasById,
  updateKelas,
  deleteKelas,
  validateKelas, // Export validation rules
};
