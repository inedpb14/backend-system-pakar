// backend/src/models/Aturan.js

import mongoose from "mongoose";

const aturanSchema = new mongoose.Schema(
  {
    kodeAturan: {
      type: String,
      required: [true, "Kode Aturan wajib diisi"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    namaAturan: {
      type: String,
      required: [true, "Nama/Deskripsi Aturan wajib diisi"],
    },
    // Bagian "IF": Kumpulan dari beberapa gejala
    gejala: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Gejala", // Merujuk ke banyak dokumen di collection Gejala
      },
    ],
    // Bagian "THEN": Satu buah solusi
    solusi: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Solusi", // Merujuk ke satu dokumen di collection Solusi
    },
  },
  {
    timestamps: true,
  }
);

// Menerapkan pola Singleton
const Aturan = mongoose.models.Aturan || mongoose.model("Aturan", aturanSchema);

export default Aturan;
