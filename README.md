# 🎬 LP3I Cinema — Aplikasi Pemesanan Tiket Bioskop

[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61dafb?logo=react&logoColor=black&style=flat-square)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo&logoColor=white&style=flat-square)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178c6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

Aplikasi mobile berbasis **React Native** dan **Expo (SDK 54)** yang dirancang khusus untuk mempermudah simulasi pemesanan tiket bioskop secara cepat, intuitif, dan responsif. Dilengkapi dengan antarmuka bertema gelap (*Dark Mode*) yang futuristik, transisi yang mulus, dan kalkulasi pembayaran instan.

---

## ✨ Fitur Unggulan

Aplikasi **LP3I Cinema** dibekali berbagai fitur modern dan alur transaksi yang realistis:

### 1. 🌌 Animated Splash Screen
* Animasi transisi masuk (*fade-in*) yang sangat halus.
* Indikator pemuatan (*progress bar*) dinamis.
* Identitas brand "LP3I Cinema" yang kuat sejak aplikasi dibuka.

### 2. 🔐 Secured Login Portal
* Pintu masuk aman dengan validasi username dan password.
* Deteksi kolom kosong menggunakan pesan peringatan interaktif (*alert*).
* Desain minimalis yang ramah pengguna.

### 3. 🎟️ Dynamic Movie Dashboard
* **Coming Soon Slider:** Slider film yang akan segera tayang dengan fitur *auto-scroll* otomatis dan efek visual yang hidup.
* **Now Playing Gallery:** Daftar film yang sedang tayang beserta genre, jam tayang, harga tiket, dan badge status *live*.
* Sistem navigasi langsung dari poster film untuk mulai memesan.

### 4. 🧮 Interactive Booking System (Pesan Tiket)
* Pengisian jumlah tiket yang diinginkan secara mudah.
* **Real-time Cost Calculator:** Menghitung total biaya otomatis berdasarkan harga tiket dikalikan jumlah pesanan.
* **Smart Change Calculator:** Memvalidasi uang bayar dan menampilkan jumlah kembalian secara langsung saat uang dimasukkan.
* Validasi pembayaran cerdas agar transaksi tidak dapat diproses jika uang pembayaran kurang.

### 5. 📄 Virtual Printed Ticket (Cetak Struk)
* Struk tiket digital dengan desain klasik retro layaknya tiket fisik bioskop nyata.
* Pembuatan **Kode Tiket unik** (*Randomized Booking Code*) dengan format `LP3I-XXXXXX`.
* Detail transaksi lengkap: Judul film, tanggal transaksi aktual, studio, harga, jumlah tiket, total bayar, nominal uang bayar, dan nominal kembalian.
* Dilengkapi dengan simulasi **barcode digital** untuk verifikasi masuk studio.

---

## 🛠️ Spesifikasi Teknologi

Proyek ini dibangun menggunakan teknologi mutakhir dalam pengembangan aplikasi mobile multiplatform:

* **Framework Utama:** [React Native](https://reactnative.dev/) (v0.81.5)
* **Peralatan & SDK:** [Expo SDK 54](https://expo.dev/) (menggunakan `expo-router` untuk sistem navigasi berbasis file yang mutakhir)
* **Bahasa Pemrograman:** [TypeScript](https://www.typescriptlang.org/) (menjamin tipe data aman dan terstruktur)
* **Ikonografi:** `@expo/vector-icons` (Ionicons)
* **Efek & Transisi:** React Native Animated API & Reanimated
* **Penyajian Gambar:** `expo-image` (optimasi performa rendering gambar poster)

---

## 📂 Struktur Direktori Proyek

Struktur folder terorganisir dengan arsitektur bersih demi kemudahan pengembangan lebih lanjut:

```text
bioskop/
├── app/                  # Direktori utama Expo Router (File-based Routing)
│   ├── (tabs)/           # Halaman utama aplikasi
│   │   ├── _layout.tsx   # Konfigurasi navigasi Stack utama
│   │   ├── index.tsx     # Gerbang masuk (mengalihkan ke Splash)
│   │   ├── splash.tsx    # Layar pembuka (Splash Screen) dengan animasi
│   │   ├── login.tsx     # Layar autentikasi masuk
│   │   ├── dashboard.tsx # Layar utama daftar film (Now Playing & Coming Soon)
│   │   ├── pesan.tsx     # Formulir pemesanan tiket & kalkulator pembayaran
│   │   └── cetak.tsx     # Desain tiket fisik virtual & barcode generator
│   └── modal.tsx         # Modal dialog pendukung
├── assets/               # Aset statis aplikasi
│   └── images/           # File gambar logo dan poster film berkualitas tinggi
├── components/           # Komponen UI modular yang dapat digunakan kembali
├── constants/            # Konfigurasi warna, tema, dan data konstan
├── hooks/                # Custom React hooks pendukung
├── package.json          # File konfigurasi dependensi npm
└── tsconfig.json         # Konfigurasi compiler TypeScript
```

---

## 🚀 Cara Menjalankan Aplikasi di Komputer Anda

Ikuti langkah-langkah di bawah ini untuk memulai pengembangan atau mencoba aplikasi ini secara lokal:

### Prasyarat
Pastikan Anda sudah menginstal:
* [Node.js](https://nodejs.org/) (versi LTS direkomendasikan)
* Aplikasi **Expo Go** pada smartphone Android atau iOS Anda (opsional, untuk pengujian langsung di perangkat fisik).

### Langkah-langkah:

1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/Rizqi2024/bioskop.git
   cd bioskop
   ```

2. **Instal dependensi proyek:**
   Menggunakan npm:
   ```bash
   npm install
   ```

3. **Jalankan server Expo:**
   ```bash
   npx expo start
   ```

4. **Buka aplikasi:**
   * **Smartphone (Expo Go):** Scan QR Code yang muncul di terminal menggunakan kamera HP Anda (iOS) atau aplikasi Expo Go (Android).
   * **Emulator Android:** Tekan tombol `a` di terminal jika emulator Android Studio Anda aktif.
   * **Simulator iOS:** Tekan tombol `i` di terminal jika simulator macOS Xcode Anda aktif.
   * **Web Browser:** Tekan tombol `w` untuk menjalankannya pada web browser lokal Anda.

---

## 👤 Kontributor & Pengembang

Aplikasi hebat ini sepenuhnya dirancang dan dikembangkan oleh:

* **Rizqi**
  * GitHub: [@Rizqi2024](https://github.com/Rizqi2024)
  * Kontribusi: Pembuatan aplikasi, integrasi visual, logika kalkulator pemesanan, dan desain virtual ticket.

---

## 📄 Lisensi

Proyek ini dilindungi di bawah lisensi **MIT**. Anda bebas menyalin, memodifikasi, dan mendistribusikan proyek ini dengan menyertakan atribusi pembuat asli.

*Dibuat dengan 💙 dan dedikasi oleh Rizqi untuk memajukan portofolio aplikasi mobile.*
