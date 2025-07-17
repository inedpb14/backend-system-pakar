import mongoose from "mongoose";
const subjekSchema = new mongoose.Schema({
  id_user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  id_kategori: { type: mongoose.Schema.Types.ObjectId, ref: "Kategori", required: true },
  nama_subjek: { type: String, required: true },
});
export default mongoose.models.Subjek || mongoose.model("Subjek", subjekSchema);
