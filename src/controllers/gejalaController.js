// backend/src/controllers/gejalaController.js

import Gejala from "../models/Gejala.js";

// @desc    Membuat gejala baru
// @route   POST /api/gejala
// @access  Private/Admin
const createGejala = async (req, res) => {
  // Sekarang kita butuh kategoriId saat membuat gejala
  const { kodeGejala, namaGejala, kategoriId } = req.body;

  const gejalaExists = await Gejala.findOne({ kodeGejala });
  if (gejalaExists) {
    return res.status(400).json({ message: "Kode Gejala sudah ada" });
  }

  const gejala = new Gejala({
    kodeGejala,
    namaGejala,
    kategori: kategoriId, // Simpan ID kategori di sini
  });

  try {
    const createdGejala = await gejala.save();
    res.status(201).json(createdGejala);
  } catch (error) {
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
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update gejala
// @route   PUT /api/gejala/:id
// @access  Private/Admin
export const updateGejala = async (req, res) => {
  const { kodeGejala, namaGejala, kategoriId } = req.body;
  try {
    const gejala = await Gejala.findById(req.params.id);
    if (gejala) {
      gejala.kodeGejala = kodeGejala || gejala.kodeGejala;
      gejala.namaGejala = namaGejala || gejala.namaGejala;
      gejala.kategori = kategoriId || gejala.kategori;
      
      const updatedGejala = await gejala.save();
      res.json(updatedGejala);
    } else {
      res.status(404).json({ message: 'Gejala tidak ditemukan' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Update gagal', error: error.message });
  }
};

// @desc    Delete gejala
// @route   DELETE /api/gejala/:id
// @access  Private/Admin
export const deleteGejala = async (req, res) => {
  try {
    const gejala = await Gejala.findById(req.params.id);
    if (gejala) {
      await gejala.deleteOne();
      res.json({ message: 'Gejala berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Gejala tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};


// @desc    Mendapatkan semua gejala
// @route   GET /api/gejala
// @access  Public
const getAllGejala = async (req, res) => {
  // .populate() akan mengambil data dari collection lain berdasarkan ref
  // Di sini kita mengambil field 'namaKategori' dari dokumen Kategori yang terhubung
  const gejala = await Gejala.find({}).populate(
    "kategori",
    "namaKategori deskripsi"
  );
  res.json(gejala);
};

export { createGejala, getAllGejala };
