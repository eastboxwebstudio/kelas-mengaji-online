# CelikKalam - Aplikasi Kelas Mengaji

Aplikasi ini menggunakan **Supabase** sebagai backend (PostgreSQL + Auth) dan **Cloudflare Pages Functions** sebagai serverless backend untuk integrasi pembayaran ToyyibPay.

## 🚀 Persediaan Awal (Setup)

1.  **Cipta Projek Supabase:**
    *   Daftar dan cipta projek baru di [supabase.com](https://supabase.com).

2.  **Setup Pangkalan Data:**
    *   Buka fail `schema.sql` dari projek ini.
    *   Pergi ke **SQL Editor** di dashboard Supabase anda.
    *   Tampal keseluruhan kandungan `schema.sql` dan klik **Run**.

3.  **Pasang Dependencies:**
    ```bash
    npm install
    ```

## 🔐 Konfigurasi Environment Variables (PENTING)

Untuk memastikan fungsi pembayaran dan database berjalan, anda perlu menetapkan variable berikut.

### 1. Di Fail `.env` (Local Development - Frontend)
Cipta fail `.env`:
```bash
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

### 2. Di Cloudflare Pages Dashboard (Production - Backend)
Pergi ke **Settings > Environment variables** di projek Cloudflare Pages anda dan tambah:

| Variable Name | Description | Where to find |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | URL Projek Supabase | Supabase Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Key Admin (Bypass RLS) | Supabase Settings > API (Service Role) |
| `TOYYIBPAY_SECRET_KEY` | Secret Key ToyyibPay | ToyyibPay Dashboard |
| `TOYYIBPAY_CATEGORY_CODE` | Category Code ToyyibPay | ToyyibPay Dashboard (Create Category) |
| `APP_URL` | **(Optional)** URL Domain Utama | Set kepada `https://celikkalam.my` |

> **Amaran:** Jangan sesekali dedahkan `SUPABASE_SERVICE_ROLE_KEY` di dalam kod frontend atau fail `.env` yang dipush ke GitHub. Ia hanya untuk environment server (Cloudflare).

## 💻 Cara Run Local

### Frontend Sahaja (Tanpa Fungsi Bayaran)
```bash
npm run dev
```
*Nota: Fungsi `handlePay` akan gagal kerana folder `functions/` tidak dijalankan oleh Vite.*

### Full Stack (Frontend + Backend Functions)
Anda perlu install `wrangler` terlebih dahulu:
```bash
npm install -g wrangler
```
Kemudian jalankan:
```bash
npx wrangler pages dev . -- npm run dev
```
Ini membolehkan anda test API `/api/create-bill` secara local.

## 🚀 Deployment

1.  Push kod ke GitHub.
2.  Sambungkan repo ke Cloudflare Pages.
3.  Set **Build Command**: `npm run build`
4.  Set **Output Directory**: `dist`
5.  Masukkan Environment Variables seperti di atas.
6.  Deploy!

## 🔐 Akaun Demo

Selepas setup, daftar akaun dan jalankan SQL ini di Supabase untuk set admin:
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@test.com';
UPDATE public.profiles SET role = 'ustaz' WHERE email = 'ustaz@test.com';
```