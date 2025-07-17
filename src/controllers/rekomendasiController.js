// backend/src/controllers/rekomendasiController.js

import Rekomendasi from "../models/Rekomendasi.js";
import Aturan from "../models/Aturan.js";
import { check, validationResult } from "express-validator";

// Wrapper untuk menangani error pada fungsi async
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Aturan validasi untuk data Rekomendasi
export const validateRekomendasi = [
  check("kodeRekomendasi", "Kode Rekomendasi wajib diisi").notEmpty().trim(),
  check("namaRekomendasi", "Nama Rekomendasi wajib diisi").notEmpty().trim(),
  check("id_kategori", "ID Kategori wajib diisi").notEmpty().isMongoId(),
];

// @desc    Membuat Rekomendasi baru
// @route   POST /api/rekomendasi
// @access  Private/Admin
export const createRekomendasi = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { kodeRekomendasi, namaRekomendasi, deskripsi, id_kategori } = req.body;

  // Cek duplikasi kode
  const exists = await Rekomendasi.findOne({ kodeRekomendasi });
  if (exists) {
    res.status(400);
    throw new Error(`Rekomendasi dengan kode '${kodeRekomendasi}' sudah ada.`);
  }

  const rekomendasi = await Rekomendasi.create({
    kodeRekomendasi,
    namaRekomendasi,
    deskripsi,
    id_kategori,
  });

  res.status(201).json(rekomendasi);
});

// @desc    Mendapatkan semua Rekomendasi dengan paginasi & filter
// @route   GET /api/rekomendasi
// @access  Public
export const getAllRekomendasi = asyncHandler(async (req, res) => {
  const pageSize = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  // Filter berdasarkan kategori dan status 'aktif'
  const filter = { status: "aktif" };
  if (req.query.kategori) {
    filter.id_kategori = req.query.kategori;
  }

  const [rekomendasi, count] = await Promise.all([
    Rekomendasi.find(filter)
      .limit(pageSize)
      .skip((page - 1) * pageSize)
      .populate("id_kategori", "nama_kategori")
      .sort({ createdAt: -1 }),
    Rekomendasi.countDocuments(filter),
  ]);

  res.json({
    rekomendasi,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Mendapatkan Rekomendasi berdasarkan ID
// @route   GET /api/rekomendasi/:id
// @access  Public
export const getRekomendasiById = asyncHandler(async (req, res) => {
  const rekomendasi = await Rekomendasi.findById(req.params.id).populate(
    "id_kategori",
    "nama_kategori"
  );

  if (rekomendasi && rekomendasi.status === "aktif") {
    res.json(rekomendasi);
  } else {
    res.status(404);
    throw new Error("Rekomendasi tidak ditemukan atau sudah dihapus.");
  }
});

// @desc    Update Rekomendasi
// @route   PUT /api/rekomendasi/:id
// @access  Private/Admin
export const updateRekomendasi = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const rekomendasi = await Rekomendasi.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (rekomendasi) {
    res.json(rekomendasi);
  } else {
    res.status(404);
    throw new Error("Rekomendasi tidak ditemukan.");
  }
});

// @desc    Delete Rekomendasi (Soft Delete dengan validasi)
// @route   DELETE /api/rekomendasi/:id
// @access  Private/Admin
export const deleteRekomendasi = asyncHandler(async (req, res) => {
  const rekomendasiId = req.params.id;

  // Validasi: Cek apakah rekomendasi ini digunakan sebagai kesimpulan ('then') di aturan lain.
  const aturanTerkait = await Aturan.findOne({ then: rekomendasiId });
  if (aturanTerkait) {
    res.status(400);
    throw new Error(
      `Rekomendasi tidak dapat dihapus karena digunakan oleh Aturan '${aturanTerkait.kodeAturan}'.`
    );
  }

  // Lakukan soft delete dengan mengubah status
  const rekomendasi = await Rekomendasi.findByIdAndUpdate(
    rekomendasiId,
    { status: "dihapus" },
    { new: true }
  );

  if (rekomendasi) {
    res.json({ message: "Rekomendasi berhasil dihapus (soft delete)." });
  } else {
    res.status(404);
    throw new Error("Rekomendasi tidak ditemukan.");
  }
});
