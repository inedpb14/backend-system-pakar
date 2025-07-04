// backend/src/controllers/kelasController.js

import Kelas from "../models/Kelas.js";

// @desc    Membuat kelas baru
// @route   POST /api/kelas
// @access  Private/Admin
const createKelas = async (req, res) => {
  const { namaKelas, deskripsi } = req.body;
  try {
    const kelasExists = await Kelas.findOne({ namaKelas });
    if (kelasExists) {
      return res.status(400).json({ message: "Nama kelas sudah ada" });
    }
    const kelas = await Kelas.create({ namaKelas, deskripsi });
    res.status(201).json(kelas);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Gagal membuat kelas", error: error.message });
  }
};

// @desc    Mendapatkan semua kelas
// @route   GET /api/kelas
// @access  Public
const getAllKelas = async (req, res) => {
  try {
    const kelas = await Kelas.find({});
    res.json(kelas);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
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
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update kelas
// @route   PUT /api/kelas/:id
// @access  Private/Admin
const updateKelas = async (req, res) => {
  const { namaKelas, deskripsi } = req.body;
  try {
    const kelas = await Kelas.findById(req.params.id);
    if (kelas) {
      kelas.namaKelas = namaKelas || kelas.namaKelas;
      kelas.deskripsi = deskripsi ?? kelas.deskripsi; // Mengizinkan deskripsi kosong
      const updatedKelas = await kelas.save();
      res.json(updatedKelas);
    } else {
      res.status(404).json({ message: "Kelas tidak ditemukan" });
    }
  } catch (error) {
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
    res.status(500).json({ message: "Server Error" });
  }
};

export { createKelas, getAllKelas, getKelasById, updateKelas, deleteKelas };
