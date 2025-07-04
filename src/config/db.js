// backend/src/config/db.js

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // process.env.MONGODB_URI sudah tersedia karena dotenv dijalankan di index.js
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Berhasil terhubung ke MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
