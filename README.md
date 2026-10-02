Berikut adalah draf file **`README.md`** yang lengkap dan rapi untuk project kamu (React + Vite untuk frontend dan Node.js/Express REST API untuk backend).

Kamu bisa membuat file bernama `README.md` di direktori utama (root) project kamu dan menempelkan teks berikut:

---

```markdown
# UKS Management & Catalog System

Aplikasi web manajemen katalog produk dan dashboard admin untuk UKS (Utama Karya Sejati). Project ini terbagi menjadi dua komponen utama: **Frontend** (React + Vite + Tailwind CSS) dan **Backend** (Node.js REST API).

---

## 🛠️ Prasyarat (Prerequisites)

Sebelum menjalankan project ini, pastikan sistem kamu sudah terinstall:

* **Node.js** (Versi 18.x atau lebih baru disarankan)
* **npm** (biasanya terinstall bersama Node.js) atau **yarn / pnpm**
* **Git**

---

## 🚀 Langkah Instalasi & Jalankan Project

### 1. Clone Repository

Buka terminal / command prompt, lalu jalankan perintah:

```bash
git clone [https://github.com/username/repository-kamu.git](https://github.com/username/repository-kamu.git)
cd repository-kamu

```

> **Catatan:** Ganti URL di atas dengan link repository Git kamu.

---

### 2. Setup & Jalankan Backend (Server API)

1. Masuk ke direktori backend:
```bash
cd backend

```


2. Install seluruh dependencies:
```bash
npm install

```


3. Buat file `.env` di dalam folder `backend` (jika diperlukan) dan sesuaikan konfigurasinya:
```env
PORT=5000

```


4. Jalankan backend server:
```bash
# Jalankan mode development (jika menggunakan nodemon)
npm run dev

# ATAU jalankan mode standard
npm start

```


*Backend API akan berjalan di:* `http://localhost:5000`

---

### 3. Setup & Jalankan Frontend (Client Application)

1. Buka terminal baru, lalu masuk ke direktori frontend:
```bash
cd frontend

```


2. Install seluruh dependencies:
```bash
npm install

```


3. Jalankan server development Vite:
```bash
npm run dev

```


*Aplikasi frontend akan berjalan di:* `http://localhost:5173` (atau port yang ditampilkan di terminal).

---

## 📂 Struktur Direktori Project

```text
├── backend/                  # REST API Server (Node.js / Express)
│   ├── index.js              # Entry point backend
│   └── package.json
│
└── frontend/                 # Frontend React (Vite)
    ├── public/
    │   └── logo.png          # Asset statis (Logo aplikasi)
    ├── src/
    │   ├── admin/            # Halaman Dashboard & Form Admin
    │   │   ├── categories/   # Manajemen Kategori
    │   │   ├── dashboard/    # Overview Dashboard
    │   │   ├── layout/       # Admin Sidebar & Header Layout
    │   │   ├── media/        # Media Manager
    │   │   ├── products/     # Products List & ProductForm
    │   │   └── settings/     # Pengaturan Admin
    │   ├── login/            # Halaman Login
    │   ├── LandingPages.jsx  # Halaman Public / Katalog
    │   ├── App.jsx           # Routing Utama (React Router)
    │   └── main.jsx          # Entry point React
    └── package.json

```

---

## 📌 Fitur Utama

* **Public Site / Catalog**: Menampilkan daftar produk, filter kategori, dan detail produk.
* **Admin Authentication**: Sistem Login untuk pengelola/admin.
* **Product Management**:
* CRUD (Create, Read, Update, Delete) Produk.
* Upload gambar produk ke API Backend.
* Pengaturan varian ukuran (*Available Sizes*), spesifikasi, dan urutan (*Sort Order*).


* **Category Management**: Pengelompokan produk berdasarkan kategori.
* **Dark Mode Dashboard UI**: Tampilan admin modern bertema gelap.

---

## 🧪 Perintah-Perintah Penting (Scripts)

| Direktori | Perintah | Deskripsi |
| --- | --- | --- |
| `frontend` | `npm run dev` | Menjalankan server development frontend |
| `frontend` | `npm run build` | Melakukan build produksi frontend |
| `backend` | `npm run dev` | Menjalankan server backend dengan auto-reload (Nodemon) |
| `backend` | `npm start` | Menjalankan server backend mode biasa |

```

```
