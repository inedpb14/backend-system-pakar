// backend/src/controllers/konsultasiController.js

import Aturan from "../models/Aturan.js";
import RiwayatKonsultasi from "../models/RiwayatKonsultasi.js";

// @desc    Memproses konsultasi menggunakan metode forward chaining (Updated Logic: Best Match & Active Solutions)
// @route   POST /api/konsultasi/proses
// @access  Private (hanya untuk siswa yang login)
const prosesKonsultasi = async (req, res) => {
  try {
    // 1. DAPATKAN INPUT
    //    - gejalaDipilih: Array berisi ID gejala dari frontend.
    //    - siswaId: ID pengguna yang sedang login (didapat dari middleware 'protect').
    const { gejalaDipilih } = req.body;
    const siswaId = req.user._id;

    // Validasi input dasar
    if (
      !gejalaDipilih ||
      !Array.isArray(gejalaDipilih) ||
      gejalaDipilih.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Mohon pilih minimal satu gejala." });
    }

    // 2. MUAT SEMUA ATURAN DARI DATABASE
    //    Kita memuat semua aturan yang ada, dan juga data 'solusi' yang berelasi dengannya.
    //    Populate solusi untuk bisa mengecek statusnya.
    const semuaAturan = await Aturan.find({}).populate("solusi");

    let bestMatchSolution = null;
    let maxMatchedSymptoms = 0;
    // Optional: let bestMatchRule = null; // Keep track of the rule if needed

    // 3. PROSES FORWARD CHAINING (Updated: Find Best Match among rules with Active Solutions)
    //    Kita iterasi (loop) melalui setiap aturan untuk menemukan aturan yang paling cocok.
    for (const aturan of semuaAturan) {
      // Pastikan aturan memiliki solusi dan solusi tersebut berstatus 'active'
      if (aturan.solusi && aturan.solusi.status === 'active') {
        // Hitung berapa banyak gejala dari aturan ini yang ada dalam gejala yang dipilih siswa.
        const matchedSymptomsCount = aturan.gejala.filter((gejalaIdDalamAturan) =>
          gejalaDipilih.includes(gejalaIdDalamAturan.toString())
        ).length;

        // 4. JIKA ATURAN COCOK LEBIH BAIK DARI YANG SEBELUMNYA
        //    Kita mencari aturan dengan jumlah gejala yang cocok paling banyak.
        //    Jika ada aturan dengan jumlah gejala cocok yang sama, kita ambil yang pertama ditemukan.
        if (matchedSymptomsCount > maxMatchedSymptoms) {
          maxMatchedSymptoms = matchedSymptomsCount;
          bestMatchSolution = aturan.solusi;
          // bestMatchRule = aturan; // Store the rule
        }
      }
    }

    // 5. SETELAH PROSES SELESAI
    //    Jika ada solusi yang ditemukan (setidaknya satu gejala cocok dengan aturan yang memiliki solusi aktif).
    if (bestMatchSolution) {
      // Simpan hasilnya ke riwayat konsultasi.
      await RiwayatKonsultasi.create({
        siswa: siswaId,
        hasilSolusi: bestMatchSolution._id, // Save the ID of the best found solution
        gejalaYangDipilih: gejalaDipilih,
        // Optional: Could save which rule matched best, or the matchedSymptomsCount
      });

      // Kirim hasil solusi yang ditemukan ke frontend.
      res.status(200).json(bestMatchSolution);
    } else {
      // Jika tidak ada aturan yang cocok sama sekali (maxMatchedSymptoms tetap 0)
      // atau semua aturan yang cocok terkait dengan solusi yang tidak aktif.
      res
        .status(404)
        .json({
          message:
            "Tidak ada solusi yang cocok dengan kombinasi gejala yang Anda pilih.",
        });
    }
  } catch (error) {
    console.error("Error pada proses konsultasi:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

// Fungsi untuk mengambil riwayat konsultasi milik pengguna yang login dengan pagination
const getRiwayatSaya = async (req, res) => {
  const pageSize = parseInt(req.query.limit) || 10; // Default 10 items per page
  const page = parseInt(req.query.page) || 1; // Default page 1

  const skip = (page - 1) * pageSize;

  try {
    const count = await RiwayatKonsultasi.countDocuments({ siswa: req.user._id }); // Count for the specific user
    const riwayat = await RiwayatKonsultasi.find({ siswa: req.user._id })
      .limit(pageSize) // Apply limit
      .skip(skip) // Apply skip
      .populate("hasilSolusi", "kodeSolusi namaSolusi")
      .populate("gejalaYangDipilih", "kodeGejala namaGejala")
      .sort({ createdAt: -1 }); // Urutkan dari yang terbaru
    
    res.json({
      riwayat,
      page,
      pages: Math.ceil(count / pageSize),
      total: count // Include total count
    });
  } catch (error) {
    console.error("Error fetching user riwayat:", error); // Log error
    res.status(500).json({ message: "Gagal mengambil riwayat." });
  }
};

// @desc    Get all consultation histories (for Admin) with pagination
// @route   GET /api/konsultasi/admin/semua
// @access  Private/Admin
const getAllRiwayatForAdmin = async (req, res) => {
  const pageSize = parseInt(req.query.limit) || 10; // Default 10 items per page
  const page = parseInt(req.query.page) || 1; // Default page 1

  const skip = (page - 1) * pageSize;

  try {
    const count = await RiwayatKonsultasi.countDocuments({}); // Get total count
    // PERBAIKAN: Menggabungkan dua .populate('siswa') menjadi satu.
    const semuaRiwayat = await RiwayatKonsultasi.find({})
      .limit(pageSize) // Apply limit
      .skip(skip) // Apply skip
      .populate({
        path: "siswa",
        select: "username kelas", // Pilih field yang dibutuhkan di level siswa
        populate: {
          path: "kelas", // Lakukan nested populate pada field 'kelas'
          model: "Kelas",
          select: "namaKelas", // Ambil hanya namaKelas
        },
      })
      .populate("hasilSolusi", "namaSolusi") // Populate solusi tetap sama
      .sort({ createdAt: -1 });

    res.json({
      semuaRiwayat,
      page,
      pages: Math.ceil(count / pageSize),
      total: count // Include total count
    });
  } catch (error) {
    // Menambahkan log error yang lebih detail di server untuk debugging
    console.error("Error di getAllRiwayatForAdmin:", error);
    res
      .status(500)
      .json({ message: "Gagal mengambil semua riwayat dari server." });
  }
};

// @desc    Get a single consultation history detail (for Admin)
// @route   GET /api/konsultasi/:id
// @access  Private/Admin
const getRiwayatDetail = async (req, res) => {
  try {
    const riwayat = await RiwayatKonsultasi.findById(req.params.id)
      // PERBAIKAN: Gabungkan populate siswa dan hapus field biografi yang tidak ada
      .populate({
        path: 'siswa',
        select: 'username kelas', // Pilih field yang dibutuhkan, hapus biografi
        populate: {
            path: 'kelas',
            model: 'Kelas',
            select: 'namaKelas'
        }
      })
      .populate('hasilSolusi')
      .populate('gejalaYangDipilih');
      
    if (riwayat) {
      res.json(riwayat);
    } else {
      res.status(404).json({ message: 'Riwayat tidak ditemukan' });
    }
  } catch (error) {
    // Handle CastError for invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID Riwayat tidak valid' });
    }
    console.error("Error fetching riwayat detail:", error); // Log other errors
    res.status(500).json({ message: 'Gagal mengambil detail riwayat.' });
  }
};

// @desc    Delete a consultation history (for Admin)
// @route   DELETE /api/konsultasi/:id
// @access  Private/Admin
const deleteRiwayat = async (req, res) => {
  try {
    const riwayat = await RiwayatKonsultasi.findById(req.params.id);
    if (riwayat) {
      await riwayat.deleteOne();
      res.json({ message: 'Catatan riwayat berhasil dihapus' });
    } else {
      res.status(404).json({ message: 'Riwayat tidak ditemukan' });
    }
  } catch (error) {
    // Handle CastError for invalid ID format
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'ID Riwayat tidak valid' });
    }
    console.error("Error deleting riwayat:", error); // Log other errors
    res.status(500).json({ message: 'Gagal menghapus riwayat.' });
  }
};


// No changes needed for this file regarding permanent deletion integrity.

export {
  prosesKonsultasi,
  getRiwayatSaya,
  getAllRiwayatForAdmin,
  getRiwayatDetail,
  deleteRiwayat,
};
