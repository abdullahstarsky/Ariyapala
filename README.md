# ARIYAPALA — Website Resmi

Situs one-page **ARIYAPALA (Aliansi Rimba Pecinta Alam)** — Yayasan Pesantren Cintawana &
SMK YPC, Singaparna, Kab. Tasikmalaya. Berdiri 7 Januari 2001.

Berkas utama: `index.html` (satu berkas, CSS & JS menempel) + `js/asisten.js`
(Asisten Ariyapala) + `js/sumber-data.js` (saklar sumber data).
Semua fakta berasal dari arsip blog 2008–2010 dan data terverifikasi —
**tidak ada fakta karangan, tidak ada placeholder publik.**

---

## 1. Isi proyek

```
index.html                 situs utama (12 bagian + splash + asisten)
js/asisten.js              Asisten Ariyapala — tanya jawab 3 lapis
js/sumber-data.js          SATU berkas penyetel sumber data (baca §3)
images/                    identitas asli (logo, bendera, naungan) + 7 ilustrasi + 14 foto arsip
admin/gas/Admin.html       panel admin (frontend, siap tempel ke Apps Script)
template/data-ariyapala.xlsx   template isi data untuk pengurus (9 sheet + PANDUAN + CONTOH)
scripts/                   unduh-arsip.py · buat-template-data.py · cek.py · qa.py · zip-proyek.py
video/shots/               tangkapan layar hasil QA terakhir
QA-LAPORAN.md              hasil QA terakhir (playwright, objektif)
.nojekyll                  penanda agar GitHub Pages tidak memproses Jekyll
```

Bagian situs: Beranda · Profil · Sejarah · Struktur · **Angkatan & Anggota** · Bidang ·
Program · Berita · Galeri · Rekan Sejalan · Bergabung · Kontak.

## 2. Pratinjau lokal

```bash
cd ariyapala-website
python3 -m http.server 8080 --bind 0.0.0.0      # lalu buka http://localhost:8080
python3 scripts/cek.py                          # pemeriksa standar (JS, CSS, aset, TODO)
python3 scripts/qa.py                           # QA playwright (butuh: pip install playwright && playwright install chromium)
python3 scripts/zip-proyek.py                   # cadangan satu berkas zip (tiap akhir sesi)
```

## 3. Sumber data — satu saklar

Situs mengisi BERITA · GALERI · PENGURUS · MITRA · ANGKATAN · ANGGOTA · KONTAK · SITUS
dari luar. Dari mana, ditentukan oleh **satu baris** di `js/sumber-data.js`:

| Isi `window.ARIYAPALA_API` | Dipakai | Bentuk permintaan |
|---|---|---|
| `'/api'` (bawaan) | proxy `/api` di host yang sama | `/api/berita` |
| `'https://script.google.com/macros/s/ID-GAS/exec'` | langsung Google Apps Script | `...exec?sheet=berita` |

- Proxy `/api` hidup di **Cloudflare** (Pages Functions / Worker) — membawa **cache edge
  5 menit** sehingga kuota Apps Script terlindungi.
- Tanpa proxy (GitHub Pages, Netlify Drop) → `/api/berita` menjawab 404 → **situs tampil
  utuh dengan data bawaan (seed)**. Ini normal, bukan kerusakan.
- Langsung ke GAS hanya memakai **GET** (aman dari CORS; POST/preflight yang bermasalah).
- Gagal ambil data sebab apa pun → seed tetap tampil. Situs tidak pernah blank.

## 4. Jalur online — A. GitHub Pages (yang dicoba lebih dulu)

Gratis, tanpa terminal, tanpa kartu kredit. Kekurangannya: **tanpa proxy** (lihat §3),
batas wajar ±100 GB/bulan & ±10 kali unggah per jam — lebih dari cukup untuk situs
organisasi.

1. **Buat akun** di github.com (bila belum punya).
2. **New repository** → nama mis. `ariyapala` → pilih **Public**
   (halaman gratis hanya untuk repo publik) → *Create repository*.
3. Di halaman repo, tombol **Add file ▸ Upload files**.
4. Seret **isi** folder proyek (bukan folder pembungkusnya). Pastikan `index.html`
   berada di tingkat paling atas, lalu **Commit changes**.
5. **Settings ▸ Pages** → *Source: Deploy from a branch* → Branch `main`,
   folder `/ (root)` → **Save**.
6. Tunggu ±1–2 menit. Alamatnya: `https://USERNAME.github.io/NAMA-REPO/`.
7. (Nanti) domain sendiri: **Settings ▸ Pages ▸ Custom domain** — tinggal isi, lalu
   arahkan DNS sesuai petunjuk GitHub.

Yang perlu diingat: berkas `.nojekyll` **jangan dihapus** (penanda agar GitHub tidak
memproses situs dengan Jekyll).

## 5. Jalur online — B. Cloudflare (calon berikutnya)

Dua opsi, keduanya gratis & bandwidth tak terbatas:

