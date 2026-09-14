/* =====================================================================
   ASISTEN ARIYAPALA — hybrid 3 lapis (sesi 22)
   Lapis 1 : KB kurasi (array KB di bawah) — jawaban ringkas & terkurasi.
   Lapis 2 : indeks hidup isi situs — dibangun ulang SETIAP panel dibuka,
             jadi selalu memuat hasil render /api/* terbaru (berita,
             angkatan, anggota, pengurus, mitra, kontak…).
   Lapis 3 : rujukan sopan (FALLBACK) — tidak pernah mengarang fakta.
   Cara menambah jawaban: tambah entri di array KB
     {k:'kata kunci dipisah spasi', a:'jawaban (boleh <b>HTML</b> aman)',
      chip:'teks tombol saran (opsional)', goto:'#id', gt:'Buka bagian …'}
   `a` boleh berupa fungsi yang mengembalikan string (untuk jawaban dinamis).
   ===================================================================== */
(function () {
  'use strict';
  if (document.getElementById('asisten-fab')) return;

  /* ---------- teks lapis 3 (TERKUNCI — jangan diubah tanpa putusan) ---------- */
  const FALLBACK = 'Maaf kawan, informasi itu belum tersedia di situs ini. Untuk informasi lebih lanjut, silakan hubungi admin/panitia melalui formulir di bagian Bergabung atau kanal Kontak ya. Salam Rimba! 🌿';

  /* ---------- peta bagian situs ---------- */
  const BAGIAN = [
    ['profil', 'Profil'], ['sejarah', 'Sejarah'], ['struktur', 'Struktur'],
    ['angkatan', 'Angkatan & Anggota'], ['bidang', 'Bidang'], ['program', 'Program'],
    ['berita', 'Berita'], ['galeri', 'Galeri'], ['mitra', 'Rekan Sejalan'],
    ['bergabung', 'Bergabung'], ['kontak', 'Kontak']
  ];
  const NAMA = Object.fromEntries(BAGIAN);

  /* ---------- pembantu ---------- */
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const norm = s => String(s || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const token = s => norm(s).split(' ').filter(w => w.length > 1);
  const rapih = s => String(s || '').replace(/\s+/g, ' ').trim();

  /* kata tanya/generik: tidak boleh sendirian memicu jawaban */
  const GENERIK = new Set(['apa', 'siapa', 'kapan', 'dimana', 'di', 'mana', 'berapa', 'bagaimana', 'gimana',
    'kenapa', 'mengapa', 'apa', 'dan', 'yang', 'itu', 'ini', 'nya', 'ada', 'adalah', 'dari', 'untuk', 'dengan',
    'tentang', 'tanya', 'info', 'informasi', 'mohon', 'tolong', 'bisa', 'saya', 'aku', 'kamu', 'kami', 'kita',
    'dong', 'ya', 'hai', 'halo', 'halo', 'assalamu', 'salam', 'min', 'gan', 'kak']);

  /* ---------- LAPIS 1 — KB KURASI ---------- */
  const KB = [
    {
      k: 'ariyapala kepanjangan arti nama singkatan aliansi rimba pecinta alam', chip: 'ARIYAPALA itu apa?', goto: '#profil', gt: 'Profil',
      a: 'ARIYAPALA = <b>Aliansi Rimba Pecinta Alam</b>. Nama awalnya “Aliansi Simba Pecinta Alam Yayasan Pesantren Cintawana” ketika berdiri 7 Januari 2001, lalu dikenal sebagai ARIYAPALA seperti sekarang.'
    },
    {
      k: 'berdiri didirikan tanggal tahun lahir sejarah awal mula 2001 kapan', chip: 'Kapan berdirinya?', goto: '#sejarah', gt: 'Sejarah',
      a: 'ARIYAPALA berdiri <b>7 Januari 2001</b> di Yayasan Pesantren Cintawana, Singaparna, Kabupaten Tasikmalaya, Jawa Barat.'
    },
    {
      k: 'pendiri perintis pembina tokoh penggagas siapa mendirikan', chip: 'Siapa pendirinya?', goto: '#struktur', gt: 'Struktur',
      a: 'Empat perintis — <b>Aceng Abdul Aziz, Jajang Permana, Asep Hari</b> — bersama pembina <b>Helmi Ahmad M Farid, A.Md</b> (Nama Rimba: XENZOE) mendirikan organisasi ini.'
    },
    {
      k: 'xenzo xenzoi helmi ahmad pembina namarimba nta 01010201 pramuka blog admin', chip: 'Siapa XENZOE?', goto: '#struktur', gt: 'Struktur',
      a: 'XENZOE adalah Nama Rimba <b>Helmi Ahmad M Farid, A.Md</b> — pembina sekaligus guru di lingkungan Yayasan Pesantren Cintawana dan Pembina Pramuka. Lahir 12 Desember 1977, NTA Nomor Rimba 01010201 PAC, dan menjadi admin blog arsip ariyapala.blogspot.com (2008–2010).'
    },
    {
      k: 'tenk baja angkatan pertama angkatan i dadan winanto calon calong abdullah starsky kiwil torikul sudin', chip: 'Angkatan I «Tenk Baja»', goto: '#angkatan', gt: 'Angkatan',
      a: 'Angkatan I «TENK BAJA» lahir dari Diklatsar pertama 2001 dan beranggotakan lima orang: <b>Dadan Muhamad Ramdan, Winanto “Calong”, Abdullah Starsky, Torikul Haq, dan Sudin</b>.'
    },
    {
      k: 'kiwil abdullah starsky pembuat situs website siapa yang menyusun credit @tenkbaja', chip: 'Siapa Kiwil?', goto: '#angkatan', gt: 'Angkatan',
      a: '<b>Abdullah Starsky</b> — Nama Rimba <b>Kiwil</b> — anggota Angkatan I «Tenk Baja» yang menyusun website dan arsip digital ini (kredit desain & dokumentasi situs: © @TenkBaja).'
    },
    {
      k: 'diklatsar diklat dasar pendidikan latihan ciamis gentar dampal piton 4 hari 3 malam pertama perdana kali tempat lokasi digelar diadakan diselenggarakan', chip: 'Diklatsar pertama', goto: '#sejarah', gt: 'Sejarah',
      a: 'Diklatsar pertama berlangsung <b>4 hari 3 malam di Pegunungan Ciamis</b>, dibimbing pecinta alam Kota Tasikmalaya: <b>GENTAR, DAMPAL, dan PITON</b>. Tradisi 4 hari 3 malam ini berlanjut sampai sekarang.'
    },
    {
      k: '2008 dua belas angkatan 12 50 anggota blog pmii outbond latgab', chip: 'Kondisi 2008', goto: '#sejarah', gt: 'Sejarah',
      a: 'Pada 2008 ARIYAPALA telah menghasilkan <b>12 angkatan dengan 50+ anggota</b> lintas jenjang (SMP–SMA–SMK). Latihan gabungan & outbond digelar bersama <b>PK PMII Kab. Tasikmalaya</b>, dan dokumentasi mulai dibuka di blog resmi ariyapala.blogspot.com.'
    },
    {
      k: 'gunung es inggris 2009 puncak sejukkk coy ekspedisi luar negeri', chip: 'Gunung Es 2009', goto: '#sejarah', gt: 'Sejarah',
      a: 'Tahun 2009 anggota ARIYAPALA menorehkan catatan langka: mendaki hingga puncak <b>“Gunung Es” di Inggris</b>. Dokumentasinya tersimpan sebagai montase arsip bertajuk “Sejukkk Coyy”.'
    },
    {
      k: 'mubes musyawarah besar 2010 kaos combet 20s rp45.000 administrasi rp20.000', chip: 'MUBES II 2010', goto: '#sejarah', gt: 'Sejarah',
      a: '<b>MUBES II</b> digelar 13–14 September 2010 di SMK YPC (administrasi Rp20.000/orang) untuk regenerasi kepengurusan. Momen ini merilis kaos MUBES dan desain kaos organisasi baru — Rp45.000, bahan Combet 20s.'
    },
    {
      k: '2017 angkatan 28 gunung golkar ciamis video youtube dokumentasi', chip: 'Angkatan 28 (2017)', goto: '#sejarah', gt: 'Sejarah',
      a: 'Tahun 2017, Diklatsar <b>Angkatan 28</b> berlangsung di kawasan <b>Gunung Golkar, Ciamis</b>. Dokumentasinya dapat disaksikan lewat kanal YouTube yang ditautkan di bagian Kontak.'
    },
    {
      k: '2026 website resmi arsip digital reborn blog diselamatkan 17 pos', chip: 'Website baru 2026', goto: '#berita', gt: 'Berita',
      a: 'Tahun 2026 ARIYAPALA hadir kembali di panggung digital: website resmi ini memuat sejarah sejak 2001 plus galeri arsip hasil penyelamatan blog lama — <b>17 pos, 2008–2010</b>.'
    },
    {
      k: 'visi misi tujuan cita cita imtaq akhlakul karimah iptek', chip: 'Visi & Misi', goto: '#profil', gt: 'Profil',
      a: '<b>Visi:</b> menjadi organisasi pecinta alam yang unggul dalam prestasi, pioneer, berkarakter, dan peduli lingkungan — didasari IMTAQ, dihiasi Akhlakul Karimah, dan dibekali IPTEK. <b>Misi</b>nya merangkum lima hal: menumbuhkan cinta alam, melatih petualang yang aman & terampil, mengembangkan potensi fisik–mental–spiritual, menjalin silaturahmi antar pecinta alam, serta mengabdi untuk pelestarian lingkungan.'
    },
    {
      k: 'bidang divisi seksi keorganisasian struktur organisasi ada apa saja', chip: 'Ada bidang apa?', goto: '#bidang', gt: 'Bidang',
      a: 'Ada enam bidang: <b>Pendakian & Ekspedisi</b>, <b>Rescue & Pertolongan Pertama</b>, <b>Administrasi & Keuangan</b>, <b>Media, Humas & Dokumentasi</b>, <b>Perlengkapan & Kesejahteraan Anggota</b>, serta <b>Konservasi & Pengabdian Lingkungan</b>.'
    },
    {
      k: 'program kerja kegiatan rutin enam pilar latihan ekspedisi rescue konservasi lomba', chip: 'Program kerja', goto: '#program', gt: 'Program',
      a: 'Enam pilar program kerja: <b>01</b> Open Recruitment & Diklatsar, <b>02</b> Latihan Keterampilan Alam, <b>03</b> Pendakian & Ekspedisi, <b>04</b> Kursus Rescue & Siaga SAR, <b>05</b> Pengabdian & Konservasi, <b>06</b> Lomba & Silaturahmi (LKPA, latgab antar-Mapala).'
    },
    {
      k: 'latihan keterampilan alam navigasi darat map compass tali temali panjat tebing survival manuver medan', chip: 'Latihan apa saja?', goto: '#program', gt: 'Program',
      a: 'Latihan rutin meliputi navigasi darat, map & compass, tali-temali & panjat tebing, survival, dan manuver medan — pernah dipertandingkan pula lewat kegiatan “Rotation of Calong”.'
    },
    {
      k: 'rescue sar ppmi ksr pertolongan pertama p3k evakuasi siaga', chip: 'Bidang rescue', goto: '#bidang', gt: 'Bidang',
      a: 'Bidang <b>Rescue & Pertolongan Pertama</b> melatih evakuasi, pertolongan pertama pada kecelakaan (PPPK), dan penugasan siaga SAR bersama KSR dan PMI. Ada pula kursus KPPK dalam program kerja.'
    },
    {
      k: 'konservasi lingkungan tanam pohon bersih kawasan pengabdian edukasi hijau', chip: 'Aksi lingkungan', goto: '#bidang', gt: 'Bidang',
      a: 'Bidang <b>Konservasi & Pengabdian Lingkungan</b> menjalankan aksi nyata: penanaman pohon, pembersihan kawasan, dan edukasi lingkungan ke sekolah serta masyarakat — selaras dengan gerakan hijau keluarga besar Cintawana.'
    },
    {
      k: 'gabung bergabung daftar cara mendaftar jadi anggota alur langkah proses seleksi wawancara', chip: 'Cara bergabung', goto: '#bergabung', gt: 'Bergabung',
      a: 'Tiga langkah: <b>1)</b> isi formulir pendaftaran, <b>2)</b> seleksi (berkas, wawancara singkat, uji kesiapan fisik), <b>3)</b> Diklatsar 4 hari 3 malam lalu dilantik sebagai anggota resmi dengan nomor NTA.'
    },
    {
      k: 'syarat persyaratan pendaftaran ketentuan boleh daftar anggota baru siapa yang bisa ikut smp sma smk santri 2026/2027 wali sehat', chip: 'Syarat daftar', goto: '#bergabung', gt: 'Bergabung',
      a: 'Syaratnya: siswa SMP/SMA/SMK YPC atau santri Pondok Pesantren Cintawana (periode 2026/2027); sehat jasmani & rohani; berjiwa rindu pada alam; serta diizinkan orang tua/wali lewat formulir persetujuan bertanda tangan.'
    },
    {
      k: 'nta nomor anggota nomor rimba identitas anggota', chip: 'Apa itu NTA?', goto: '#bidang', gt: 'Bidang',
      a: '<b>NTA</b> (Nomor Tanda Anggota) diterbitkan setelah Diklatsar dan pelantikan. Pengurusannya berada di bidang Administrasi & Keuangan; contoh NTA yang tercatat: 01010201 PAC milik pembina XENZOE.'
    },
    {
      k: 'nama rimba alias julukan tradisi calong kiwil xenzo', chip: 'Nama rimba', goto: '#angkatan', gt: 'Angkatan',
      a: 'Nama Rimba adalah alias tradisi ARIYAPALA. Yang tercatat di situs ini antara lain <b>XENZOE</b> (Helmi Ahmad M Farid), <b>Calong</b> (Winanto), dan <b>Kiwil</b> (Abdullah Starsky).'
    },
    {
      k: 'angkatan berapa jumlah banyak kader 28 generasi', chip: 'Berapa angkatan?', goto: '#angkatan', gt: 'Angkatan',
      a: 'Hingga 2017 tercatat <b>28 angkatan</b> hasil Diklatsar, dan pada 2008 saja sudah ada 12 angkatan dengan 50+ anggota aktif. Rekrutmen periode 2026/2027 menuju angkatan ke-29 dan seterusnya.'
    },
    {
      k: 'anggota siapa saja daftar anggota kader nama', chip: 'Daftar anggota', goto: '#angkatan', gt: 'Angkatan',
      a: 'Bagian <b>Angkatan & Anggota</b> memuat daftar per angkatan lengkap dengan nama rimba, foto (bila ada), dan penanda ketua angkatan. Datanya dikelola pengurus lewat panel admin, jadi daftar bisa bertambah sewaktu-waktu.'
    },
    {
      k: 'ketua siapa ketua umum pengurus sekarang periode formasi kepengurusan', chip: 'Siapa ketuanya?', goto: '#struktur', gt: 'Struktur',
      a: 'Formasi inti (Ketua Umum, Wakil, Sekretaris, Bendahara, dan para kepala bidang) berjalan sesuai amanah Musyawarah Besar di bawah binaan Helmi Ahmad M. Farid “XENZOE”. Susunan <b>formasi aktif</b> dimutakhirkan pengurus melalui kanal resmi, termasuk panel situs ini — begitu datanya masuk, ia tampil di bagian Struktur.'
    },
    {
      k: 'kontak hubungi alamat sekretariat lokasi basecamp dimana cikunten singaparna tasikmalaya', chip: 'Alamat sekretariat', goto: '#kontak', gt: 'Kontak',
      a: 'Sekretariat: <b>SMK YPC / Komplek Pondok Pesantren Cintawana, Desa Cikunten, Kec. Singaparna, Kab. Tasikmalaya, Jawa Barat</b>. Peta lokasinya tersedia di bagian Kontak.'
    },
    {
      k: 'whatsapp wa nomor telepon panitia chat kirim pesan', t: 'nomor whatsapp wa panitia telepon kirim pesan formulir bergabung', chip: 'Nomor WA panitia', goto: '#kontak', gt: 'Kontak',
      a: () => {
        const wa = String(window.ARIYAPALA_WA || '').replace(/\D/g, '');
        return wa
          ? 'Nomor WhatsApp panitia: <a href="https://wa.me/' + esc(wa) + '" target="_blank" rel="noopener"> wa.me/' + esc(wa) + '</a>. Bisa juga isi formulir di bagian Bergabung — pesannya tersusun otomatis siap kirim.'
          : 'Nomor WhatsApp panitia belum dipasang pengurus di situs ini. Sementara itu, isi formulir di bagian <a href="#bergabung">Bergabung</a> — pesannya tersusun otomatis tinggal kirim — atau sampaikan lewat kanal Kontak.';
      }
    },
    {
      k: 'email surat instagram ig medsos sosial media jejak digital blog youtube arsip', chip: 'Kanal digital', goto: '#kontak', gt: 'Kontak',
      a: 'Jejak digital yang tercatat: blog arsip <a href="https://ariyapala.blogspot.com/" target="_blank" rel="noopener">ariyapala.blogspot.com</a> (2008–2010) dan video <a href="https://m.youtube.com/watch?v=bXeUP7XyJg4" target="_blank" rel="noopener">Diklatsar Angkatan 28 (2017)</a> di YouTube. Kanal lain (email/Instagram) dipasang pengurus begitu tersedia.'
    },
    {
      k: 'naungan yayasan pesantren cintawana ponpes smk ypc induk berdiri 1917 kh muhammad toha', chip: 'Naungan organisasi', goto: '#profil', gt: 'Profil',
      a: 'ARIYAPALA bernaung di bawah <b>Yayasan Pesantren Cintawana</b> — pesantren salaf tertua di Priangan, didirikan KH Muhammad Toha pada 12 April 1917. Anggotanya siswa SMP, SMA, SMK YPC dan santri Ponpes Cintawana.'
    },
    {
      k: 'satuan pendidikan sekolah tk smp sma smk npsn akreditasi kompetensi keahlian', chip: 'Satuan di bawah naungan', goto: '#profil', gt: 'Profil',
      a: 'Empat satuan pendidikan di bawah naungan: <b>TK Islam Cintawana</b> (NPSN 20262202), <b>SMP Pesantren Cintawana</b> (NPSN 20210723, sejak 1965), <b>SMA Pesantren Cintawana</b> (NPSN 20210779, berdiri 1970, akreditasi A), dan <b>SMK YPC Tasikmalaya</b> (NPSN 20210704, berdiri 1998, akreditasi A, 8 kompetensi keahlian).'
    },
    {
      k: 'logo lambang bendera identitas gambar asli restorasi arti warna', chip: 'Makna logo & bendera', goto: '#profil', gt: 'Profil',
      a: 'Logo dan bendera di situs ini adalah <b>berkas asli</b> yang diterima dari pengurus (2026) — logo direstorasi untuk keperluan web, bendera dipasang apa adanya tanpa digambar ulang. Emblem naungan memakai berkas asli logo SMK YPC dari blog resmi sekolah.'
    },
    {
      k: 'galeri foto dokumentasi arsip kegiatan lihat gambar', chip: 'Lihat galeri', goto: '#galeri', gt: 'Galeri',
      a: 'Bagian <b>Galeri</b> berisi dokumentasi kegiatan (pendakian, basecamp, sungai, langit malam, latihan) plus <b>14 foto arsip asli</b> yang diselamatkan dari blog lama 2008–2010. Klik foto untuk memperbesar.'
    },
    {
      k: 'berita kabar terbaru pengumuman rekrutmen haul hari santri', chip: 'Berita terbaru', goto: '#berita', gt: 'Berita',
      a: 'Kabar terbaru: website resmi ARIYAPALA (September 2026), Open Recruitment periode 2026/2027, Haul Akbar KH Muhammad Toha ke-83 & KH Ishak Farid ke-40 (25–26 April 2026), serta aksi Hari Santri 22 Oktober 2024 — 49 pesantren menanam 5.000 bibit pohon bersama Danone Indonesia.'
    },
    {
      k: 'rekan sejalan mitra kerja sama jejaring organisasi lain pmii mapala latgab', chip: 'Rekan sejalan', goto: '#mitra', gt: 'Rekan Sejalan',
      a: 'Dari arsip tercatat latihan gabungan & outbond bersama <b>PK PMII Kab. Tasikmalaya</b> (2008), dan jejaring latgab antar-Mapala se-Tasikmalaya & Priangan. Daftar resmi rekan organisasi dimutakhirkan langsung oleh pengurus.'
    },
    {
      k: 'lkpa lomba keterampilan pecinta alam kompetisi silaturahmi kunjungan', chip: 'Lomba & silaturahmi', goto: '#program', gt: 'Program',
      a: 'ARIYAPALA ikut serta dalam <b>LKPA</b> (Lomba Keterampilan Pecinta Alam), latihan gabungan antar-Mapala, dan kunjungan silaturahmi pecinta alam se-Tasikmalaya dan Priangan.'
    },
    {
      k: 'kaos seragam atribut perlengkapan inventaris carrier tenda tali temali combet', chip: 'Kaos & perlengkapan', goto: '#bidang', gt: 'Bidang',
      a: 'Bidang <b>Perlengkapan & Kesejahteraan Anggota</b> mengurus inventaris: tas carrier, tenda, tali-temali, dan kaos organisasi — meneruskan tradisi kaos Combet 20s sejak 2010.'
    },
    {
      k: 'blog arsip ariyapala blogspot 2008 2010 17 pos tulisan', chip: 'Blog arsip lama', goto: '#kontak', gt: 'Kontak',
      a: 'Blog lama <a href="https://ariyapala.blogspot.com/" target="_blank" rel="noopener">ariyapala.blogspot.com</a> aktif 2008–2010 dengan 17 pos, dikelola pembina XENZOE. Seluruh posnya telah diselamatkan ke galeri arsip situs ini.'
    },
    {
      k: 'salam rimba sapaan penutup', chip: 'Salam Rimba!',
      a: 'Sapaan khas ARIYAPALA: <b>Salam Rimba!</b> 🌿 Selamat menjelajah situs ini, kawan.'
    },
    {
      k: 'asisten siapa kamu bot chat tanya jawab cara kerja sumber jawaban', chip: 'Siapa asisten ini?',
      a: 'Saya <b>Asisten Ariyapala</b> — penjawab otomatis di situs ini. Jawaban saya hanya bersumber dari isi situs (termasuk data terbaru yang dimasukkan pengurus lewat panel admin). Bila pertanyaan belum terjawab, saya akan mengarahkan kawan ke panitia, bukan mengarang.'
    },
    {
      k: 'acara agenda jadwal kegiatan terdekat event rundown pendaftaran acara kalender', t: 'jadwal pendaftaran acara kalender agenda formulir panitia pengurus', chip: 'Acara & agenda',
      a: () => {
        const A = window.ARIYAPALA_ACARA || {};
        const f = A.form_acara, k = A.kalender_acara;
        if (f || k) {
          return 'Tautan acara resmi yang dipasang pengurus: ' +
            (f ? '<a href="' + esc(f) + '" target="_blank" rel="noopener">Formulir Pendaftaran Acara</a>' : '') +
            (f && k ? ' · ' : '') +
            (k ? '<a href="' + esc(k) + '" target="_blank" rel="noopener">Kalender Agenda</a>' : '') +
            '. Keduanya juga tersedia di bagian <a href="#bergabung">Bergabung</a>.';
        }
        return 'Jadwal & pendaftaran acara dimutakhirkan pengurus; pantau bagian Bergabung atau tanyakan ke panitia lewat kanal Kontak.';
      }
    },
    {
      k: 'terima kasih makasih thanks salam penutup bye dadah',
      a: 'Sama-sama, kawan. Salam Rimba! 🌿'
    }
  ];

  /* ---------- mesin penilaian (dipakai lapis 1 & 2) ----------
     Bobot: kata konten cocok penuh +4 · akar kata (awalan bersama, ≥4 huruf) +3.5 ·
     irisan sebagian +1 — semuanya dikali penguat kelangkaan (IDF sederhana atas
     seluruh teks KB). Kata generik (apa/siapa/di mana/…) hanya +1.5 dan DIBATASI
     maksimal 3 — supaya pertanyaan yang hanya berisi kata tanya tak pernah
     memicu jawaban. Kata <3 huruf diabaikan (kecuali terdaftar di kata kunci). */
  const teksDasar = e => norm(e.k + ' ' + (typeof e.a === 'function' ? (e.t || e.k) : (e.a || '')));
  const DF = {};
  KB.forEach(e => new Set(teksDasar(e).split(' ')).forEach(w => { DF[w] = (DF[w] || 0) + 1; }));
  const NKB = Math.max(KB.length, 1);
  const penguat = w => 1 + Math.log(NKB / (1 + (DF[w] || 0))) / 2.5;

  function skor(tanya, kata, teksJawab) {
    const kt = token(kata);
    if (!kt.length) return { c: 0, g: 0, hits: 0, total: 0 };
    const ktSet = new Set(kt);
    let c = 0, g = 0, hits = 0;
    token(tanya).forEach(w => {
      if (GENERIK.has(w)) { g += 1.5; return; }
      if (w.length < 3) return;
      let b = 0;
      if (ktSet.has(w)) b = 4;
      else if (w.length >= 4) {
        if (kt.some(x => x.length >= 4 && (x.indexOf(w) === 0 || w.indexOf(x) === 0))) b = 3.5;
        else if (kt.some(x => x.length >= 4 && (x.indexOf(w) >= 0 || w.indexOf(x) >= 0))) b = 1;
      }
      if (!b) return;
      hits++;
      c += b * penguat(w);
      if (teksJawab && teksJawab.indexOf(w) >= 0) c += 0.6 * penguat(w); // kata juga ada di isi jawaban
    });
    g = Math.min(g, 3);
    return { c: c, g: g, hits: hits, total: c + g };
  }

  /* ---------- LAPIS 2 — indeks hidup isi situs ---------- */
  const PILIH_TEKS = 'p, li, .kartu-berita, .kartu-mitra, .kartu-pengurus, .kartu-naungan, .orang, .ang-head, .catatan, figcaption';
  const PILIH_JUDUL = 'h2, h3, h4, .thn, .jabatan, .nm';

  const AMBANG_INDEKS = 6;    // lebih ketat daripada KB agar tak asal mengutip
  let INDEKS = [];
  function bangunIndeks() {
    const out = [], pernah = new Set();
    BAGIAN.forEach(([id, nm]) => {
      const sec = document.getElementById(id);
      if (!sec) return;
      const h2 = sec.querySelector('h2');
      const judulSec = rapih(h2 ? h2.textContent : nm) || nm;
      sec.querySelectorAll(PILIH_TEKS).forEach(el => {
        if (el.closest('#asisten-panel')) return;
        if (el.closest('script, style, noscript')) return;
        const teks = rapih(el.textContent);
        if (teks.length < 40) return;                 // buang teks terlalu pendek
        // judul terdekat: judul dalam elemen ini, atau judul sebelumnya di section
        let judul = el.querySelector(PILIH_JUDUL);
        if (!judul) {
          let p = el.previousElementSibling;
          while (p) { if (p.matches && p.matches(PILIH_JUDUL)) { judul = p; break; } p = p.previousElementSibling; }
        }
        if (!judul) judul = h2;
        const kunci = id + '|' + teks.slice(0, 60);
        if (pernah.has(kunci)) return;                // buang duplikat persis
        pernah.add(kunci);
        out.push({
          id: id,
          judul: judulSec,
          kepala: rapih(judul ? judul.textContent : judulSec).slice(0, 90),
          teks: teks
        });
      });
    });
    INDEKS = out;
    return out.length;
  }

  function cariIndeks(tanya) {
    let terbaik = null, sk = null;
    for (const e of INDEKS) {
      const s = skor(tanya, e.kepala + ' ' + e.teks);
      // wajib minimal dua kata konten yang cocok (atau satu kecocokan sangat kuat),
      // supaya satu kata kebetulan tidak langsung menghasilkan kutipan.
      if (s.total < AMBANG_INDEKS) continue;
      if (!(s.hits >= 2 || s.c >= 9)) continue;
      if (!terbaik || s.total > sk.total || (s.total === sk.total && s.hits > sk.hits)) { terbaik = e; sk = s; }
    }
    return terbaik ? { e: terbaik, s: sk } : null;
  }

  function potong(teks, maks) {
    let t = teks.length <= maks ? teks : teks.slice(0, maks);
    if (t.length < teks.length) {
      const b = Math.max(t.lastIndexOf('. '), t.lastIndexOf('! '), t.lastIndexOf('? '));
      t = (b > 80 ? t.slice(0, b + 1) : t.replace(/\s+\S*$/, '')) + '…';
    }
    return t;
  }

  /* ---------- jawaban ---------- */
  function jawab(tanya) {
    // LAPIS 1 — KB kurasi (menang bila ada ≥1 kata konten yang cocok penuh)
    let terbaik = null, sk = null;
    for (const e of KB) {
      const s = skor(tanya, e.k, norm(typeof e.a === 'function' ? (e.t || e.k) : (e.a || '')));
      if (s.c < 4) continue;                       // wajib ada kecocokan kata konten
      if (!terbaik || s.total > sk.total || (s.total === sk.total && s.hits > sk.hits)) { terbaik = e; sk = s; }
    }
    if (terbaik) {
      return { teks: typeof terbaik.a === 'function' ? terbaik.a() : terbaik.a, goto: terbaik.goto, gt: terbaik.gt, skor: sk };
    }
    // LAPIS 2 — indeks hidup
    const h = cariIndeks(tanya);
    if (h) {
      return {
        teks: 'Menurut bagian «' + esc(h.e.judul) + '» di situs ini: ' + esc(potong(h.e.teks, 260)),
        goto: '#' + h.e.id,
        gt: 'Buka bagian ' + NAMA[h.e.id]
      };
    }
    // LAPIS 3 — rujukan sopan
    return { teks: esc(FALLBACK) };
  }

  /* ---------- widget ---------- */
  const fab = document.createElement('button');
  fab.id = 'asisten-fab';
  fab.type = 'button';
  fab.setAttribute('aria-label', 'Buka Asisten Ariyapala');
  fab.setAttribute('aria-expanded', 'false');
  fab.setAttribute('aria-controls', 'asisten-panel');
  fab.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' +
    '<span class="as-nama">ASISTEN</span>';

  const panel = document.createElement('div');
  panel.id = 'asisten-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Asisten Ariyapala');
  panel.innerHTML =
    '<div class="as-kepala">' +
    '  <img src="images/logo-hidup-160.webp" alt="" width="160" height="121">' +
    '  <div><h3>Asisten Ariyapala</h3><p>Tanya apa saja seputar ARIYAPALA — jawaban diambil dari isi situs ini.</p></div>' +
    '  <button class="as-tutup" type="button" id="as-tutup" aria-label="Tutup asisten">✕</button>' +
    '</div>' +
    '<div class="as-chat" id="as-chat" aria-live="polite"></div>' +
    '<div class="as-chips" id="as-chips"></div>' +
    '<form class="as-form" id="as-form" autocomplete="off">' +
    '  <input id="as-input" type="text" placeholder="Tulis pertanyaanmu…" aria-label="Pertanyaan untuk Asisten Ariyapala">' +
    '  <button type="submit" aria-label="Kirim pertanyaan">➤</button>' +
    '</form>';

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  const chat = panel.querySelector('#as-chat');
  const chips = panel.querySelector('#as-chips');
  const form = panel.querySelector('#as-form');
  const input = panel.querySelector('#as-input');

  const CHIP_AWAL = ['ARIYAPALA itu apa?', 'Kapan berdirinya?', 'Cara bergabung', 'Acara & agenda', 'Nomor WA panitia'];
  function isiChips(daftar) {
    chips.innerHTML = '';
    (daftar || []).forEach(t => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = t;
      b.onclick = () => tanya(t);
      chips.appendChild(b);
    });
  }
  isiChips(CHIP_AWAL);

  function pesan(isi, kelas) {
    const d = document.createElement('div');
    d.className = 'as-pesan ' + (kelas || 'bot');
    d.innerHTML = isi;
    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight;
    return d;
  }

  let sibuk = false;
  function tanya(t) {
    const q = rapih(t);
    if (!q) return;
    pesan(esc(q), 'user');
    input.value = '';
    if (sibuk) return;
    sibuk = true;
    const ketik = document.createElement('div');
    ketik.className = 'as-ketik';
    ketik.innerHTML = '<i></i><i></i><i></i>';
    chat.appendChild(ketik);
    chat.scrollTop = chat.scrollHeight;
    setTimeout(() => {
      ketik.remove();
      const j = jawab(q);
      let isi = j.teks;
      if (j.goto) isi += '<a class="as-buka" href="' + esc(j.goto) + '" data-goto="' + esc(j.goto) + '">' + esc(j.gt || 'Buka bagian') + '</a>';
      pesan(isi);
      sibuk = false;
    }, 320);
  }

  /* klik tombol «Buka bagian» → gulir & tutup panel di layar sempit */
  chat.addEventListener('click', e => {
    const a = e.target.closest('a[data-goto]');
    if (!a) return;
    const t = document.querySelector(a.dataset.goto);
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    if (innerWidth <= 640) tutup();
  });

  form.addEventListener('submit', e => { e.preventDefault(); tanya(input.value); });

  function buka() {
    bangunIndeks();                 // indeks hidup: selalu versi terbaru tiap panel dibuka
    panel.classList.add('buka');
    document.body.classList.add('asisten-buka');
    fab.setAttribute('aria-expanded', 'true');
    if (!chat.children.length) {
      pesan('Salam Rimba! 🌿 Saya Asisten Ariyapala. Tanya apa saja seputar organisasi ini — saya menjawab dari isi situs, termasuk data terbaru yang dimasukkan pengurus.');
    }
    chat.scrollTop = chat.scrollHeight;
    setTimeout(() => input.focus(), 60);
  }
  function tutup() {
    panel.classList.remove('buka');
    document.body.classList.remove('asisten-buka');
    fab.setAttribute('aria-expanded', 'false');
  }
  fab.addEventListener('click', () => panel.classList.contains('buka') ? tutup() : buka());
  panel.querySelector('#as-tutup').addEventListener('click', tutup);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('buka')) { tutup(); fab.focus(); }
  });

  /* ---------- kunci admin: tautan acara (tab SITUS / KONTAK) ---------- */
  (async () => {
    // sumber data mengikuti saklar yang sama dengan situs (lihat index.html):
    // '/api' (proxy Cloudflare) atau URL /exec Google Apps Script (?sheet=<tab>)
    const DASAR = String(window.ARIYAPALA_API || '/api').replace(/\/$/, '');
    const urlTab = t => /\/exec$/.test(DASAR) ? DASAR + '?sheet=' + t : DASAR + '/' + t;
    const baca = async t => {
      try {
        const r = await fetch(urlTab(t), { headers: { Accept: 'application/json' } });
        if (!r.ok) return null;
        const d = await r.json();
        return Array.isArray(d) ? d : null;
      } catch (_) { return null; }
    };
    const kumpulkan = baris => {
      const m = {};
      (baris || []).forEach(r => {
        const k = String(r.kunci ?? r.key ?? '').toLowerCase().trim();
        const v = String(r.nilai ?? r.value ?? '').trim();
        if ((k === 'form_acara' || k === 'kalender_acara') && /^https:\/\//i.test(v)) m[k] = v;
      });
      return m;
    };
    const [situs, kontak] = await Promise.all([baca('situs'), baca('kontak')]);
    const m = Object.assign({}, kumpulkan(situs), kumpulkan(kontak));
    window.ARIYAPALA_ACARA = m;                       // dibaca entri KB «acara»
    if (window.ARIYAPALA_TAUTAN_ACARA) window.ARIYAPALA_TAUTAN_ACARA(m);  // dipasang skrip hidrasi
  })();

  /* dipakai QA otomatis (playwright) tanpa harus mengetik di antarmuka */
  window.ARIYAPALA_ASISTEN = {
    tanya: tanya, buka: buka, tutup: tutup, jawab: jawab,
    indeks: () => INDEKS, indeksBaru: bangunIndeks, fallback: FALLBACK, kb: KB, skor: skor
  };
})();
