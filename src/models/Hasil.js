// backend/src/models/Hasil.js

import mongoose from "mongoose";

const hasilSchema = new mongoose.Schema(
  {
    // Merujuk ke entitas yang dianalisis
    id_subjek: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subjek", // HARUS merujuk ke 'Subjek'
      required: true,
    },
    // Karakteristik yang dipilih saat sesi konsultasi
    karakteristik_terpilih: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Karakteristik", // HARUS merujuk ke 'Karakteristik'
      },
    ],
    // Rekomendasi yang dihasilkan oleh sistem
    rekomendasi_dihasilkan: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rekomendasi", // HARUS merujuk ke 'Rekomendasi'
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Hasil = mongoose.models.Hasil || mongoose.model("Hasil", hasilSchema);

export default Hasil;
