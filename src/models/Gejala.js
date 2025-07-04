// backend/src/models/Gejala.js

import mongoose from "mongoose";

const gejalaSchema = new mongoose.Schema(
  {
    kodeGejala: {
      type: String,
      required: [true, "Kode Gejala wajib diisi"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    namaGejala: {
      type: String,
      required: [true, "Nama Gejala (pertanyaan) wajib diisi"],
    },
    // INI BAGIAN YANG BARU: Relasi ke Kategori
    kategori: {
      type: mongoose.Schema.Types.ObjectId, // Menyimpan ID dari dokumen Kategori
      required: true,
      ref: "Kategori", // Referensi ke model 'Kategori'
    },
  },
  {
    timestamps: true,
  }
);

const Gejala = mongoose.models.Gejala || mongoose.model("Gejala", gejalaSchema);

export default Gejala;
