import mongoose from "mongoose";
const kategoriSchema = new mongoose.Schema(
  {
    namaKategori: { type: String, required: true, unique: true, trim: true },
    deskripsi: { type: String },
  },
  { timestamps: true }
);

const Kategori = mongoose.models.Kategori || mongoose.model("Kategori", kategoriSchema);
export default Kategori;
