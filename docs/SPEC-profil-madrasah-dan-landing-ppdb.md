# Spesifikasi Perubahan: Profil Madrasah & Landing Page PPDB Publik (PIPP Manba'ul Hikmah)

**Tanggal:** 2026-11-25  
**Status:** Menunggu Approval Manusia (Gate Sebelum Implementasi)  
**Referensi Sumber Data:** `https://pippmanbaulhikmah.com/welcome/` (`/profil/`, `/visi-dan-misi/`, `/kurikulum/`, `/contac/`, `/about-us/`)

---

## 1. Tujuan (Objective)

Memperbarui identitas madrasah pada sistem SIMMA agar mencerminkan data resmi **PIPP Manba'ul Hikmah Temanggung**, menyinkronkan data profil madrasah antara backend (`institutions`) dan frontend (halaman **Profil Madrasah**, **Login**, **Sidebar**, serta **Portal PPDB Publik**), serta merombak tampilan **Landing Page PPDB Publik** (`/ppdb`) agar lebih menarik, modern, informatif, mudah dipahami wali santri/calon siswa, dan tetap ringan/simpel.

---

## 2. Asumsi & Pertanyaan Terbuka (Wajib Dikonfirmasi Sebelum Coding)

### Asumsi Kerja
1. **Tidak mengubah skema tabel PostgreSQL (`institutions`)**: kolom `emisData` bertipe `jsonb` sudah tersedia di `simma-be/src/db/schema/setup.ts`, sehingga field tambahan profil pesantren/madrasah (visi, misi, pengasuh, tahun berdiri, jenjang, kontak WhatsApp pengurus, media sosial, ringkasan fasilitas & ekstrakurikuler) disimpan di `emisData` tanpa migrasi DB berisiko.
2. **Aset Logo Resmi**: Logo dari `https://pippmanbaulhikmah.com/welcome/wp-content/uploads/2022/07/cropped-logo-hikmah.png` akan diunduh ke lokal `simma-fe/public/images/logo-manbaul-hikmah.png` agar tetap tampil cepat dan andal di lingkungan LAN/on-premise (dengan fallback ikon jika gambar gagal dimuat).
3. **Alur Inti PPDB Tetap Sama**: Tab **Daftar Baru**, **Masuk Portal**, **Cek Pengumuman**, dan **Portal Pendaftar** tetap mengikuti kontrak API `/api/v1/ppdb/*` yang sudah ada.
4. **Identitas Visual**: Tetap mempertahankan palet **Emerald Green & Slate** khas madrasah dengan aksen **Amber/Gold** hangat (menghindari palet AI generik ungu/indigo), tipografi bersih, mobile-first, dan WCAG AA contrast >= 4.5:1.

### Data yang Tidak Tersedia di Website `pippmanbaulhikmah.com`
Mohon konfirmasi atau lengkapi (atau biarkan default placeholder sementara untuk diubah nanti lewat menu **Pengaturan -> Profil Madrasah**):
- **NSM (12 digit)** & **NPSN (8 digit)**
- **Status Madrasah**: `swasta` (diasumsikan Swasta karena di bawah yayasan/ponpes PIPP)
- **Akreditasi BAN-PDM** (misal: `A` / `B`)
- **Nama & NIP Kepala Madrasah Aliyah** (website mencantumkan Pengasuh: `K. Nur Yasin`)
- **Nomor SK Pendirian** & **Nomor SK Izin Operasional**

---

## 3. Data Terverifikasi dari `pippmanbaulhikmah.com`

