// backend/src/controllers/konsultasiController.js

import Aturan from "../models/Aturan.js";
import RiwayatKonsultasi from "../models/RiwayatKonsultasi.js";

// @desc    Memproses konsultasi menggunakan metode forward chaining
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
    const semuaAturan = await Aturan.find({}).populate("solusi");

    let hasilSolusi = null;
    let aturanYangCocok = null;

    // 3. PROSES FORWARD CHAINING
    //    Kita iterasi (loop) melalui setiap aturan untuk menemukan yang cocok.
    for (const aturan of semuaAturan) {
      // 'every' akan mengembalikan 'true' HANYA JIKA semua gejala dalam aturan
      // ditemukan dalam daftar gejala yang dipilih oleh siswa.
      const isMatch = aturan.gejala.every((gejalaIdDalamAturan) =>
        gejalaDipilih.includes(gejalaIdDalamAturan.toString())
      );

      // 4. JIKA ATURAN COCOK (MATCH)
      if (isMatch) {
        // Pastikan solusi dari aturan ini ada (tidak null)
        if (aturan.solusi) {
          hasilSolusi = aturan.solusi;
          aturanYangCocok = aturan;
          // Hentikan loop karena kita sudah menemukan aturan pertama yang cocok.
          break;
        }
      }
    }

    // 5. SETELAH PROSES SELESAI
    if (hasilSolusi) {
      // Jika solusi ditemukan, simpan hasilnya ke riwayat konsultasi.
      // Ini adalah "side effect" dari proses yang berhasil.
      await RiwayatKonsultasi.create({
        siswa: siswaId,
        hasilSolusi: hasilSolusi._id,
        gejalaYangDipilih: gejalaDipilih,
      });

      // Kirim hasil solusi yang ditemukan ke frontend.
      res.status(200).json(hasilSolusi);
    } else {
      // Jika setelah memeriksa semua aturan tidak ada yang cocok, kirim pesan 'tidak ditemukan'.
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

// Fungsi untuk mengambil riwayat konsultasi milik pengguna yang login
const getRiwayatSaya = async (req, res) => {
  try {
    const riwayat = await RiwayatKonsultasi.find({ siswa: req.user._id })
      .populate("hasilSolusi", "kodeSolusi namaSolusi")
      .populate("gejalaYangDipilih", "kodeGejala namaGejala")
      .sort({ createdAt: -1 }); // Urutkan dari yang terbaru
    res.json(riwayat);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil riwayat." });
  }
};

// @desc    Get all consultation histories (for Admin)
// @route   GET /api/konsultasi/admin/semua
// @access  Private/Admin
const getAllRiwayatForAdmin = async (req, res) => {
  try {
    // PERBAIKAN: Menggabungkan dua .populate('siswa') menjadi satu.
    const semuaRiwayat = await RiwayatKonsultasi.find({})
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

    res.json(semuaRiwayat);
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
      .populate('siswa', 'username biografi')
      .populate({
        path: 'siswa',
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
    res.status(500).json({ message: 'Gagal menghapus riwayat.' });
  }
};


export {
  prosesKonsultasi,
  getRiwayatSaya,
  getAllRiwayatForAdmin,
  getRiwayatDetail,
  deleteRiwayat,
};
