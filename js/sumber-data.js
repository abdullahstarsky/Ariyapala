/* =====================================================================
   SUMBER DATA — satu-satunya berkas yang perlu disunting bila jalur
   pengambilan data berubah. Dimuat SEBELUM skrip hidrasi di index.html.

   Isi window.ARIYAPALA_API dengan salah satu:

   1) '' atau '/api'  → memakai proxy /api di host yang sama
        · Cloudflare Pages/Workers: ada proxy + cache edge 5 menit
        · GitHub Pages / Netlify:   /api tidak ada → 404 → situs tampil
          dengan data bawaan (seed). Aman, tidak pernah blank.

   2) 'https://script.google.com/macros/s/ID-GAS/exec'
        → langsung ke Google Apps Script, bentuk ?sheet=<tab>
        · Tanpa proxy & tanpa cache; hanya GET (aman dari CORS)
        · Cocok untuk GitHub Pages setelah backend GAS hidup

   Kosongkan (mode 1) bila ragu — situs tetap utuh berkat seed bawaan.
   ===================================================================== */
// Nilai yang sudah dipasang lebih awal (mis. disuntik host/eksperimen) tidak ditimpa.
if (typeof window.ARIYAPALA_API === 'undefined') window.ARIYAPALA_API = '/api';
