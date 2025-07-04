import Kategori from "../models/Kategori.js";

// create kategori
const createKategori = async (req, res) => {
  try {
    const kategori = await Kategori.create({
      namaKategori: req.body.namaKategori,
      deskripsi: req.body.deskripsi,
    });
    res.status(201).json(kategori);
  } catch (error) {
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
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update kategori
// @route   PUT /api/kategori/:id
// @access  Private/Admin
const updateKategori = async (req, res) => {
  const { namaKategori, deskripsi } = req.body;
  try {
    const kategori = await Kategori.findById(req.params.id);
    if (kategori) {
      kategori.namaKategori = namaKategori || kategori.namaKategori;
      kategori.deskripsi = deskripsi || kategori.deskripsi;
      const updatedKategori = await kategori.save();
      res.json(updatedKategori);
    } else {
      res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Update gagal', error: error.message });
  }
};

// @desc    Delete kategori
// @route   DELETE /api/kategori/:id
// @access  Private/Admin
const deleteKategori = async (req, res) => {
  try {
    const kategori = await Kategori.findById(req.params.id);
    if (kategori) {
      await kategori.deleteOne();
      res.json({ message: 'Kategori berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// get all kategori
const getAllKategori = async (req, res) => {
  const kategori = await Kategori.find({});
  res.json(kategori);
};

export { createKategori, getAllKategori, getKategoriById, updateKategori, deleteKategori };
