# CelikKalam - Aplikasi Kelas Mengaji

Aplikasi ini kini menggunakan **Supabase** sebagai backend untuk pangkalan data (PostgreSQL) dan pengesahan (authentication).

## 🚀 Persediaan Awal (Setup)

1.  **Cipta Projek Supabase:**
    *   Daftar dan cipta projek baru di [supabase.com](https://supabase.com).

2.  **Konfigurasi Environment Variables:**
    *   Cipta fail `.env` di direktori utama projek.
    *   Salin API URL dan Anon Key dari Supabase Project Settings > API.
    *   Tampal ke dalam fail `.env`:
        ```
        VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
        VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
        ```

3.  **Setup Pangkalan Data:**
    *   Buka fail `schema.sql` dari projek ini.
    *   Pergi ke **SQL Editor** di dashboard Supabase anda.
    *   Tampal keseluruhan kandungan `schema.sql` dan klik **Run**. Ini akan mencipta semua jadual dan polisi keselamatan yang diperlukan.

4.  **Pasang Dependencies:**
    ```bash
    npm install
    ```

## 💻 Cara Run Local
```bash
npm run dev
```

## 🔐 Akaun Demo

Selepas setup, anda perlu mendaftar akaun baru melalui antaramuka aplikasi. Untuk menetapkan peranan (role) sebagai `admin` atau `ustaz`:

1.  Daftar akaun 'admin@test.com' dan 'ustaz@test.com' (atau emel pilihan anda) melalui aplikasi. Peranan mereka akan jadi 'student' secara lalai.
2.  Pergi ke SQL Editor di Supabase dan jalankan query ini untuk menaik taraf peranan mereka:
    ```sql
    -- Gantikan emel dengan yang anda daftarkan
    UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@test.com';
    UPDATE public.profiles SET role = 'ustaz' WHERE email = 'ustaz@test.com';
    ```

## 🚀 Cara Deploy ke Cloudflare Pages

1.  Pastikan kod anda berada di repositori GitHub.
2.  Di Cloudflare, cipta projek **Pages** dan sambungkan ke repo anda.
3.  **Konfigurasi Build:**
    *   **Framework Preset:** `Vite`
    *   **Build Command:** `npm run build`
    *   **Build Output Directory:** `dist`
4.  **Tambah Environment Variables:**
    *   Pergi ke Settings > Environment variables di projek Pages anda.
    *   Tambah `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dengan nilai dari Supabase.
5.  Deploy.
