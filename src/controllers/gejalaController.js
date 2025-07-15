// backend/src/controllers/gejalaController.js

import Gejala from "../models/Gejala.js";
import { check, validationResult } from 'express-validator'; // Import validation tools

// Validation rules for Gejala
const validateGejala = [
  check('kodeGejala', 'Kode Gejala wajib diisi').notEmpty(),
  check('namaGejala', 'Nama Gejala wajib diisi').notEmpty(),
  check('kategoriId', 'ID Kategori wajib diisi').notEmpty().isMongoId().withMessage('ID Kategori tidak valid'),
];

// @desc    Membuat gejala baru
// @route   POST /api/gejala
// @access  Private/Admin
const createGejala = async (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { kodeGejala, namaGejala, kategoriId } = req.body;

  const gejalaExists = await Gejala.findOne({ kodeGejala });
  if (gejalaExists) {
    return res.status(400).json({ message: "Kode Gejala sudah ada" });
  }

  const gejala = new Gejala({
    kodeGejala,
    namaGejala,
    kategori: kategoriId, // Simpan ID kategori di sini
    status: 'active', // Set status default menjadi 'active'
  });

  try {
    const createdGejala = await gejala.save();
    res.status(201).json(createdGejala);
  } catch (error) {
    console.error("Error creating gejala:", error); // Log error
    res
      .status(400)
      .json({
        message: "Data tidak valid, pastikan kategoriId benar",
        error: error.message,
      });
  }
};

// @desc    Mendapatkan gejala by ID
// @route   GET /api/gejala/:id
// @access  Public
export const getGejalaById = async (req, res) => {
  try {
    const gejala = await Gejala.findById(req.params.id).populate('kategori', 'namaKategori');
    if (gejala) {
      res.json(gejala);
    } else {
      res.status(404).json({ message: 'Gejala tidak ditemukan' });
    }
  } catch (error) {
    // Handle CastError for invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID Gejala tidak valid' });
    }
    console.error("Error fetching gejala by ID:", error); // Log other errors
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update gejala
// @route   PUT /api/gejala/:id
// @access  Private/Admin
export const updateGejala = async (req, res) => {
   // Check validation results (apply validation middleware before this function)
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
   }

  const { kodeGejala, namaGejala, kategoriId, status } = req.body; // Tambahkan status di sini
  try {
    const gejala = await Gejala.findById(req.params.id);
    if (gejala) {
      gejala.kodeGejala = kodeGejala ?? gejala.kodeGejala; // Use nullish coalescing for updates
      gejala.namaGejala = namaGejala ?? gejala.namaGejala;
      gejala.kategori = kategoriId ?? gejala.kategori;
      gejala.status = status ?? gejala.status; // Update status if provided
      
      const updatedGejala = await gejala.save();
      res.json(updatedGejala);
    } else {
      res.status(404).json({ message: 'Gejala tidak ditemukan' });
    }
  } catch (error) {
    // Handle CastError for invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID Gejala tidak valid' });
    }
    console.error("Error updating gejala:", error); // Log other errors
    res.status(400).json({ message: 'Update gagal', error: error.message });
  }
};

// @desc    Delete gejala (Soft Delete)
// @route   DELETE /api/gejala/:id
// @access  Private/Admin
export const deleteGejala = async (req, res) => {
  try {
    const gejala = await Gejala.findById(req.params.id);
    if (gejala) {
      // Soft delete: update status instead of deleting
      gejala.status = 'deleted';
      await gejala.save();
      res.json({ message: 'Gejala berhasil dihapus (soft deleted)' });
    } else {
      res.status(404).json({ message: 'Gejala tidak ditemukan' });
    }
  } catch (error) {
    // Handle CastError for invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID Gejala tidak valid' });
    }
    console.error("Error deleting gejala:", error); // Log other errors
    res.status(500).json({ message: 'Server Error' });
  }
};


// @desc    Mendapatkan semua gejala dengan filter status dan pagination
// @route   GET /api/gejala
// @access  Public
const getAllGejala = async (req, res) => {
  const { status } = req.query; // Ambil parameter status dari query string
  const pageSize = parseInt(req.query.limit) || 10; // Default 10 items per page
  const page = parseInt(req.query.page) || 1; // Default page 1

  const skip = (page - 1) * pageSize;

  let filter = {};

  if (status === 'all') {
    filter = {};
  } else if (status === 'deleted') {
    filter = { status: 'deleted' };
  } else {
    filter = { status: 'active' }; // Default
  }

  try {
    const count = await Gejala.countDocuments(filter); // Get total count with filter
    // .populate() akan mengambil data dari collection lain berdasarkan ref
    // Di sini kita mengambil field 'namaKategori' dari dokumen Kategori yang terhubung
    const gejala = await Gejala.find(filter) // Terapkan filter di sini
      .limit(pageSize) // Apply limit
      .skip(skip) // Apply skip
      .populate(
        "kategori",
        "namaKategori deskripsi"
      );
    
    res.json({
      gejala,
      page,
      pages: Math.ceil(count / pageSize),
      total: count // Include total count
    });

  } catch (error) {
    console.error("Error fetching all gejala:", error); // Log error
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

export { createGejala, getAllGejala, validateGejala }; // Export validation rules
