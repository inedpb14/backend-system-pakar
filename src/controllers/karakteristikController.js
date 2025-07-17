// backend/src/controllers/karakteristikController.js

import Karakteristik from "../models/Karakteristik.js";
import Aturan from "../models/Aturan.js";
import { check, validationResult } from "express-validator";

// Wrapper untuk menangani error pada fungsi async
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Aturan validasi untuk data Karakteristik
export const validateKarakteristik = [
  check("kodeKarakteristik", "Kode Karakteristik wajib diisi")
    .notEmpty()
    .trim(),
  check("teksPertanyaan", "Teks Pertanyaan wajib diisi").notEmpty().trim(),
  check("id_kategori", "ID Kategori wajib diisi").notEmpty().isMongoId(),
];

// @desc    Membuat Karakteristik baru
export const createKarakteristik = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { kodeKarakteristik, teksPertanyaan, id_kategori } = req.body;
  const exists = await Karakteristik.findOne({ kodeKarakteristik });
  if (exists) {
    res.status(400);
    throw new Error(
      `Karakteristik dengan kode '${kodeKarakteristik}' sudah ada.`
    );
  }

  const karakteristik = await Karakteristik.create({
    kodeKarakteristik,
    teksPertanyaan,
    id_kategori,
  });
  res.status(201).json(karakteristik);
});

// @desc    Mendapatkan semua Karakteristik (dengan paginasi & filter)
export const getAllKarakteristik = asyncHandler(async (req, res) => {
  const pageSize = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const filter = { status: "aktif" };
  if (req.query.kategori) {
    filter.id_kategori = req.query.kategori;
  }

  const [karakteristik, count] = await Promise.all([
    Karakteristik.find(filter)
      .limit(pageSize)
      .skip((page - 1) * pageSize)
      .populate("id_kategori", "nama_kategori")
      .sort({ createdAt: -1 }),
    Karakteristik.countDocuments(filter),
  ]);
  res.json({
    karakteristik,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Mendapatkan Karakteristik berdasarkan ID
export const getKarakteristikById = asyncHandler(async (req, res) => {
  const karakteristik = await Karakteristik.findById(req.params.id).populate(
    "id_kategori",
    "nama_kategori"
  );

  if (karakteristik && karakteristik.status === "aktif") {
    res.json(karakteristik);
  } else {
    res.status(404);
    throw new Error("Karakteristik tidak ditemukan atau sudah dihapus.");
  }
});

// @desc    Update Karakteristik
export const updateKarakteristik = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const karakteristik = await Karakteristik.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (karakteristik) {
    res.json(karakteristik);
  } else {
    res.status(404);
    throw new Error("Karakteristik tidak ditemukan.");
  }
});

// @desc    Delete Karakteristik (Soft Delete)
export const deleteKarakteristik = asyncHandler(async (req, res) => {
  const karakteristikId = req.params.id;

  // Validasi: Cek apakah karakteristik digunakan oleh aturan
  const aturanTerkait = await Aturan.findOne({ if: karakteristikId });
  if (aturanTerkait) {
    res.status(400);
    throw new Error(
      `Karakteristik tidak dapat dihapus karena digunakan oleh Aturan '${aturanTerkait.kodeAturan}'.`
    );
  }

  // Lakukan soft delete dengan mengubah status
  const karakteristik = await Karakteristik.findByIdAndUpdate(
    karakteristikId,
    { status: "dihapus" },
    { new: true }
  );

  if (karakteristik) {
    res.json({ message: "Karakteristik berhasil dihapus (soft delete)." });
  } else {
    res.status(404);
    throw new Error("Karakteristik tidak ditemukan.");
  }
});
