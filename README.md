# **Dokumentasi API \- Platform Sistem Pakar v2.0**

Dokumentasi ini merinci semua *endpoint* yang tersedia pada *backend* Platform Sistem Pakar.

**Base URL**: http://localhost:5000/api

## **Autentikasi**

Sebagian besar *endpoint* memerlukan autentikasi menggunakan **JSON Web Token (JWT)**.

1. **Mendapatkan Token**: Lakukan permintaan ke POST /api/users/login dengan email dan password Anda. Jika berhasil, token akan diatur secara otomatis sebagai *cookie* httpOnly pada respons.  
2. **Menggunakan Token**: Untuk setiap permintaan ke *endpoint* yang dilindungi, *cookie* yang berisi token akan secara otomatis dikirim oleh *browser*. Jika Anda menggunakan alat seperti Postman, Anda perlu menyalin token dari *header* Set-Cookie pada respons login dan menambahkannya secara manual ke *Header* Authorization pada permintaan selanjutnya dengan format Bearer \<token\>.

**Level Akses**:

* **Publik**: Tidak memerlukan token.  
* **Terotentikasi**: Memerlukan token yang valid (semua peran).  
* **Admin**: Memerlukan token dari pengguna dengan role: 'admin'.

## **1\. Modul: User**

Mengelola data pengguna, registrasi, dan login.

### **POST /users/register**

* **Deskripsi**: Mendaftarkan pengguna baru (bisa oleh admin atau untuk umum).  
* **Akses**: Publik / Admin  
* **Body**:  
  ``` kode program
  {  
    "namaLengkap": "Budi Pengguna",  
    "email": "budi@example.com",  
    "password": "password123",  
    "role": "pengguna"  
  }
  ```
* **Respons Sukses (201 Created)**:  
  ``` kode program
  {  
    "_id": "60d5f4c5c5f4b2a9d8f3e8a1",  
    "namaLengkap": "Budi Pengguna",  
    "email": "budi@example.com",  
    "role": "pengguna"  
  }
  ```

### **POST /users/login**

* **Deskripsi**: Melakukan login untuk mendapatkan token.  
* **Akses**: Publik  
* **Body**:  
  ``` kode program
  {  
    "email": "admin@example.com",  
    "password": "passwordadmin123"  
  }
  ```
* **Respons Sukses (200 OK)**: Mengembalikan data pengguna dan mengatur *cookie* token.

## **2\. Modul: Kategori**

Mengelola kategori hirarkis (induk-anak).

### **POST /kategori**

* **Deskripsi**: Membuat kategori baru. Untuk membuat kategori anak, sertakan *field* parent dengan \_id dari kategori induk.  
* **Akses**: Admin  
* **Body**:  
  ``` kode program
  {  
    "nama_kategori": "Kelas 4",  
    "deskripsi": "Untuk siswa kelas 4 SD",  
    "parent": "60d5f4c5c5f4b2a9d8f3e8a0"  
  }
  ```
* **Respons Sukses (201 Created)**: Mengembalikan dokumen kategori yang baru dibuat.

### **GET /kategori**

* **Deskripsi**: Mendapatkan daftar semua kategori.  
* **Akses**: Publik  
* **Respons Sukses (200 OK)**:  
  ``` kode program
  {
    "kategori": [
      {
        "_id": "60d5f4c5c5f4b2a9d8f3e8a0",
        "nama_kategori": "Sekolah Dasar",
        "parent": null
      },
      {
        "_id": "60d5f4c5c5f4b2a9d8f3e8a2",
        "nama_kategori": "Kelas 4",
        "parent": { "_id": "60d5f4c5c5f4b2a9d8f3e8a0", "nama_kategori": "Sekolah Dasar" }
      }
    ]
  }
  ```

### **DELETE /kategori/:id**

* **Deskripsi**: Menghapus kategori. Akan gagal jika kategori tersebut masih digunakan oleh data lain (sebagai induk, atau oleh Subjek, Aturan, dll).  
* **Akses**: Admin

## **3\. Modul: Basis Pengetahuan**

Mengelola Karakteristik, Rekomendasi, dan Aturan.

### **POST /karakteristik**

* **Deskripsi**: Membuat karakteristik (pertanyaan) baru dalam sebuah kategori.  
* **Akses**: Admin  
* **Body**:  
  ``` kode program
  {
    "kodeKarakteristik": "K01",
    "teksPertanyaan": "Apakah subjek lebih suka belajar dengan praktik langsung?",
    "id_kategori": "60d5f4c5c5f4b2a9d8f3e8a2"
  }
  ```

### **POST /rekomendasi**

* **Deskripsi**: Membuat rekomendasi (hasil akhir) baru dalam sebuah kategori.  
* **Akses**: Admin  
* **Body**:  
  ``` kode program
  {
    "kodeRekomendasi": "REC_KINESTETIK",
    "namaRekomendasi": "Model Pembelajaran Kinestetik",
    "id_kategori": "60d5f4c5c5f4b2a9d8f3e8a2"
  }
  ```

### **POST /aturan**

* **Deskripsi**: Membuat aturan IF-THEN baru.  
* **Akses**: Admin  
* **Body**:  
  ``` kode program
  {
    "kodeAturan": "AT_KIN_01",
    "if": ["ID_KARAKTERISTIK_1", "ID_KARAKTERISTIK_2"],
    "then": "ID_REKOMENDASI_KIN",
    "id_kategori": "60d5f4c5c5f4b2a9d8f3e8a2"
  }
  ```

## **4\. Modul: Subjek**

Mengelola entitas yang akan dianalisis.

### **POST /subjek**

* **Deskripsi**: Membuat profil subjek baru dan menautkannya ke User dan Kategori.  
* **Akses**: Terotentikasi (Admin/Guru)  
* **Body**:  
  ``` kode program
  {
    "id_user": "ID_USER_BUDI",
    "id_kategori": "ID_KATEGORI_KELAS_4",
    "nama_subjek": "Budi Setiawan"
  }
  ```

## **5\. Modul: Konsultasi**

*Endpoint* inti untuk menjalankan proses inferensi.

### **POST /konsultasi/proses**

* **Deskripsi**: Memproses daftar karakteristik yang dipilih oleh pengguna, menjalankan mesin inferensi, dan mengembalikan 1-3 rekomendasi teratas.  
* **Akses**: Terotentikasi  
* **Body**:  
  ``` kode program
  {
    "id_subjek": "ID_SUBJEK_BUDI",
    "karakteristik_terpilih": ["ID_KARAKTERISTIK_1", "ID_KARAKTERISTIK_2", "ID_KARAKTERISTIK_3"]
  }
  ```
* **Respons Sukses (200 OK)**:  
  ``` kode program
  [
    {
      "_id": "ID_REKOMENDASI_A",
      "namaRekomendasi": "Model Pembelajaran Kinestetik",
      "deskripsi": "..."
    },
    {
      "_id": "ID_REKOMENDASI_B",
      "namaRekomendasi": "Pembelajaran Berbasis Proyek",
      "deskripsi": "..."
    }
  ]
  ```

### **GET /konsultasi/subjek/:id_subjek**

* **Deskripsi**: Mendapatkan riwayat semua sesi konsultasi yang pernah dilakukan oleh satu subjek.  
* **Akses**: Terotentikasi  
* **Respons Sukses (200 OK)**: Mengembalikan daftar riwayat hasil.