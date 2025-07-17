import mongoose from "mongoose";
const kategoriSchema = new mongoose.Schema(
  {
    nama_kategori: { type: String, required: true },
    deskripsi: { type: String },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Kategori", default: null },
  }
);

const Kategori = mongoose.models.Kategori || mongoose.model("Kategori", kategoriSchema);
export default Kategori;
