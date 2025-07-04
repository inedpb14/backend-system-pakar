// backend/src/models/User.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username tidak boleh kosong"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password tidak boleh kosong"],
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "guru", "siswa"],
      default: "siswa",
    },
    kelas: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kelas",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Ini merupakan metode untuk membandingkan password
// Metode ini akan tersedia di setiap dokumen User (user.matchPassword)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware 'pre-save' untuk hash password sebelum disimpan
// Ini akan berjalan secara otomatis setiap kali dokumen User baru dibuat atau passwordnya diubah
userSchema.pre("save", async function (next) {
  // Hanya hash password jika field password dimodifikasi
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
