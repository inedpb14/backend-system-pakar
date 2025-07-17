import mongoose from "mongoose";
const rekomendasiSchema = new mongoose.Schema({
  kodeRekomendasi: { type: String, required: true, unique: true },
  namaRekomendasi: { type: String, required: true },
  deskripsi: { type: String },
  id_kategori: { type: mongoose.Schema.Types.ObjectId, ref: "Kategori", required: true },
  status: { type: String, enum: ["aktif", "dihapus"], default: "aktif" },
});
export default mongoose.models.Rekomendasi || mongoose.model("Rekomendasi", rekomendasiSchema);