| Opsi | Keadaan 2026 | Cara deploy |
|---|---|---|
| **Workers + Static Assets** | Disarankan Cloudflare untuk proyek baru; aset statis + logika `/api` menyatu di satu Worker; gratis 100.000 permintaan/hari, 20.000 berkas, 25 MiB/berkas | `npx wrangler deploy` (perlu Node) atau sambung repo GitHub lewat *Workers Builds* |
| **Pages + Pages Functions** | Masih didukung penuh, tapi mode pemeliharaan; unggah seret-folder di dashboard **tidak** mengompilasi folder `functions/` → fungsi hanya ikut lewat Wrangler | `wrangler pages deploy` |

Bila pindah ke salah satunya: kosongkan/kembalikan `js/sumber-data.js` ke `'/api'`,
unggah folder yang sama, selesai — tidak ada berkas lain yang berubah.

## 6. Panel admin & backend (status: MENUNGGU)

Desain lengkap: `ADMIN-PLAN.md`. Ringkas:

- **Backend** — Google Apps Script (`admin/gas/Code.gs`) + 1 Spreadsheet (tab: BERITA,
  GALERI, PENGURUS, KONTAK, PROGRAM, MITRA, ANGKATAN, ANGGOTA, SITUS) + folder Drive
  untuk foto. Kuota akun gmail biasa: 6 menit/eksekusi, ±20.000 UrlFetch/hari.
- **Proxy** — Cloudflare Pages Function `functions/api/[[path]].js` (whitelist 9 tab,
  cache edge 5 menit) — hanya bila memakai jalur Cloudflare.
- **Panel** — `admin/gas/Admin.html` (sudah ada di repo ini, tinggal tempel).

Langkah pemasangan (bila sudah waktunya):

1. Apps Script → proyek baru → tempel `Code.gs` + `Admin.html` → jalankan `setup()` →
   isi Script Property `ADMIN_EMAILS` → *Deploy ▸ Web App* (Execute as: pemilik,
   Access: anyone) → salin URL `/exec`.
2. Uji `URL_GAS/exec?sheet=BERITA` di browser (harus tampil JSON).
3. Untuk GitHub Pages: tempel URL `/exec` itu ke `js/sumber-data.js`.
   Untuk Cloudflare: taruh sebagai env `GAS_URL`, biarkan saklar `'/api'`.
4. Ganti `ariyapala.pages.dev` di `robots.txt`, `sitemap.xml`, dan canonical/OG di
   `index.html` dengan alamat final.
5. (Opsional) aktifkan Cloudflare Web Analytics — token ditaruh di komentar `<head>`.

## 7. Identitas (aturan keras)

| Berkas | md5 | Keterangan |
|---|---|---|
| `images/bendera-ariyapala-asli.jpg` | `a7ca0e904150539601ed32b249154bc1` | berkas asli pengurus |
| `images/logo-ariyapala-asli.jpg` | `a7ca0e904150539601ed32b249154bc1` | salinan byte-identik bendera |
| `images/logo-ariyapala-hidup.png` | `ce479491db243838973ded13de0179d3` | 1200×910, versi hidup |
| `images/naungan-smk-ypc.gif` | `7e1f8a720aa52a6ca92e1e5c47975031` | emblem SMK YPC asli |

Logo & bendera **tidak boleh digambar ulang**; turunan (hidup-160/320, glossy-640,
watermark, apple-touch, og-share) diturunkan dari berkas asli lewat PIL.

## 8. Asisten Ariyapala

Tombol melingkar kanan-bawah. Tiga lapis jawaban:

1. **KB kurasi** (`js/asisten.js` → array `KB`) — jawaban ringkas terkurasi;
   sunting di sana untuk menambah/mengubah.
2. **Indeks hidup isi situs** — dibangun ulang setiap panel dibuka, jadi ikut menjawab
   konten baru hasil data luar (berita, angkatan, anggota, pengurus, mitra, kontak).
   Format: *“Menurut bagian «…» di situs ini: …”* + tombol buka bagian.
3. **Rujukan sopan** bila tidak ada jawaban: mengarahkan ke formulir Bergabung /
   kanal Kontak. Asisten tidak pernah mengarang fakta.

Nomor WhatsApp panitia tidak di-hardcode: otomatis muncul bila panel admin mengisi
kunci `wa` (tab KONTAK).

## 9. Data yang masih ditunggu dari pengurus (Paket A)

Nomor WA & email & IG resmi organisasi · formasi kepengurusan aktif · daftar mitra
(Rekan Sejalan) · nama & ketua angkatan II–XXVIII · foto kegiatan 2011–2026.
Isian pakai `template/data-ariyapala.xlsx`. Kanal resmi Pesantren Cintawana
(WA/email/IG pesantren) **bukan** kanal ARIYAPALA — jangan dipasang sebagai kontak
organisasi.

## 10. Kredit

Disusun oleh **Abdullah Starsky «Kiwil»** — Angkatan I «Tenk Baja».
Desain & dokumentasi situs © @TenkBaja.
