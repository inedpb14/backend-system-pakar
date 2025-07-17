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
    if: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Karakteristik",
        required: true,
      },
    ],
    then: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rekomendasi",
      required: true,
    },
    id_kategori: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kategori",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Menerapkan pola Singleton
const Aturan = mongoose.models.Aturan || mongoose.model("Aturan", aturanSchema);

export default Aturan;

