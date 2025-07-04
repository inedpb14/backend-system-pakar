// backend/src/index.js

import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import kategoriRoutes from "./routes/kategoriRoutes.js";
import gejalaRoutes from "./routes/gejalaRoutes.js"; 
import solusiRoutes from "./routes/solusiRoutes.js"; 
import aturanRoutes from "./routes/aturanRoutes.js"; 
import konsultasiRoutes from "./routes/konsultasiRoutes.js";
import kelasRoutes from "./routes/kelasRoutes.js"; 


const PORT = process.env.PORT || 5001; // Menambahkan port default untuk keamanan
const app = express();

// Panggil fungsi koneksi database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send(
    "<h1>Server Back-end Sistem Pakar (ESM)</h1><p>Status: Berjalan</p>"
  );
});

app.use("/api/users", userRoutes);
app.use("/api/kategori", kategoriRoutes); 
app.use("/api/gejala", gejalaRoutes);
app.use("/api/solusi", solusiRoutes);
app.use("/api/aturan", aturanRoutes);
app.use("/api/konsultasi", konsultasiRoutes);
app.use("/api/kelas", kelasRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

// 3. Perbaikan: Kurung kurawal penutup tambahan telah dihapus dari sini
