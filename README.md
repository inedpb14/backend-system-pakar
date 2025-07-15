# Dokumentasi API Backend Sistem Pakar

Dokumen ini menjelaskan endpoint API yang tersedia di backend sistem pakar.

**Base URL:** `/api`

## Autentikasi & Otorisasi

*   Beberapa rute memerlukan autentikasi menggunakan token JWT. Token ini didapatkan saat login (`POST /api/users/login`).
*   Middleware `protect` digunakan untuk rute yang hanya bisa diakses oleh pengguna yang sudah login (siswa atau admin).
*   Middleware `admin` digunakan untuk rute yang hanya bisa diakses oleh pengguna dengan role 'admin'.

## Pagination

Rute `GET` yang mengembalikan daftar data (misalnya `/api/gejala`, `/api/users/siswa`, `/api/konsultasi/admin/semua`) mendukung pagination melalui query parameter:

*   `page`: Nomor halaman yang diminta (default: 1)
*   `limit`: Jumlah item per halaman (default: 10)

Respons untuk rute dengan pagination akan menyertakan metadata:
```json
{
  "data": [...], // Array data
  "page": 1,     // Halaman saat ini
  "pages": 5,    // Total halaman
  "total": 50    // Total item
}
```

## Penanganan Error ID Tidak Valid (CastError)

Semua rute yang mengambil, memperbarui, atau menghapus data berdasarkan ID (`/:id`) telah dilengkapi penanganan `CastError`. Jika ID yang diberikan tidak dalam format MongoDB ObjectId yang valid, API akan mengembalikan status `400 Bad Request` dengan pesan error yang jelas. Jika ID valid tetapi dokumen tidak ditemukan, API akan mengembalikan status `404 Not Found`.

## Endpoint

### Users

*   **POST /api/users/login**
    *   **Description:** Login pengguna dan mendapatkan token JWT.
    *   **Access:** Public
    *   **Request Body:**
        ```json
        {
          "username": "string", // Wajib diisi
          "password": "string"  // Wajib diisi
        }
        ```
    *   **Response:** `200 OK` (User object with token) atau `401 Unauthorized` (Invalid credentials)
    *   **Notes:** Dilengkapi rate limiting untuk mencegah brute force.

*   **POST /api/users/register**
    *   **Description:** Mendaftarkan pengguna baru.
    *   **Access:** Public (sesuai implementasi saat ini di userRoutes.js, bisa diubah menjadi Private/Admin di file routing)
    *   **Request Body:**
        ```json
        {
          "username": "string", // Wajib diisi, min 4 karakter
          "password": "string", // Wajib diisi, min 6 karakter
          "role": "string",     // Wajib diisi, 'admin' atau 'siswa'
          "kelas": "string"     // ID Kelas (optional, wajib jika role 'siswa', harus valid MongoId)
        }
        ```
    *   **Response:** `201 Created` (Created User object with token) atau `400 Bad Request` (Validation errors or username exists)

*   **GET /api/users/siswa**
    *   **Description:** Mendapatkan daftar semua pengguna dengan role 'siswa'.
    *   **Access:** Private/Admin
    *   **Query Parameters:** `page`, `limit` (untuk pagination)
    *   **Response:** `200 OK` (Paginated list of Siswa objects, excluding password)

*   **GET /api/users/:id**
    *   **Description:** Mendapatkan detail pengguna berdasarkan ID.
    *   **Access:** Private/Admin
    *   **Response:** `200 OK` (User object, excluding password) atau `404 Not Found` atau `400 Bad Request` (Invalid ID)

*   **PUT /api/users/:id**
    *   **Description:** Memperbarui data pengguna berdasarkan ID.
    *   **Access:** Private/Admin
    *   **Request Body:**
        ```json
        {
          "username": "string", // Optional, tidak boleh kosong jika ada
          "role": "string",     // Optional, 'admin' atau 'siswa'
          "kelasId": "string",  // Optional, ID Kelas (harus valid MongoId)
          "password": "string"  // Optional, min 6 karakter jika ada
        }
        ```
    *   **Response:** `200 OK` (Updated User object) atau `404 Not Found` atau `400 Bad Request` (Validation errors or Invalid ID)

