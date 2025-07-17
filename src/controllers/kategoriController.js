import Kategori from "../models/Kategori.js";
import { check, validationResult } from "express-validator";

// Validation rules for Kategori
const validateKategori = [
  check("nama_kategori", "Nama Kategori wajib diisi").notEmpty(),
  check("deskripsi", "Deskripsi opsional").optional(),
  check("parent", "Parent harus ObjectId atau kosong")
    .optional()
    .isMongoId()
    .withMessage("ID parent tidak valid"),
];

// Create Kategori
const createKategori = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const kategori = await Kategori.create({
      nama_kategori: req.body.nama_kategori,
      deskripsi: req.body.deskripsi,
      parent: req.body.parent || null,
    });
    res.status(201).json(kategori);
  } catch (error) {
    res.status(400).json({ message: "Gagal membuat kategori", error: error.message });
  }
};

// Get all Kategori (pagination)
const getAllKategori = async (req, res) => {
  const pageSize = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * pageSize;
  try {
    const count = await Kategori.countDocuments({});
    const kategori = await Kategori.find({})
      .limit(pageSize)
      .skip(skip)
      .populate("parent", "nama_kategori");
    res.json({ kategori, page, pages: Math.ceil(count / pageSize), total: count });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// Get Kategori by ID
const getKategoriById = async (req, res) => {
  try {
    const kategori = await Kategori.findById(req.params.id).populate("parent", "nama_kategori");
    if (kategori) res.json(kategori);
    else res.status(404).json({ message: "Kategori tidak ditemukan" });
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ message: "ID Kategori tidak valid" });
    res.status(500).json({ message: "Server Error" });
  }
};

// Update Kategori
const updateKategori = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const kategori = await Kategori.findById(req.params.id);
    if (kategori) {
      kategori.nama_kategori = req.body.nama_kategori ?? kategori.nama_kategori;
      kategori.deskripsi = req.body.deskripsi ?? kategori.deskripsi;
      kategori.parent = req.body.parent ?? kategori.parent;
      const updatedKategori = await kategori.save();
      res.json(updatedKategori);
    } else {
      res.status(404).json({ message: "Kategori tidak ditemukan" });
    }
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ message: "ID Kategori tidak valid" });
    res.status(400).json({ message: "Update gagal", error: error.message });
  }
};

// Delete Kategori
const deleteKategori = async (req, res) => {
  try {
    const kategori = await Kategori.findById(req.params.id);
    if (kategori) {
      await kategori.deleteOne();
      res.json({ message: "Kategori berhasil dihapus" });
    } else {
      res.status(404).json({ message: "Kategori tidak ditemukan" });
    }
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ message: "ID Kategori tidak valid" });
    res.status(500).json({ message: "Server Error" });
  }
};

export { createKategori, getAllKategori, getKategoriById, updateKategori, deleteKategori, validateKategori };
