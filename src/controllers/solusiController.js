// backend/src/controllers/solusiController.js

import Solusi from "../models/solusi.js";
import { check, validationResult } from 'express-validator'; // Import validation tools

// Validation rules for Solusi
const validateSolusi = [
  check('kodeSolusi', 'Kode Solusi wajib diisi').notEmpty(),
  check('namaSolusi', 'Nama Solusi wajib diisi').notEmpty(),
  check('deskripsi', 'Deskripsi wajib diisi').notEmpty(),
];

// @desc    Membuat solusi baru
// @route   POST /api/solusi
// @access  Private/Admin
const createSolusi = async (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { kodeSolusi, namaSolusi, deskripsi } = req.body;

  try {
    const solusi = await Solusi.create({
      kodeSolusi,
      namaSolusi,
      deskripsi,
      status: 'active', // Set status default menjadi 'active'
    });
    res.status(201).json(solusi);
  } catch (error) {
    console.error("Error creating solusi:", error); // Log error
    res
      .status(400)
      .json({ message: "Gagal membuat solusi", error: error.message });
  }
};

// @desc    Mendapatkan semua solusi dengan filter status dan pagination
// @route   GET /api/solusi
// @access  Public
const getAllSolusi = async (req, res) => {
  const { status } = req.query; // Ambil parameter status dari query string
  const pageSize = parseInt(req.query.limit) || 10; // Default 10 items per page
  const page = parseInt(req.query.page) || 1; // Default page 1

  const skip = (page - 1) * pageSize;

  let filter = {};

  if (status === 'all') {
    // Tidak ada filter status, ambil semua
    filter = {};
  } else if (status === 'deleted') {
    // Ambil hanya yang berstatus 'deleted'
    filter = { status: 'deleted' };
  } else {
    // Default: Ambil hanya yang berstatus 'active'
    filter = { status: 'active' };
  }

  try {
    const count = await Solusi.countDocuments(filter); // Get total count with filter
    const solusi = await Solusi.find(filter) // Terapkan filter di sini
      .limit(pageSize) // Apply limit
      .skip(skip); // Apply skip
    
    res.json({
      solusi,
      page,
      pages: Math.ceil(count / pageSize),
      total: count // Include total count
    });
  } catch (error) {
    console.error("Error fetching all solusi:", error); // Log error
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};


// @desc    Mendapatkan solusi by ID
// @route   GET /api/solusi/:id
// @access  Public
export const getSolusiById = async (req, res) => {
  try {
    const solusi = await Solusi.findById(req.params.id);
    if (solusi) {
      res.json(solusi);
    } else {
      res.status(404).json({ message: 'Solusi tidak ditemukan' });
    }
  } catch (error) {
    // Handle CastError for invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID Solusi tidak valid' });
    }
    console.error("Error fetching solusi by ID:", error); // Log other errors
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update solusi
// @route   PUT /api/solusi/:id
// @access  Private/Admin
export const updateSolusi = async (req, res) => {
  // Check validation results (apply validation middleware before this function)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { kodeSolusi, namaSolusi, deskripsi, status } = req.body; // Tambahkan status di sini
  try {
    const solusi = await Solusi.findById(req.params.id);
    if (solusi) {
      solusi.kodeSolusi = kodeSolusi ?? solusi.kodeSolusi; // Use nullish coalescing
      solusi.namaSolusi = namaSolusi ?? solusi.namaSolusi;
      solusi.deskripsi = deskripsi ?? solusi.deskripsi;
      solusi.status = status ?? solusi.status; // Update status if provided
      
      const updatedSolusi = await solusi.save();
      res.json(updatedSolusi);
    } else {
      res.status(404).json({ message: 'Solusi tidak ditemukan' });
    }
  } catch (error) {
    // Handle CastError for invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID Solusi tidak valid' });
    }
    console.error("Error updating solusi:", error); // Log other errors
    res.status(400).json({ message: 'Update gagal', error: error.message });
  }
};

// @desc    Delete solusi (Soft Delete)
// @route   DELETE /api/solusi/:id
// @access  Private/Admin
export const deleteSolusi = async (req, res) => {
  try {
    const solusi = await Solusi.findById(req.params.id);
    if (solusi) {
      // Soft delete: update status instead of deleting
      solusi.status = 'deleted';
      await solusi.save();
      res.json({ message: 'Solusi berhasil dihapus (soft deleted)' });
    } else {
      res.status(404).json({ message: 'Solusi tidak ditemukan' });
    }
  } catch (error) {
    // Handle CastError for invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID Solusi tidak valid' });
    }
    console.error("Error deleting solusi:", error); // Log other errors
    res.status(500).json({ message: 'Server Error' });
  }
};

export { createSolusi, getAllSolusi, validateSolusi }; // Export validation rules
