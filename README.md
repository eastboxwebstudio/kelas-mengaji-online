# CelikKalam - Aplikasi Kelas Mengaji

Aplikasi ini menggunakan **React (Vite)** untuk frontend dan **Cloudflare Pages Functions + D1 Database** untuk backend.

## 🚀 Cara Deploy (Langkah Demi Langkah)

### 1. Setup Database (Buat kali pertama)
Pastikan anda telah login ke Cloudflare (`npx wrangler login`). Kemudian, cipta struktur jadual:

```bash
npx wrangler d1 execute celikkalam-db --file=./schema.sql --remote
```

### 2. Build Projek
Setiap kali anda ubah kod frontend (fail `.tsx`), anda wajib jalankan ini:

```bash
npm run build
```

### 3. Deploy ke Internet
Hantar folder `dist` ke Cloudflare:

```bash
npx wrangler pages deploy dist
```

---

## 🛠 Cara Cipta Admin
Selepas deploy, daftar akaun biasa di website anda. Kemudian, tukar role mereka kepada 'admin' menggunakan terminal:

1. Dapatkan ID pengguna (boleh tengok di D1 console dashboard atau agak-agak jika baru daftar seorang):
```bash
npx wrangler d1 execute celikkalam-db --command="SELECT * FROM users" --remote
```

2. Update role kepada admin:
```bash
npx wrangler d1 execute celikkalam-db --command="UPDATE users SET role='admin' WHERE email='emel_anda@gmail.com'" --remote
```

## 💻 Local Development
Untuk test di komputer sendiri (termasuk database):

```bash
npm run build
npx wrangler pages dev dist --d1 DB=celikkalam-db
```
