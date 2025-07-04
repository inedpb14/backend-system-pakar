// backend/src/models/Kelas.js
import mongoose from "mongoose";

const kelasSchema = new mongoose.Schema(
  {
    namaKelas: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    deskripsi: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Kelas = mongoose.model("Kelas", kelasSchema);

export default Kelas;
