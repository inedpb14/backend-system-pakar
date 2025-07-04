// backend/src/controllers/aturanController.js

import Aturan from "../models/Aturan.js";

// @desc    Membuat aturan baru
// @route   POST /api/aturan
// @access  Private/Admin
const createAturan = async (req, res) => {
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
    res
      .status(400)
      .json({ message: "Gagal membuat aturan", error: error.message });
  }
};

// @desc    Mendapatkan semua aturan
// @route   GET /api/aturan
// @access  Public
const getAllAturan = async (req, res) => {
  try {
    const aturan = await Aturan.find({})
      .populate({
        path: "gejala",
        populate: { path: "kategori", select: "namaKategori" },
      })
      .populate("solusi");
    res.json(aturan);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// ==============================================================
// --- FUNGSI-FUNGSI BARU YANG PERLU DITAMBAHKAN ---
// ==============================================================

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
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update aturan
// @route   PUT /api/aturan/:id
// @access  Private/Admin
const updateAturan = async (req, res) => {
  const { kodeAturan, namaAturan, gejala, solusi } = req.body;
  try {
    const aturan = await Aturan.findById(req.params.id);
    if (aturan) {
      aturan.kodeAturan = kodeAturan;
      aturan.namaAturan = namaAturan;
      aturan.gejala = gejala;
      aturan.solusi = solusi;

      const updatedAturan = await aturan.save();
      res.json(updatedAturan);
    } else {
      res.status(404).json({ message: "Aturan tidak ditemukan" });
    }
  } catch (error) {
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
    res.status(500).json({ message: "Server Error" });
  }
};

// --- PASTIKAN SEMUA FUNGSI DIEKSPOR DI SINI ---
export {
  createAturan,
  getAllAturan,
  getAturanById,
  updateAturan,
  deleteAturan,
};
