// backend/src/models/Solusi.js

import mongoose from "mongoose";

const solusiSchema = new mongoose.Schema(
  {
    kodeSolusi: {
      type: String,
      required: [true, "Kode Solusi wajib diisi"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    namaSolusi: {
      type: String,
      required: [true, "Nama Solusi (Model Pembelajaran) wajib diisi"],
    },
    deskripsi: {
      type: String,
      required: [true, "Deskripsi Solusi wajib diisi"],
    },
  },
  {
    timestamps: true,
  }
);

// Menerapkan pola Singleton untuk mencegah OverwriteModelError
const Solusi = mongoose.models.Solusi || mongoose.model("Solusi", solusiSchema);

export default Solusi;
