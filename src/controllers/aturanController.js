import Aturan from "../models/Aturan.js";
import { check, validationResult } from "express-validator";

// Async handler untuk mengurangi duplikasi try-catch
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Validation rules for Aturan (tidak ada perubahan)
const validateAturan = [
  check("kodeAturan", "Kode Aturan wajib diisi").notEmpty().trim(),
  check(
    "if",
    "Field 'if' wajib diisi dan berupa array ID Karakteristik"
  ).isArray({ min: 1 }),
  check(
    "if.*",
    "Setiap item dalam 'if' harus berupa ID yang valid"
  ).isMongoId(),
  check("then", "Field 'then' wajib diisi dan berupa ID Rekomendasi")
    .notEmpty()
    .isMongoId(),
  check("id_kategori", "ID Kategori wajib diisi dan valid")
    .notEmpty()
    .isMongoId(),
];

// @desc    Membuat aturan baru
// @route   POST /api/aturan
// @access  Private/Admin
const createAturan = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { kodeAturan, if: ifArr, then, id_kategori } = req.body;

  // Cek duplikasi kodeAturan sebelum membuat
  const aturanExists = await Aturan.findOne({ kodeAturan });
  if (aturanExists) {
    res.status(400);
    throw new Error(`Aturan dengan kode '${kodeAturan}' sudah ada.`);
  }

  const aturan = await Aturan.create({
    kodeAturan,
    if: ifArr,
    then,
    id_kategori,
  });
  res.status(201).json(aturan);
});

// @desc    Mendapatkan semua aturan dengan pagination
// @route   GET /api/aturan
// @access  Public
const getAllAturan = asyncHandler(async (req, res) => {
  const pageSize = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * pageSize;

  const [aturan, count] = await Promise.all([
    Aturan.find({})
      .sort({ createdAt: -1 }) // Urutkan berdasarkan yang terbaru
      .limit(pageSize)
      .skip(skip)
      .populate("if", "kodeKarakteristik teksPertanyaan")
      .populate("then", "kodeRekomendasi namaRekomendasi")
      .populate("id_kategori", "nama_kategori"),
    Aturan.countDocuments({}),
  ]);

  res.json({
    aturan,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Mendapatkan aturan by ID
// @route   GET /api/aturan/:id
// @access  Public
const getAturanById = asyncHandler(async (req, res) => {
  const aturan = await Aturan.findById(req.params.id)
    .populate("if", "kodeKarakteristik teksPertanyaan")
    .populate("then", "kodeRekomendasi namaRekomendasi")
    .populate("id_kategori", "nama_kategori");

  if (aturan) {
    res.json(aturan);
  } else {
    res.status(404);
    throw new Error("Aturan tidak ditemukan");
  }
});

// @desc    Update aturan
// @route   PUT /api/aturan/:id
// @access  Private/Admin
const updateAturan = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Menggunakan findByIdAndUpdate untuk efisiensi (1x operasi DB)
  const updatedAturan = await Aturan.findByIdAndUpdate(
    req.params.id,
    req.body, // Mongoose akan mengambil field yang sesuai dari body
    {
      new: true, // Mengembalikan dokumen yang sudah di-update
      runValidators: true,
    }
  );

  if (updatedAturan) {
    res.json(updatedAturan);
  } else {
    res.status(404);
    throw new Error("Aturan tidak ditemukan");
  }
});

// @desc    Delete aturan
// @route   DELETE /api/aturan/:id
// @access  Private/Admin
const deleteAturan = asyncHandler(async (req, res) => {
  // Menggunakan findByIdAndDelete untuk efisiensi (1x operasi DB)
  const aturan = await Aturan.findByIdAndDelete(req.params.id);

  if (aturan) {
    res.json({ message: "Aturan berhasil dihapus" });
  } else {
    res.status(404);
    throw new Error("Aturan tidak ditemukan");
  }
});

// @desc    Get rules that contain a specific Karakteristik ID
// @route   GET /api/aturan/bykarakteristik/:karakteristikId
// @access  Private/Admin
const getAturanByKarakteristikId = asyncHandler(async (req, res) => {
  const { karakteristikId } = req.params;

  const aturan = await Aturan.find({ if: karakteristikId })
    .populate("if", "kodeKarakteristik teksPertanyaan")
    .populate("then", "kodeRekomendasi namaRekomendasi")
    .populate("id_kategori", "nama_kategori");

  res.json(aturan); // Akan mengembalikan array kosong jika tidak ditemukan, ini perilaku yg benar
});

export {
  createAturan,
  getAllAturan,
  getAturanById,
  updateAturan,
  deleteAturan,
  getAturanByKarakteristikId,
  validateAturan,
};
