// backend/src/models/RiwayatKonsultasi.js

import mongoose from "mongoose";

const riwayatSchema = new mongoose.Schema(
  {
    // Siapa yang melakukan konsultasi
    siswa: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Terhubung ke collection 'User'
    },
    // Apa hasil rekomendasinya
    hasilSolusi: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Solusi", // Terhubung ke collection 'Solusi'
    },
    // Gejala apa saja yang dipilih saat itu
    gejalaYangDipilih: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gejala", // Array yang berisi referensi ke collection 'Gejala'
      },
    ],
  },
  {
    // Kapan konsultasi ini dibuat
    timestamps: true,
  }
);

const RiwayatKonsultasi = mongoose.model("RiwayatKonsultasi", riwayatSchema);

export default RiwayatKonsultasi;