*   **DELETE /api/users/:id**
    *   **Description:** Menghapus pengguna secara permanen dan menghapus semua riwayat konsultasi terkait.
    *   **Access:** Private/Admin
    *   **Response:** `200 OK` (Success message) atau `404 Not Found` atau `400 Bad Request` (Invalid ID)
    *   **Notes:** Implementasi integritas referensial: menghapus riwayat konsultasi terkait.

### Konsultasi

*   **POST /api/konsultasi/proses**
    *   **Description:** Memproses konsultasi berdasarkan gejala yang dipilih menggunakan forward chaining (best match).
    *   **Access:** Private/Siswa
    *   **Request Body:**
        ```json
        {
          "gejalaDipilih": ["string"] // Array of Gejala IDs (wajib diisi, minimal 1)
        }
        ```
    *   **Response:** `200 OK` (Best matching Solusi object) atau `404 Not Found` (No matching solution found) atau `400 Bad Request` (Invalid input)
    *   **Notes:** Logika mencari aturan dengan gejala cocok terbanyak di antara aturan yang terkait dengan solusi berstatus 'active'. Hasil disimpan ke riwayat.

*   **GET /api/konsultasi/saya**
    *   **Description:** Mendapatkan riwayat konsultasi milik pengguna yang sedang login.
    *   **Access:** Private/Siswa
    *   **Query Parameters:** `page`, `limit` (untuk pagination)
    *   **Response:** `200 OK` (Paginated list of RiwayatKonsultasi objects)

*   **GET /api/konsultasi/admin/semua**
    *   **Description:** Mendapatkan semua riwayat konsultasi (untuk admin).
    *   **Access:** Private/Admin
    *   **Query Parameters:** `page`, `limit` (untuk pagination)
    *   **Response:** `200 OK` (Paginated list of all RiwayatKonsultasi objects)

*   **GET /api/konsultasi/:id**
    *   **Description:** Mendapatkan detail riwayat konsultasi berdasarkan ID (untuk admin).
    *   **Access:** Private/Admin
    *   **Response:** `200 OK` (RiwayatKonsultasi object with populated details) atau `404 Not Found` atau `400 Bad Request` (Invalid ID)

*   **DELETE /api/konsultasi/:id**
    *   **Description:** Menghapus riwayat konsultasi berdasarkan ID (untuk admin).
    *   **Access:** Private/Admin
    *   **Response:** `200 OK` (Success message) atau `404 Not Found` atau `400 Bad Request` (Invalid ID)

### Aturan

*   **POST /api/aturan**
    *   **Description:** Membuat aturan baru.
    *   **Access:** Private/Admin
    *   **Request Body:**
        ```json
        {
          "kodeAturan": "string", // Wajib diisi
          "namaAturan": "string", // Wajib diisi
          "gejala": ["string"],   // Array of Gejala IDs (wajib diisi, minimal 1)
          "solusi": "string"      // Solusi ID (wajib diisi, harus valid MongoId)
        }
        ```
    *   **Response:** `201 Created` (Created Aturan object) atau `400 Bad Request` (Validation errors)

*   **GET /api/aturan**
    *   **Description:** Mendapatkan daftar semua aturan.
    *   **Access:** Public
    *   **Query Parameters:** `page`, `limit` (untuk pagination)
    *   **Response:** `200 OK` (Paginated list of Aturan objects with populated gejala and solusi)

*   **GET /api/aturan/:id**
    *   **Description:** Mendapatkan detail aturan berdasarkan ID.
    *   **Access:** Public
    *   **Response:** `200 OK` (Aturan object with populated gejala and solusi) atau `404 Not Found` atau `400 Bad Request` (Invalid ID)

*   **PUT /api/aturan/:id**
    *   **Description:** Memperbarui data aturan berdasarkan ID.
    *   **Access:** Private/Admin
    *   **Request Body:** (Sama seperti POST, semua field optional untuk update kecuali jika ingin mengubahnya)
        ```json
        {
          "kodeAturan": "string",
          "namaAturan": "string",
          "gejala": ["string"],
          "solusi": "string"
        }
        ```
    *   **Response:** `200 OK` (Updated Aturan object) atau `404 Not Found` atau `400 Bad Request` (Validation errors or Invalid ID)

*   **DELETE /api/aturan/:id**
    *   **Description:** Menghapus aturan secara permanen.
    *   **Access:** Private/Admin
    *   **Response:** `200 OK` (Success message) atau `404 Not Found` atau `400 Bad Request` (Invalid ID)

