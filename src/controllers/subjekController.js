// backend/src/controllers/subjekController.js

import Subjek from "../models/Subjek.js";
import User from "../models/User.js";
import Kategori from "../models/Kategori.js";
import Hasil from "../models/Hasil.js"; // Diperlukan untuk proses delete
import { check, validationResult } from "express-validator";

// Wrapper untuk menangani error pada fungsi async
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Aturan validasi untuk data Subjek
export const validateSubjek = [
  check("id_user", "ID User wajib diisi dan valid").notEmpty().isMongoId(),
  check("id_kategori", "ID Kategori wajib diisi dan valid")
    .notEmpty()
    .isMongoId(),
  check("nama_subjek", "Nama Subjek wajib diisi").notEmpty().trim(),
];

// @desc    Membuat Subjek baru
// @route   POST /api/subjek
// @access  Private
export const createSubjek = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id_user, id_kategori, nama_subjek } = req.body;

  // Validasi tambahan: pastikan user dan kategori benar-benar ada
  const [userExists, kategoriExists] = await Promise.all([
    User.findById(id_user),
    Kategori.findById(id_kategori),
  ]);

  if (!userExists) {
    res.status(404);
    throw new Error("User dengan ID tersebut tidak ditemukan.");
  }
  if (!kategoriExists) {
    res.status(404);
    throw new Error("Kategori dengan ID tersebut tidak ditemukan.");
  }

  // Cek agar satu user tidak bisa menjadi subjek di kategori yang sama lebih dari sekali
  const subjekExists = await Subjek.findOne({ id_user, id_kategori });
  if (subjekExists) {
    res.status(400);
    throw new Error(
      "User ini sudah terdaftar sebagai subjek di kategori tersebut."
    );
  }

  const subjek = await Subjek.create({ id_user, id_kategori, nama_subjek });
  res.status(201).json(subjek);
});

// @desc    Mendapatkan semua Subjek (dengan paginasi)
// @route   GET /api/subjek
// @access  Private/Admin
export const getAllSubjek = asyncHandler(async (req, res) => {
  const pageSize = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const [subjek, count] = await Promise.all([
    Subjek.find({})
      .limit(pageSize)
      .skip((page - 1) * pageSize)
      .populate("id_user", "namaLengkap email") // Ambil nama dan email dari User
      .populate("id_kategori", "nama_kategori") // Ambil nama dari Kategori
      .sort({ createdAt: -1 }),
    Subjek.countDocuments({}),
  ]);

  res.json({
    subjek,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Mendapatkan Subjek berdasarkan ID
// @route   GET /api/subjek/:id
// @access  Private
export const getSubjekById = asyncHandler(async (req, res) => {
  const subjek = await Subjek.findById(req.params.id)
    .populate("id_user", "namaLengkap email")
    .populate("id_kategori", "nama_kategori");

  if (subjek) {
    res.json(subjek);
  } else {
    res.status(404);
    throw new Error("Subjek tidak ditemukan.");
  }
});

// @desc    Update Subjek
// @route   PUT /api/subjek/:id
// @access  Private
export const updateSubjek = asyncHandler(async (req, res) => {
  const subjek = await Subjek.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (subjek) {
    res.json(subjek);
  } else {
    res.status(404);
    throw new Error("Subjek tidak ditemukan.");
  }
});

// @desc    Delete Subjek
// @route   DELETE /api/subjek/:id
// @access  Private/Admin
export const deleteSubjek = asyncHandler(async (req, res) => {
  const subjekId = req.params.id;
  const subjek = await Subjek.findById(subjekId);

  if (subjek) {
    // Hapus juga semua riwayat hasil konsultasi yang terkait dengan subjek ini
    await Hasil.deleteMany({ id_subjek: subjekId });

    // Hapus subjek itu sendiri
    await subjek.deleteOne();

    res.json({
      message: "Subjek dan semua riwayat konsultasinya berhasil dihapus.",
    });
  } else {
    res.status(404);
    throw new Error("Subjek tidak ditemukan.");
  }
});
