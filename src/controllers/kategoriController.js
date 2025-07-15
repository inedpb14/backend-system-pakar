import Kategori from "../models/Kategori.js";
import Gejala from "../models/Gejala.js"; // Import Gejala model
import { check, validationResult } from 'express-validator'; // Import validation tools

// Validation rules for Kategori
const validateKategori = [
  check('namaKategori', 'Nama Kategori wajib diisi').notEmpty(),
  check('deskripsi', 'Deskripsi wajib diisi').notEmpty(),
];

// create kategori
const createKategori = async (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const kategori = await Kategori.create({
      namaKategori: req.body.namaKategori,
      deskripsi: req.body.deskripsi,
    });
    res.status(201).json(kategori);
  } catch (error) {
    console.error("Error creating kategori:", error); // Log error
    res
      .status(400)
      .json({ message: "Gagal membuat kategori", error: error.message });
  }
};

// @desc    Mendapatkan kategori by ID
// @route   GET /api/kategori/:id
// @access  Public
const getKategoriById = async (req, res) => {
  try {
    const kategori = await Kategori.findById(req.params.id);
    if (kategori) {
      res.json(kategori);
    } else {
      res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }
  } catch (error) {
    // Handle CastError for invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID Kategori tidak valid' });
    }
    console.error("Error fetching kategori by ID:", error); // Log other errors
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update kategori
// @route   PUT /api/kategori/:id
// @access  Private/Admin
const updateKategori = async (req, res) => {
  // Check validation results (apply validation middleware before this function)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { namaKategori, deskripsi } = req.body;
  try {
    const kategori = await Kategori.findById(req.params.id);
    if (kategori) {
      kategori.namaKategori = namaKategori ?? kategori.namaKategori; // Use nullish coalescing
      kategori.deskripsi = deskripsi ?? kategori.deskripsi;
      const updatedKategori = await kategori.save();
      res.json(updatedKategori);
    } else {
      res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }
  } catch (error) {
    // Handle CastError for invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID Kategori tidak valid' });
    }
    console.error("Error updating kategori:", error); // Log other errors
    res.status(400).json({ message: 'Update gagal', error: error.message });
  }
};

// @desc    Delete kategori (Prevent if referenced by Gejala)
// @route   DELETE /api/kategori/:id
// @access  Private/Admin
const deleteKategori = async (req, res) => {
  try {
    const kategori = await Kategori.findById(req.params.id);
    if (kategori) {
      // Periksa apakah ada gejala yang masih menggunakan kategori ini
      const gejalaCount = await Gejala.countDocuments({ kategori: kategori._id });

      if (gejalaCount > 0) {
        // Jika ada gejala yang terkait, batalkan penghapusan
        return res.status(400).json({ message: `Tidak dapat menghapus kategori karena masih digunakan oleh ${gejalaCount} gejala.` });
      }

      // Jika tidak ada gejala yang terkait, hapus kategori secara permanen
      await kategori.deleteOne();
      res.json({ message: 'Kategori berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }
  } catch (error) {
    // Handle CastError for invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID Kategori tidak valid' });
    }
    console.error("Error deleting kategori:", error); // Log other errors
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Mendapatkan semua kategori dengan pagination
// @route   GET /api/kategori
// @access  Public
const getAllKategori = async (req, res) => {
  const pageSize = parseInt(req.query.limit) || 10; // Default 10 items per page
  const page = parseInt(req.query.page) || 1; // Default page 1

  const skip = (page - 1) * pageSize;

  try {
    const count = await Kategori.countDocuments({}); // Get total count
    const kategori = await Kategori.find({})
      .limit(pageSize) // Apply limit
      .skip(skip); // Apply skip
    
    res.json({
      kategori,
      page,
      pages: Math.ceil(count / pageSize),
      total: count // Include total count
    });
  } catch (error) {
    console.error("Error fetching all kategori:", error); // Log error
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

export { createKategori, getAllKategori, getKategoriById, updateKategori, deleteKategori, validateKategori }; // Export validation rules