*   **GET /api/aturan/bygejala/:gejalaId**
    *   **Description:** Mendapatkan daftar aturan yang mengandung ID gejala spesifik di bagian IF-nya.
    *   **Access:** Private/Admin (sesuai implementasi di aturanRoutes.js)
    *   **Response:** `200 OK` (Array of Aturan objects with populated details) atau `400 Bad Request` (Invalid Gejala ID)

### Gejala

*   **POST /api/gejala**
    *   **Description:** Membuat gejala baru.
    *   **Access:** Private/Admin
    *   **Request Body:**
        ```json
        {
          "kodeGejala": "string", // Wajib diisi
          "namaGejala": "string", // Wajib diisi
          "kategoriId": "string"  // ID Kategori (wajib diisi, harus valid MongoId)
        }
        ```
    *   **Response:** `201 Created` (Created Gejala object) atau `400 Bad Request` (Validation errors or Kode Gejala exists)
    *   **Notes:** Status default 'active'.

*   **GET /api/gejala**
    *   **Description:** Mendapatkan daftar semua gejala dengan filter status.
    *   **Access:** Public
    *   **Query Parameters:**
        *   `page`, `limit` (untuk pagination)
        *   `status`: Filter berdasarkan status ('active', 'deleted', 'all'). Default 'active'.
    *   **Response:** `200 OK` (Paginated list of Gejala objects with populated kategori)

*   **GET /api/gejala/:id**
    *   **Description:** Mendapatkan detail gejala berdasarkan ID.
    *   **Access:** Public
    *   **Response:** `200 OK` (Gejala object with populated kategori) atau `404 Not Found` atau `400 Bad Request` (Invalid ID)

*   **PUT /api/gejala/:id**
    *   **Description:** Memperbarui data gejala berdasarkan ID.
    *   **Access:** Private/Admin
    *   **Request Body:** (Sama seperti POST, semua field optional untuk update kecuali jika ingin mengubahnya)
        ```json
        {
          "kodeGejala": "string",
          "namaGejala": "string",
          "kategoriId": "string", // Harus valid MongoId jika ada
          "status": "string"      // 'active' atau 'deleted'
        }
        ```
    *   **Response:** `200 OK` (Updated Gejala object) atau `404 Not Found` atau `400 Bad Request` (Validation errors or Invalid ID)

*   **DELETE /api/gejala/:id**
    *   **Description:** Melakukan soft delete pada gejala (mengubah status menjadi 'deleted').
    *   **Access:** Private/Admin
    *   **Response:** `200 OK` (Success message) atau `404 Not Found` atau `400 Bad Request` (Invalid ID)
    *   **Notes:** Data tidak dihapus permanen.

### Solusi

*   **POST /api/solusi**
    *   **Description:** Membuat solusi baru.
    *   **Access:** Private/Admin
    *   **Request Body:**
        ```json
        {
          "kodeSolusi": "string", // Wajib diisi
          "namaSolusi": "string", // Wajib diisi
          "deskripsi": "string"   // Wajib diisi
        }
        ```
    *   **Response:** `201 Created` (Created Solusi object) atau `400 Bad Request` (Validation errors)
    *   **Notes:** Status default 'active'.

*   **GET /api/solusi**
    *   **Description:** Mendapatkan daftar semua solusi dengan filter status.
    *   **Access:** Public
    *   **Query Parameters:**
        *   `page`, `limit` (untuk pagination)
        *   `status`: Filter berdasarkan status ('active', 'deleted', 'all'). Default 'active'.
    *   **Response:** `200 OK` (Paginated list of Solusi objects)

*   **GET /api/solusi/:id**
    *   **Description:** Mendapatkan detail solusi berdasarkan ID.
    *   **Access:** Public
    *   **Response:** `200 OK` (Solusi object) atau `404 Not Found` atau `400 Bad Request` (Invalid ID)

*   **PUT /api/solusi/:id**
    *   **Description:** Memperbarui data solusi berdasarkan ID.
    *   **Access:** Private/Admin
    *   **Request Body:** (Sama seperti POST, semua field optional untuk update kecuali jika ingin mengubahnya)
        ```json
        {
          "kodeSolusi": "string",
          "namaSolusi": "string",
          "deskripsi": "string",
          "status": "string"      // 'active' atau 'deleted'
        }
        ```
    *   **Response:** `200 OK` (Updated Solusi object) atau `404 Not Found` atau `400 Bad Request` (Validation errors or Invalid ID)