| Atribut | Nilai Terverifikasi |
|---|---|
| **Nama Resmi** | Perguruan Islam Pondok Pesantren (PIPP) Manba'ul Hikmah / MA Manba'ul Hikmah |
| **Tahun Berdiri** | 1998 |
| **Pengasuh** | K. Nur Yasin |
| **Alamat** | Jl. Kebonsari, Bantengan, Kebonsari, Wonoboyo, Kabupaten Temanggung, Jawa Tengah 56266 |
| **Email** | `ppsmanbaulhikmah@gmail.com` |
| **Website** | `https://pippmanbaulhikmah.com` |
| **WhatsApp Konsultasi** | `+6285602015153` (`https://wa.me/6285602015153`) |
| **WhatsApp Pengurus Putra** | `+6285799218349` (`https://wa.me/6285799218349`) |
| **WhatsApp Pengurus Putri** | `+6282329477596` (`https://wa.me/6282329477596`) |
| **WhatsApp Bendahara** | `+6281578964250` (`https://wa.me/6281578964250`) |
| **Media Sosial** | Facebook: `pipp.hikmah`, Instagram: `pipp.manbaulhikmah`, YouTube: `Pipp Manba'ul Hikmah` |
| **Jenjang Pendidikan** | 1. Pendidikan Kesetaraan Wustho (Tingkat MTs)<br>2. Madrasah Aliyah (MA)<br>3. Program ISMA (*Isti'dad Madrasah Aliyah*, khusus lulusan SMP/MTs luar PIPP dengan kurikulum PonPes Salafiyah) |
| **Visi** | Menjadi lembaga pendidikan Islam yang unggul dan mencetak generasi muslim yang cerdas dan sholih, unggul dalam IMTAK berprestasi dalam IPTEK, serta mencetak mujtahid, mujadid, dan mujahid. |
| **Misi (7 Poin)** | 1. Menyelenggarakan proses belajar mengajar yang menyenangkan, kreatif, dan inovatif.<br>2. Menumbuhkembangkan akhlak dan sikap amaliah Islam.<br>3. Mengembangkan multi kecerdasan secara berimbang.<br>4. Membina peningkatan keterampilan selaras perkembangan zaman.<br>5. Menanamkan sikap bersungguh-sungguh dalam mencapai tujuan mulia.<br>6. Memberikan wawasan baru untuk mengembangkan ilmu pengetahuan segala bidang.<br>7. Memperjuangkan kebenaran yang hak sesuai Al-Qur'an dan Al-Hadis. |
| **Kurikulum Diniyah & Formal** | Memadukan sains/IPTEK formal dengan Diniyah PonPes Salafiyah (Tingkat Tsanawiyah & Aliyah: Al-Qur'an, Ulumul Qur'an, Tafsir Jalalain & Rowai'ul Bayan, Hadits Bulughul Marom & Shohih Muslim, Fiqih Fathul Qorib/Fathul Mu'in, Qowa'idul Fiqhiyyah, Usul Fiqih As-Sulam/Al-Bayan, Tasawuf Minhajul Abidin, Nahwu Jurumiyah/Imrity/Alfiyah Ibnu Aqil, Tauhid, serta Kajian Kitab Tarojumah Syaikh KH Ahmad Rifa'i). |
| **Ekstrakurikuler (12)** | Kajian kitab salaf, Training metode pengajaran Al-Qur'an, Ceramah 3 bahasa (Arab, Inggris, Indonesia), Sains & teknologi komputer, Bahtsul Masail, Organisasi & kepemimpinan, Pramuka, Qashidah/Rebana, Kaligrafi, Teater, Club olahraga, Keterampilan & wirausaha (pertanian & peternakan). |
| **Fasilitas (11)** | Masjid, Asrama Pesantren, Gedung Sekolah, Perpustakaan, MCK/WC, Lab Komputer, Lab Bahasa, Ruang Tamu, Kopontren, Klinik Kesehatan, Aula. |

---

## 4. Rencana Perubahan Teknis & Desain UI/UX

### 4.1 Backend (`simma-be`)
1. **Seed Data (`simma-be/src/db/seed.ts`)**:
   - Memperbarui record `institutions` awal (dan upsert saat seed) ke profil **PIPP Manba'ul Hikmah** (alamat Wonoboyo Temanggung, status `swasta`, dan `emisData` lengkap berisi pengasuh, tahun berdiri, visi, misi, jenjang, kontak WhatsApp, sosial media, fasilitas, ekstrakurikuler, ringkasan kurikulum).
2. **Endpoint Publik PPDB (`GET /api/v1/ppdb/public-info`)**:
   - Menyelaraskan respons `PpdbService.getPublicInfo()` dengan kontrak `PpdbPublicInfo` di frontend (`academicYear`, `academicYearId`, `tracks`, `majors`, `isOpen`, `totalApplicants`) sekaligus menyertakan ringkasan `institution` (nama, alamat, pengasuh, tahun berdiri, kontak WA, email, sosmed, visi, misi, jenjang, fasilitas, ekstrakurikuler) agar landing page PPDB selalu tersinkron dengan menu **Profil Madrasah**.
   - Catatan keamanan: Tidak membocorkan data sensitif internal (hanya profil publik madrasah).

### 4.2 Frontend — Profil Madrasah (`simma-fe/src/features/settings/`)
1. Memperluas komponen form profil madrasah (tetap < 300 LOC per file):
   - Menambahkan section baru `InstitutionPesantrenProfileForm.tsx` (Tahun Berdiri, Pengasuh Pondok, Visi, Misi, Nomor WhatsApp Layanan Konsultasi/Putra/Putri/Bendahara, Media Sosial) yang disimpan ke `emisData`.
   - Menambahkan preview kartu ringkas **Identitas Publik** pada `InstitutionProfilePage.tsx` agar admin tahu persis tampilan data pada Kop Surat & Portal PPDB.
2. Memperbarui branding aplikasi di `simma-fe/index.html`, `LoginPage.tsx`, dan `AppLayout.tsx` agar menampilkan identitas **PIPP Manba'ul Hikmah** secara dinamis/konsisten.

### 4.3 Frontend — Landing Page PPDB Publik (`simma-fe/src/features/ppdb/`)
Merombak `PpdbPublicPortalPage.tsx` dan `PpdbPublicLandingSection.tsx` menjadi komponen modular (< 300 LOC per file) dengan alur visual yang **simpel, bersih, scannable, dan tidak penuh teks**:
1. **Header Sticky Ringkas**: Logo resmi Manba'ul Hikmah + nama madrasah + navigasi jelas (`Beranda`, `Program & Kurikulum`, `Alur & Syarat`, `Cek Pengumuman`, `Masuk`, CTA `Daftar Sekarang`).
2. **Hero Section Berfokus Aksi**:
   - Badge Tahun Ajaran aktif (dinamis dari `public-info`) + lokasi Temanggung + berdiri sejak 1998.
   - Headline kuat tentang perpaduan **IMTAK & IPTEK** di PIPP Manba'ul Hikmah.
   - 2 tombol CTA utama (`Daftar Santri / Siswa Baru` & `Masuk Portal Pendaftar`) + tautan sekunder (`Cek Status Kelulusan`).
   - Panel ringkas di kanan (desktop) menampilkan **3 Jenjang Pendidikan** (Wustho/MTs, Madrasah Aliyah, Program ISMA) dan akses cepat **Layanan 24 Jam**.
3. **Sekilas Profil, Visi & Misi (Ringkas & Terstruktur)**:
   - Kartu Visi utama + accordion/daftar ringkas 7 Misi + profil Pengasuh (`K. Nur Yasin`) & ringkasan keunggulan pesantren salafiyah + madrasah formal.
4. **Tabs Interaktif Kurikulum, Fasilitas & Ekstrakurikuler** (menggunakan Headless UI / state lokal agar halaman tidak terlalu panjang ke bawah):
   - Tab 1: **Program & Kurikulum** (MA Formal + Diniyah Tsanawiyah/Aliyah + Kitab Tarojumah).
   - Tab 2: **Fasilitas Pondok & Madrasah** (11 fasilitas dengan ikon Lucide yang konsisten).
   - Tab 3: **Ekstrakurikuler & Pengembangan Diri** (12 kegiatan santri).
5. **Alur Pendaftaran (4 Langkah Visual) & Kelengkapan Dokumen** (dipertahankan jelas sesuai alur SNPDB/EMIS 4.0 + informasi 4 jalur seleksi).
6. **Pusat Bantuan & Kontak WhatsApp Resmi**:
   - Tombol klik langsung ke WhatsApp resmi (Konsultasi, Pengurus Putra, Pengurus Putri, Bendahara), alamat lengkap Temanggung, email, dan link media sosial resmi.

---

## 5. Kriteria Keberhasilan (Success Criteria)

- [ ] `GET /api/v1/ppdb/public-info` mengembalikan profil madrasah + data tahun ajaran/jalur yang valid dan teruji unit test (`vitest`).
- [ ] Halaman **Profil Madrasah** (`/settings/profile`) dapat membaca dan menyimpan identitas PIPP Manba'ul Hikmah beserta data pesantren (`pengasuh`, `tahunBerdiri`, `visi`, `misi`, kontak WA/sosmed) tanpa error.
- [ ] Halaman **Landing Page PPDB Publik** (`/ppdb`) menampilkan data PIPP Manba'ul Hikmah dengan responsif (`375px`, `768px`, `1024px`, `1440px`), aksesibel (keyboard & kontras >= 4.5:1), dan seluruh alur (`Daftar Baru`, `Masuk Portal`, `Cek Pengumuman`) tetap berfungsi normal.
- [ ] Semua file komponen/service baru & terubah <= 300 baris, menggunakan `API_ENDPOINTS`, dan lulus `pnpm typecheck`, `pnpm lint`, serta `pnpm test`.

---

## 6. Boundaries

- **Always do:** Jaga batas 300 LOC per file, gunakan `API_ENDPOINTS`, validasi via Zod/shared schema jika menambah contract, jalankan `typecheck` + `lint` + `test`.
- **Ask first:** Perubahan skema DB (`drizzle/schema`), penambahan dependency npm baru.
- **Never do:** Membaca/mengubah `.env`, melemahkan asersi unit test yang ada, mengarang data NSM/NPSN/SK tanpa tanda placeholder yang jelas.
