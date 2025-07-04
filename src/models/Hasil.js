// backend/src/models/Hasil.js

import mongoose from "mongoose";

const hasilSchema = new mongoose.Schema(
  {
    siswa: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Merujuk ke siswa yang melakukan konsultasi
    },
    jawaban: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Gejala", // Menyimpan semua gejala yang dijawab "YA" oleh siswa
      },
    ],
    hasilSolusi: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Solusi", // Merujuk ke solusi yang direkomendasikan
    },
  },
  {
    timestamps: true,
  }
);

// Menerapkan pola Singleton
const Hasil = mongoose.models.Hasil || mongoose.model("Hasil", hasilSchema);

export default Hasil;
