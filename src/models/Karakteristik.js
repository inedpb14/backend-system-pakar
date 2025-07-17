import mongoose from "mongoose";
const karakteristikSchema = new mongoose.Schema({
  kodeKarakteristik: { type: String, required: true, unique: true },
  teksPertanyaan: { type: String, required: true },
  id_kategori: { type: mongoose.Schema.Types.ObjectId, ref: "Kategori", required: true },
  status: { type: String, enum: ["aktif", "dihapus"], default: "aktif" },
});
export default mongoose.models.Karakteristik || mongoose.model("Karakteristik", karakteristikSchema);