*   **DELETE /api/solusi/:id**
    *   **Description:** Melakukan soft delete pada solusi (mengubah status menjadi 'deleted').
    *   **Access:** Private/Admin
    *   **Response:** `200 OK` (Success message) atau `404 Not Found` atau `400 Bad Request` (Invalid ID)
    *   **Notes:** Data tidak dihapus permanen.

### Kategori

*   **POST /api/kategori**
    *   **Description:** Membuat kategori baru.
    *   **Access:** Private/Admin
    *   **Request Body:**
        ```json
        {
          "namaKategori": "string", // Wajib diisi
          "deskripsi": "string"   // Wajib diisi
        }
        ```
    *   **Response:** `201 Created` (Created Kategori object) atau `400 Bad Request` (Validation errors)

*   **GET /api/kategori**
    *   **Description:** Mendapatkan daftar semua kategori.
    *   **Access:** Public
    *   **Query Parameters:** `page`, `limit` (untuk pagination)
    *   **Response:** `200 OK` (Paginated list of Kategori objects)

*   **GET /api/kategori/:id**
    *   **Description:** Mendapatkan detail kategori berdasarkan ID.
    *   **Access:** Public
    *   **Response:** `200 OK` (Kategori object) atau `404 Not Found` atau `400 Bad Request` (Invalid ID)

*   **PUT /api/kategori/:id**
    *   **Description:** Memperbarui data kategori berdasarkan ID.
    *   **Access:** Private/Admin
    *   **Request Body:** (Sama seperti POST, semua field optional untuk update kecuali jika ingin mengubahnya)
        ```json
        {
          "namaKategori": "string",
          "deskripsi": "string"
        }
        ```
    *   **Response:** `200 OK` (Updated Kategori object) atau `404 Not Found` atau `400 Bad Request` (Validation errors or Invalid ID)

*   **DELETE /api/kategori/:id**
    *   **Description:** Menghapus kategori secara permanen.
    *   **Access:** Private/Admin
    *   **Response:** `200 OK` (Success message) atau `404 Not Found` atau `400 Bad Request` (Invalid ID or Category is in use)
    *   **Notes:** Implementasi integritas referensial: tidak dapat dihapus jika masih digunakan oleh gejala.

### Kelas (Diasumsikan ada)

*   **POST /api/kelas**
    *   **Description:** Membuat kelas baru.
    *   **Access:** Private/Admin
    *   **Request Body:**
        ```json
        {
          "namaKelas": "string" // Wajib diisi
        }
        ```
    *   **Response:** `201 Created` (Created Kelas object) atau `400 Bad Request` (Validation errors)

*   **GET /api/kelas**
    *   **Description:** Mendapatkan daftar semua kelas.
    *   **Access:** Public
    *   **Query Parameters:** `page`, `limit` (untuk pagination)
    *   **Response:** `200 OK` (Paginated list of Kelas objects)

*   **GET /api/kelas/:id**
    *   **Description:** Mendapatkan detail kelas berdasarkan ID.
    *   **Access:** Public
    *   **Response:** `200 OK` (Kelas object) atau `404 Not Found` atau `400 Bad Request` (Invalid ID)

*   **PUT /api/kelas/:id**
    *   **Description:** Memperbarui data kelas berdasarkan ID.
    *   **Access:** Private/Admin
    *   **Request Body:**
        ```json
        {
          "namaKelas": "string" // Optional, tidak boleh kosong jika ada
        }
        ```
    *   **Response:** `200 OK` (Updated Kelas object) atau `404 Not Found` atau `400 Bad Request` (Validation errors or Invalid ID)

*   **DELETE /api/kelas/:id**
    *   **Description:** Menghapus kelas secara permanen.
    *   **Access:** Private/Admin
    *   **Response:** `200 OK` (Success message) atau `404 Not Found` atau `400 Bad Request` (Invalid ID or Class is in use)
    *   **Notes:** Implementasi integritas referensial: tidak dapat dihapus jika masih memiliki pengguna.

---

Dokumentasi ini mencakup endpoint yang telah direvisi. Pastikan untuk merujuk pada kode sumber untuk detail implementasi yang lebih spesifik, terutama terkait validasi dan respons error.
