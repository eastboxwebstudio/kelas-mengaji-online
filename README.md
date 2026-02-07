# CelikKalam - Aplikasi Kelas Mengaji (Client-Side)

Aplikasi ini kini berjalan sepenuhnya di browser menggunakan **LocalStorage**. 
Tiada backend, tiada database, tiada server error.

## 🚀 Cara Deploy (Penting!)

Kerana kita sudah buang backend, sila guna arahan ini dengan tepat:

1. **Install:**
   ```bash
   npm install
   ```

2. **Build Project:**
   ```bash
   npm run build
   ```

3. **Deploy ke Cloudflare Pages:**
   ```bash
   npx wrangler pages deploy dist
   ```
   *(Pilih "Create a new project" jika ditanya, dan namakan projek ini `celikkalam`)*

## 💻 Cara Run Local
```bash
npm run dev
```

## 🔐 Akaun Demo
- **Admin:** `admin@test.com` / `admin`
- **Ustaz:** `ustaz@test.com` / `ustaz`
