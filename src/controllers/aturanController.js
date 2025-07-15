// backend/src/controllers/aturanController.js

import Aturan from "../models/Aturan.js";
import { check, validationResult } from "express-validator"; // Import validation tools

// Validation rules for Aturan
const validateAturan = [
  check("kodeAturan", "Kode Aturan wajib diisi").notEmpty(),
  check("namaAturan", "Nama Aturan wajib diisi").notEmpty(),
  check("gejala", "Gejala wajib diisi dan berupa array ID")
    .isArray()
    .notEmpty(),
  check("solusi", "Solusi wajib diisi")
    .notEmpty()
    .isMongoId()
    .withMessage("ID Solusi tidak valid"),
];

// @desc    Membuat aturan baru
// @route   POST /api/aturan
// @access  Private/Admin
const createAturan = async (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { kodeAturan, namaAturan, gejala, solusi } = req.body;
  try {
    const aturan = await Aturan.create({
      kodeAturan,
      namaAturan,
      gejala,
      solusi,
    });
    res.status(201).json(aturan);
  } catch (error) {
    console.error("Error creating aturan:", error); // Log error
    res
      .status(400)
      .json({ message: "Gagal membuat aturan", error: error.message });
  }
};

// @desc    Mendapatkan semua aturan dengan pagination
// @route   GET /api/aturan
// @access  Public
const getAllAturan = async (req, res) => {
  const pageSize = parseInt(req.query.limit) || 10; // Default 10 items per page
  const page = parseInt(req.query.page) || 1; // Default page 1

  const skip = (page - 1) * pageSize;

  try {
    const count = await Aturan.countDocuments({}); // Get total count for pagination info
    const aturan = await Aturan.find({})
      .limit(pageSize) // Apply limit
      .skip(skip) // Apply skip
      .populate({
        path: "gejala",
        populate: { path: "kategori", select: "namaKategori" },
      })
      .populate("solusi");

    res.json({
      aturan,
      page,
      pages: Math.ceil(count / pageSize),
      total: count, // Include total count
    });
  } catch (error) {
    console.error("Error fetching all aturan:", error); // Log error
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// @desc    Mendapatkan aturan by ID
// @route   GET /api/aturan/:id
// @access  Public
const getAturanById = async (req, res) => {
  try {
    const aturan = await Aturan.findById(req.params.id)
      .populate("gejala")
      .populate("solusi");

    if (aturan) {
      res.json(aturan);
    } else {
      res.status(404).json({ message: "Aturan tidak ditemukan" });
    }
  } catch (error) {
    // Handle CastError for invalid ID format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID Aturan tidak valid" });
    }
    console.error("Error fetching aturan by ID:", error); // Log other errors
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update aturan
// @route   PUT /api/aturan/:id
// @access  Private/Admin
const updateAturan = async (req, res) => {
  // Check validation results (apply validation middleware before this function)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { kodeAturan, namaAturan, gejala, solusi } = req.body;
  try {
    const aturan = await Aturan.findById(req.params.id);
    if (aturan) {
      aturan.kodeAturan = kodeAturan ?? aturan.kodeAturan; // Use nullish coalescing
      aturan.namaAturan = namaAturan ?? aturan.namaAturan;
      aturan.gejala = gejala ?? aturan.gejala;
      aturan.solusi = solusi ?? aturan.solusi;

      const updatedAturan = await aturan.save();
      res.json(updatedAturan);
    } else {
      res.status(404).json({ message: "Aturan tidak ditemukan" });
    }
  } catch (error) {
    // Handle CastError for invalid ID format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID Aturan tidak valid" });
    }
    console.error("Error updating aturan:", error); // Log other errors
    res.status(400).json({ message: "Update gagal", error: error.message });
  }
};

// @desc    Delete aturan
// @route   DELETE /api/aturan/:id
// @access  Private/Admin
const deleteAturan = async (req, res) => {
  try {
    const aturan = await Aturan.findById(req.params.id);
    if (aturan) {
      await aturan.deleteOne();
      res.json({ message: "Aturan berhasil dihapus" });
    } else {
      res.status(404).json({ message: "Aturan tidak ditemukan" });
    }
  } catch (error) {
    // Handle CastError for invalid ID format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID Aturan tidak valid" });
    }
    console.error("Error deleting aturan:", error); // Log other errors
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get rules that contain a specific Gejala ID
// @route   GET /api/aturan/bygejala/:gejalaId
// @access  Private/Admin (or Public depending on requirement)
const getAturanByGejalaId = async (req, res) => {
  try {
    const gejalaId = req.params.gejalaId;

    // Validate if gejalaId is a valid MongoId
    if (!gejalaId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "ID Gejala tidak valid" });
    }

    // Find rules where the gejala array contains the given gejalaId
    const aturan = await Aturan.find({ gejala: gejalaId })
      .populate({
        path: "gejala",
        populate: { path: "kategori", select: "namaKategori" },
      })
      .populate("solusi");

    res.json(aturan);
  } catch (error) {
    console.error("Error fetching aturan by gejala ID:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// --- PASTIKAN SEMUA FUNGSI DIEKSPOR DI SINI ---
export {
  createAturan,
  getAllAturan,
  getAturanById,
  updateAturan,
  deleteAturan,
  getAturanByGejalaId, // Export the new function
  validateAturan, // Export validation rules to be used in routes
};
