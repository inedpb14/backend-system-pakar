// backend/src/index.js

import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser"; // Tambahan: berguna untuk JWT di cookies
import connectDB from "./config/db.js";

// Impor Rute yang Benar
import kategoriRoutes from "./routes/kategoriRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import karakteristikRoutes from "./routes/karakteristikRoutes.js";
import rekomendasiRoutes from "./routes/rekomendasiRoutes.js"; // BARU
import aturanRoutes from "./routes/aturanRoutes.js";
import konsultasiRoutes from "./routes/konsultasiRoutes.js";
import subjekRoutes from "./routes/subjectRoutes.js"; // BARU

// Impor Middleware Error
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

// Koneksi ke database
connectDB();

const app = express();

// Middleware untuk logging (hanya aktif di mode development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Middleware untuk parsing body JSON dan cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ===============================================
// Pemasangan Rute API (Routes Mounting)
// ===============================================
app.use("/api/kategori", kategoriRoutes);
app.use("/api/karakteristik", karakteristikRoutes);
app.use("/api/rekomendasi", rekomendasiRoutes);
app.use("/api/aturan", aturanRoutes);
app.use("/api/users", userRoutes);
app.use("/api/subjek", subjekRoutes);
app.use("/api/konsultasi", konsultasiRoutes);

// Middleware untuk Error Handling (ditempatkan di akhir)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server berjalan di mode ${process.env.NODE_ENV} pada port ${PORT}`
  );
});

export default app;
