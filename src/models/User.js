// backend/src/models/User.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    namaLengkap: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // PENYEMPURNAAN: Otomatis mengubah email ke huruf kecil
      trim: true, // PENYEMPURNAAN: Otomatis menghapus spasi di awal/akhir
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true, // Diubah dari default menjadi required
      enum: ["admin", "guru", "pengguna"], // Tambahkan 'siswa' ke enum
    },
  },
  { timestamps: true }
);

// Metode untuk membandingkan password yang diinput dengan password di database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware 'pre-save' untuk hash password sebelum dokumen disimpan
userSchema.pre("save", async function (next) {
  // Hanya hash password jika field 'password' dimodifikasi (atau saat user baru)
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
