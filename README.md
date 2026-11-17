# V60 Brew Lab

Aplikasi web V60 responsif dengan kalkulator resep, pouring schedule, stopwatch, dan jurnal seduhan.

## Menjalankan
Buka `index.html` di browser untuk mencoba fitur dasar. Untuk PWA/offline, jalankan melalui HTTPS atau localhost karena service worker membutuhkan secure context.

## Deploy gratis melalui GitHub + Vercel
1. Buat repository GitHub baru bernama `v60-brew-lab`.
2. Upload seluruh isi folder proyek ini ke repository (bukan hanya file ZIP).
3. Masuk ke Vercel dan pilih Add New → Project.
4. Import repository `v60-brew-lab`.
5. Framework Preset: Other. Build Command dan Output Directory dapat dikosongkan; Root Directory `./`.
6. Tekan Deploy.

## Pasang di Android
1. Buka URL Vercel di Chrome Android.
2. Buka menu ⋮.
3. Pilih "Install app" atau "Add to Home screen" jika tersedia.
4. Ikuti instruksi Chrome.

## Catatan
- Riwayat jurnal disimpan di localStorage browser pada perangkat yang digunakan.
- Data tidak tersinkron otomatis ke perangkat lain.
- Service worker melakukan cache aset agar aplikasi dapat dibuka offline setelah kunjungan pertama yang berhasil.
