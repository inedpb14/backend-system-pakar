// backend/src/controllers/konsultasiController.js

import Aturan from "../models/Aturan.js";
import Hasil from "../models/Hasil.js";
import Subjek from "../models/Subjek.js";
import { check, validationResult } from "express-validator";

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Aturan validasi untuk input proses konsultasi
export const validateKonsultasi = [
  check("id_subjek", "ID Subjek wajib diisi").notEmpty().isMongoId(),
  check(
    "karakteristik_terpilih",
    "Minimal satu karakteristik harus dipilih"
  ).isArray({ min: 1 }),
  check("karakteristik_terpilih.*", "ID Karakteristik tidak valid").isMongoId(),
];

// @desc    Memproses konsultasi dan menyimpan hasilnya
// @route   POST /api/konsultasi/proses
// @access  Private
export const prosesKonsultasi = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id_subjek, karakteristik_terpilih } = req.body;

  const subjek = await Subjek.findById(id_subjek);
  if (!subjek) {
    res.status(404);
    throw new Error("Subjek tidak ditemukan.");
  }

  const aturanRelevan = await Aturan.find({
    id_kategori: subjek.id_kategori,
  }).populate("then");

  const aturanAktif = [];

  for (const aturan of aturanRelevan) {
    const gejalaDibutuhkan = aturan.if;
    const totalDibutuhkan = gejalaDibutuhkan.length;

    if (totalDibutuhkan === 0) continue;

    const jumlahCocok = gejalaDibutuhkan.filter((id) =>
      karakteristik_terpilih.includes(id.toString())
    ).length;

    if (jumlahCocok > totalDibutuhkan / 2) {
      aturanAktif.push({
        rekomendasi: aturan.then,
        spesifisitas: totalDibutuhkan,
      });
    }
  }

  if (aturanAktif.length === 0) {
    res.status(404);
    throw new Error(
      "Tidak ada rekomendasi yang cocok dengan kriteria yang diberikan."
    );
  }

  aturanAktif.sort((a, b) => b.spesifisitas - a.spesifisitas);

  const topRekomendasi = aturanAktif.slice(0, 3);
  const idsRekomendasi = topRekomendasi.map((item) => item.rekomendasi._id);

  await Hasil.create({
    id_subjek,
    karakteristik_terpilih,
    rekomendasi_dihasilkan: idsRekomendasi,
  });

  res.status(200).json(topRekomendasi.map((item) => item.rekomendasi));
});

// @desc    Mendapatkan riwayat hasil konsultasi milik subjek tertentu
// @route   GET /api/konsultasi/subjek/:id_subjek
// @access  Private
export const getHasilBySubjek = asyncHandler(async (req, res) => {
  const pageSize = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const [hasil, count] = await Promise.all([
    Hasil.find({ id_subjek: req.params.id_subjek })
      .limit(pageSize)
      .skip((page - 1) * pageSize)
      .populate("karakteristik_terpilih", "kodeKarakteristik teksPertanyaan")
      .populate("rekomendasi_dihasilkan", "kodeRekomendasi namaRekomendasi")
      .sort({ createdAt: -1 }),
    Hasil.countDocuments({ id_subjek: req.params.id_subjek }),
  ]);

  res.json({
    hasil,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Mendapatkan semua hasil konsultasi (untuk admin)
// @route   GET /api/konsultasi/admin/semua
// @access  Private/Admin
export const getAllHasilForAdmin = asyncHandler(async (req, res) => {
  const pageSize = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const [semuaHasil, count] = await Promise.all([
    Hasil.find({})
      .limit(pageSize)
      .skip((page - 1) * pageSize)
      .populate({
        path: "id_subjek",
        select: "nama_subjek",
        populate: { path: "id_user", select: "namaLengkap" },
      })
      .populate("rekomendasi_dihasilkan", "namaRekomendasi")
      .sort({ createdAt: -1 }),
    Hasil.countDocuments({}),
  ]);

  res.json({
    semuaHasil,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Mendapatkan detail satu hasil konsultasi
// @route   GET /api/konsultasi/:id
// @access  Private
export const getHasilDetail = asyncHandler(async (req, res) => {
  const hasil = await Hasil.findById(req.params.id)
    .populate({
      path: "id_subjek",
      select: "nama_subjek",
      populate: { path: "id_user", select: "namaLengkap" },
    })
    .populate("karakteristik_terpilih")
    .populate("rekomendasi_dihasilkan");

  if (hasil) {
    res.json(hasil);
  } else {
    res.status(404);
    throw new Error("Hasil konsultasi tidak ditemukan");
  }
});

// @desc    Delete hasil konsultasi
// @route   DELETE /api/konsultasi/:id
// @access  Private/Admin
export const deleteHasil = asyncHandler(async (req, res) => {
  const hasil = await Hasil.findByIdAndDelete(req.params.id);

  if (hasil) {
    res.json({ message: "Hasil konsultasi berhasil dihapus" });
  } else {
    res.status(404);
    throw new Error("Hasil konsultasi tidak ditemukan");
  }
});
