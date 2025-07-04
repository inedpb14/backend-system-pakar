// backend/src/controllers/solusiController.js

import Solusi from "../models/solusi.js";

// @desc    Membuat solusi baru
// @route   POST /api/solusi
// @access  Private/Admin
const createSolusi = async (req, res) => {
  const { kodeSolusi, namaSolusi, deskripsi } = req.body;

  try {
    const solusi = await Solusi.create({
      kodeSolusi,
      namaSolusi,
      deskripsi,
    });
    res.status(201).json(solusi);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Gagal membuat solusi", error: error.message });
  }
};

// @desc    Mendapatkan semua solusi
// @route   GET /api/solusi
// @access  Public
const getAllSolusi = async (req, res) => {
  try {
    const solusi = await Solusi.find({});
    res.json(solusi);
  } catch (error) {
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
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update solusi
// @route   PUT /api/solusi/:id
// @access  Private/Admin
export const updateSolusi = async (req, res) => {
  const { kodeSolusi, namaSolusi, deskripsi } = req.body;
  try {
    const solusi = await Solusi.findById(req.params.id);
    if (solusi) {
      solusi.kodeSolusi = kodeSolusi || solusi.kodeSolusi;
      solusi.namaSolusi = namaSolusi || solusi.namaSolusi;
      solusi.deskripsi = deskripsi || solusi.deskripsi;
      
      const updatedSolusi = await solusi.save();
      res.json(updatedSolusi);
    } else {
      res.status(404).json({ message: 'Solusi tidak ditemukan' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Update gagal', error: error.message });
  }
};

// @desc    Delete solusi
// @route   DELETE /api/solusi/:id
// @access  Private/Admin
export const deleteSolusi = async (req, res) => {
  try {
    const solusi = await Solusi.findById(req.params.id);
    if (solusi) {
      await solusi.deleteOne();
      res.json({ message: 'Solusi berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Solusi tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export { createSolusi, getAllSolusi };
