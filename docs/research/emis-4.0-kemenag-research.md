# EMIS 4.0 Kemenag — Data Fields, Format & Integration Research

> All fields below are sourced from official Kemenag training materials, EMIS 4.0 templates,
> operator guides, and reverse-engineered API tools. Source URLs are cited inline.

## 1. System Overview

- **Full name**: Education Management Information System 4.0
- **Operator**: Direktorat Jenderal Pendidikan Islam, Kementerian Agama RI
- **URL**: https://emis.kemenag.go.id/
- **API base**: `https://api-emis.kemenag.go.id/v1/` (confirmed from GitHub exporter)
- **Legal basis**: KMA No. 83 Tahun 2022 (Pengelolaan Data Pendidikan); PMA No. 1/2023; SE Dirjen Pendis No. SE/DJ-I/PP.00.9/63/2013
- **Architecture**: Microservices with API-based inter-service communication
- **Coverage**: RA, MI, MTs, MA/MAK, PTKI, PD-Pontren, PAI — ~31,172 RA/Madrasah, ~20 million peserta didik

Sources:
- https://kemenag.go.id/opini/emis-4-0-gerbang-data-pendidikan-kementerian-agama-rKxmf
- https://kemenag.go.id/kolom/emis-4-0-transformasi-digital-data-pendidikan-islam-eOEUC

---

## 2. Data Modules (Modul Data)

EMIS 4.0 organizes data into these primary modules:

| # | Module | Description |
|---|--------|-------------|
| 1 | **Data Kelembagaan** | Institution profile, identity, accreditation |
| 2 | **Data Sarana Prasarana** | Facilities, buildings, rooms, sanitation |
| 3 | **Data Rombongan Belajar (Rombel)** | Study groups / class sections |
| 4 | **Data Siswa / Peserta Didik** | Student personal data, parents, addresses |
| 5 | **Data PTK (Pendidik & Tenaga Kependidikan)** | Teachers and staff |
| 6 | **Data Mutasi** | Student transfers in/out |
| 7 | **Data Kelulusan** | Graduation processing |
| 8 | **Data Rapor / Nilai** | Report cards (via Verval-UN / RDM) |

Source: https://id.scribd.com/document/787015263/Instrumen-EMIS-Kemenag-Kab-Malang-2024

---

## 3. Data Kelembagaan (Institution Data)

### 3.1 Identitas Lembaga (Read-only fields marked 🔒)

| Field | Notes |
|-------|-------|
| 🔒 NPSN | Nomor Pokok Sekolah Nasional — auto-issued via VervalSP Pusdatin |
| 🔒 NSM | Nomor Statistik Madrasah |
| 🔒 Nama Lembaga | |
| 🔒 Status Madrasah | Negeri / Swasta |
| 🔒 Jenis Lembaga | RA / MI / MTs / MA / MAK |
| 🔒 Kategori Madrasah | |
| Nomor SK Izin Operasional | |
| Tanggal SK Izin Operasional | |
| Alamat | Jalan, Desa/Kelurahan, Kecamatan, Kab/Kota, Provinsi |
| Kode Pos | 5 digit |
| Koordinat | Latitude, Longitude (titik koordinat GPS) |
| Telepon | |
| Email Lembaga | |
| Galeri Foto | Upload foto pendukung |
| Dokumen Perizinan | Upload scan documents |

### 3.2 Akreditasi

| Field | Notes |
|-------|-------|
| No. SK Akreditasi | |
| Tanggal SK Akreditasi | |
| Nilai Akreditasi | Numeric score |
| Status Akreditasi | A / B / C / Belum Terakreditasi |

> Akreditasi data flows: EMIS → Pusdatin → BAN S/M (SISPENA). Values pushed back via integration server.

### 3.3 Additional Lembaga Data

| Field |
|-------|
| Data Rekening BOS |
| Data Personnel (Kepala Madrasah, etc.) |
| Prestasi Lembaga |
| Letak Lembaga (map) |
| Jarak ke Pemerintahan dan lembaga lain |
| Madrasah Induk (for filial) — searchable by NSM |

Sources:
- https://id.scribd.com/presentation/802413641/FAQ-Madrasah-1
- https://id.scribd.com/presentation/756111635/Pengembangan-EMIS-4-0
- https://id.scribd.com/document/684566871/Materi-Faq-Emis-4-0-November-2023

---

## 4. Data Peserta Didik / Siswa (Student Data)

### 4.1 Data Induk Kependudukan (6 core identity fields — validated against Dukcapil)

These fields are **locked in EMIS** — changes require Dukcapil validation via VervalPD:

| # | Field | Format | Validation |
|---|-------|--------|------------|
| 1 | **Nama Lengkap** | Text | Must match KK/Dukcapil exactly (case-sensitive to 1 character) |
| 2 | **NIK** | 16 digits | Validated against Kemendagri Dukcapil database |
| 3 | **Tempat Lahir** | Text | Must match KK |
| 4 | **Tanggal Lahir** | dd/mm/yyyy | Must match KK |
| 5 | **Jenis Kelamin** | L / P (Laki-laki / Perempuan) | Must match Dukcapil |
| 6 | **Nama Ibu Kandung** | Text | Must match KK — cannot be changed in EMIS |

Source: https://id.scribd.com/presentation/796086708/UPDATE-EMIS-4-0

### 4.2 Data Pokok Pendidikan

| Field | Format | Notes |
|-------|--------|-------|
| **NISN** | 10 digits | Auto-issued by Pusdatin; never editable in EMIS |
| **NIS** (Nomor Induk Sekolah) | School-assigned | Editable |
| **Tahun Ajaran** | e.g. 2024/2025 | |
| **Status Keaktifan** | Aktif / Tidak Aktif / Aktif Tanpa Rombel | |
| **Tingkat** | 10, 11, 12 (for MA) | Kelas/grade |
| **Rombel** | 2-digit code: 01, 02, 03... | Study group |
| **Jurusan** | Code-based (for MA: IPA, IPS, Bahasa, Keagamaan) | |
| **Tanggal Masuk Sekolah** | Date | |

### 4.3 Data Pribadi Siswa (Editable by Operator)

| # | Field | Format / Options | Required |
|---|-------|-----------------|----------|
| 1 | Foto Peserta Didik | jpg/png, max 2MB | Optional |
| 2 | Kewarganegaraan | WNI / WNA | Yes |
| 3 | Anak Ke | Integer (from KK) | Yes |
| 4 | Jumlah Saudara | Integer (from KK) | Yes |
| 5 | Agama | Islam (default for madrasah) | Yes |
| 6 | Cita-cita | Enum: PNS, TNI/POLRI, Guru/Dosen, Dokter, Politikus, Wiraswasta, Ilmuwan, Seniman/Artis, Agamawan, Lainnya | Optional |
| 7 | Hobi | Enum: Olahraga, Membaca, Menulis, Jalan-jalan, Lainnya | Optional |
| 8 | No Handphone | Phone number / "Tidak memiliki" | Optional |
| 9 | Email Siswa | Email format | Optional |
| 10 | Pra Sekolah | Yes/No | Yes |
| 11 | Imunisasi | Yes/No | Yes |

### 4.4 Data Tempat Tinggal Siswa

| # | Field | Format / Options |
|---|-------|-----------------|
| 1 | Status Tempat Tinggal | Enum (see below) |
| 2 | Provinsi | Kode provinsi |
| 3 | Kabupaten/Kota | Kode kabupaten |
| 4 | Kecamatan | Kode kecamatan |
| 5 | Kelurahan/Desa | Nama |
| 6 | Nama Jalan/Kampung | Text |
| 7 | Kode Pos | 5 digits |
| 8 | Koordinat Alamat | Lat/Long |
| 9 | Transportasi Ke Sekolah | Enum (see below) |
| 10 | Jarak Ke Madrasah | Enum (see below) |
| 11 | Waktu Tempuh | Enum: 1-10 Menit, 10-19 Menit, 20-29 Menit, 30-59 Menit, 1-2 Jam, >2 Jam |
| 12 | Yang Membiayai Sekolah | Orang Tua / Tanggungan Sendiri / Lainnya |

**Kode Status Tempat Tinggal:**
| Kode | Keterangan |
|------|------------|
| 1 | Tinggal dengan Orangtua/Wali |
| 2 | Tinggal dengan Saudara/Kerabat |
| 3 | Asrama Madrasah |
| 4 | Kontrak/Kost |
| 5 | Asrama Pesantren |
| 6 | Panti Asuhan |
| 7 | Rumah Singgah |
| 8 | Lainnya |

> If "Asrama Madrasah" → address auto-fills with madrasah address.
> If "Tinggal dengan Orang Tua/Wali" → address auto-fills from father's address.

**Kode Jarak Ke Madrasah:**
| Kode | Keterangan |
|------|------------|
| 1 | Kurang dari 1 Km |
| 2 | Antara 1 - 3 Km |
| 3 | Antara 3 - 5 Km |
| 4 | Antara 5 - 10 Km |
| 5 | Lebih dari 10 Km |

**Kode Transportasi:**
| Kode | Keterangan |
|------|------------|
| 1 | Jalan Kaki |
| 2 | Sepeda |
| 3 | Sepeda Motor |
| 4 | Mobil Pribadi |
| 5 | Antar Jemput Sekolah |
| 6 | Angkutan Umum (Bis, Angkot, Ojek, dll) |

### 4.5 Data Kebutuhan Khusus & Disabilitas

| Field | Format |
|-------|--------|
| Kebutuhan Khusus | Tidak Ada / Ada (detail below) |
| Kebutuhan Disabilitas | Multiple select |

**Kebutuhan Khusus options** (CSV template uses 0/1 flags):
- Tuna Rungu
- Tuna Netra
- Tuna Daksa
- Tuna Grahita
- Tuna Laras
- Lamban Belajar
- Sulit Belajar
- Gangguan Komunikasi
- Bakat Luar Biasa

### 4.6 Data KIP & KK

| Field | Format |
|-------|--------|
| Nomor KIP | String (optional) |
| Upload KIP | PDF/JPG/PNG, max 2MB |
| Nomor Kartu Keluarga (KK) | Numeric string |
| Nama Kepala Keluarga | Text (from KK) |
| Upload KK | PDF/JPG/PNG, max 2MB |

Sources:
- https://www.edugoedu.com/edit-detail-siswa-di-emis-madrasah/
- https://id.scribd.com/document/725520502/Kebutuhan-Data-Emis
- https://id.scribd.com/document/511817410/Template-Emis-4-0-Umum
- https://id.scribd.com/document/427352537/Petunjuk-Pengisian-Template-Siswa-EMIS-19-20-pdf
- https://www.slideshare.net/slideshow/panduan-emis-40-menu-siswa-panduan-emis-40/267649560

---

## 5. Data Orang Tua Siswa (Parent Data)

### 5.1 Data Ayah Kandung

| Field | Format | Notes |
|-------|--------|-------|
| Nama Lengkap Ayah | Text | Changes require Kemenag Kab/Kota approval |
| NIK Ayah | 16 digits | Changes require approval |
| Status Ayah | Masih Hidup / Sudah Meninggal / Tidak Diketahui | |
| Kewarganegaraan | WNI / WNA | |
| Tempat Lahir | Text | Changes require approval |
| Tanggal Lahir | Date | Changes require approval |
| Pendidikan Terakhir | Enum: Tidak Berpendidikan, SD, SMP, SMA, D1, D2, D3, D4/S1, S2, S3 | |
| Pekerjaan Utama | Enum: Tidak Bekerja, Pensiunan, Pengusaha, Buruh, Sopir, Pedagang, TNI/Polisi, Petani/Peternak, Guru, PNS, Swasta, Lainnya | |
| No Handphone | Phone / "Tidak memiliki" | |
| Tempat Tinggal Domisili | Dalam Negeri / Luar Negeri | |
| → Jika Dalam Negeri: | Provinsi, Kota/Kab, Kecamatan, Kelurahan/Desa, Nama Jalan, Kode Pos | |
| → Jika Luar Negeri: | Alamat (free text) | |
| Status Rumah | Milik Sendiri / Milik Orang Tua / Milik Saudara / Kontrak/Sewa / Lainnya | |
| Upload KK Ayah | PDF/JPG/PNG, max 200KB | Required when changing identity fields |

### 5.2 Data Ibu Kandung

Same fields as Ayah, with:
- **Nama Ibu Kandung** — **CANNOT be changed** in EMIS (locked to Dukcapil)
- Tempat tinggal option: "Sama dengan ayah kandung" (auto-fills)

### 5.3 Data Wali

| Field | Options |
|-------|---------|
| Wali | Ayah Kandung / Ibu Kandung / Lainnya |
| → Jika Lainnya: | Full set of identity fields (Nama, NIK, Tempat/Tanggal Lahir, etc.) |

### 5.4 Penghasilan Orang Tua

| Kode | Range |
|------|-------|
| 1 | ≤ Rp 500.000 |
| 2 | Rp 500.000 - Rp 1.000.000 |
| 3 | Rp 1.000.000 - Rp 2.000.000 |
| 4 | Rp 2.000.000 - Rp 3.000.000 |
| 5 | Rp 3.000.000 - Rp 5.000.000 |
| 6 | > Rp 5.000.000 |

Sources:
- https://id.scribd.com/document/696358654/Formulir-Data-Santri-Emis-4-0
- https://www.slideshare.net/slideshow/panduan-emis-40-menu-siswa-panduan-emis-40/267649560

---

## 6. Detail Tabs in EMIS 4.0 Student View

| Tab | Contents |
|-----|----------|
| **Data Siswa** | Personal data, address, special needs |
| **Data Orang Tua** | Father, mother, guardian data |
| **Aktivitas Belajar** | Academic year, class, study group assignments |
| **Beasiswa & Bantuan** | Scholarship and aid records |
| **Prestasi Siswa** | Achievements: Akademik, Keagamaan, Teknologi, Olahraga, Pramuka/Paskibra, Karya Ilmiah, Kesenian, Pidato Bahasa Asing, Sains, Lainnya |
| **Pendidikan Lain** | Other educational activities |

Source: https://www.ayomadrasah.id/2021/05/melihat-mengubah-detail-siswa-emis-40.html

---

## 7. Data Rombel (Study Group / Classroom)

Template CSV columns for room/class data:

| Field | Format | Notes |
|-------|--------|-------|
| Kelas | Integer: 1-12 (for MA: 10, 11, 12) | |
| Nama Rombel | 2-digit: 01, 02, 03... | Resets per grade level (NOT sequential across grades) |
| Jurusan | Code-based | IPA, IPS, Bahasa, Keagamaan for MA |
| Bahasa | Code reference | |
| Kurikulum | Code: K-13, Kurikulum Merdeka, KTSP | |

> "Nama Rombel akan berulang untuk jenjang yang berbeda. Misalnya Kelas 1 Nama Rombel 01, 02, 03. Kelas 2 Nama Rombel 01, 02, 03."

Source: https://www.slideshare.net/slideshow/problematika-nisn-dan-pengembangan-emis-18-19/251029110

---

## 8. Data Sarana Prasarana (Facilities)

| Data Group | Fields |
|------------|--------|
| **Lahan** | Nama Lahan, Luas Lahan (m²) — changes require Kamad + Kemenag approval |
| **Bangunan/Gedung** | Luas Bangunan |
| **Ruangan** | Types below, each with: Jumlah, Kondisi (Baik/Rusak Ringan/Rusak Sedang/Rusak Berat), Kapasitas |
| **Sanitasi** | Toilet/Kamar Mandi (jumlah, kondisi), Air Bersih, Sarana Cuci Tangan |
| **Utilitas** | Daya Listrik (watt), Internet/Provider |

**Jenis Ruangan tracked:**
- Ruang Kelas
- Ruang Guru
- Ruang Perpustakaan
- Ruang Tata Usaha
- Ruang OSIS
- Ruang Serba Guna/Aula
- Ruang Kepala
- Ruang BK (Bimbingan Konseling)
- Ruang Laboratorium
- Toilet/Kamar Mandi

Room setup: Must be designated as "ruang kelas" and have capacity filled for rombel assignment.

Source: https://id.scribd.com/document/708411748/Kuisioner-emis-kabupaten-2024

---

## 9. Data PTK (Teacher/Staff)

### Data migrated from Simpatika to EMIS 4.0 (Oct 2024):

| Category | Fields |
|----------|--------|
| **Data Diri** | Nama, Tempat Lahir, Tanggal Lahir, Jenis Kelamin, Nama Ibu Kandung, NIK, No HP, Email, Alamat |
| **Data Induk** | NIK, Nama, Tempat Lahir, Tanggal Lahir, Jenis Kelamin, Nama Ibu Kandung — validated against Dukcapil via VervalPTK |
| **Data Bertugas** | Tempat Tugas Madrasah, No SK, Tanggal SK, Jenis PTK, File SK |
| **Sertifikasi** | NRG, Mapel Sertifikasi, No Serdik, No Peserta, LPTK Penyelenggara |
| **Inpassing** | Golongan Inpassing, TMT Inpassing, SK Inpassing |
| **NUPTK** | Converted from NPK; requires: valid NIK, complete education history (SD-latest) |
| **Tugas Utama** | Tugas Utama Pembelajaran (Guru) / Tugas Utama Kependidikan (Tendik) |
| **Pendidikan Formal** | Must be re-input — requires ijazah upload for NUPTK |
| **Jadwal** | Must be re-input |

Source: https://www.slideshare.net/slideshow/penjelsan-emis-4-0-untuk-akun-guru_2024-pdf/273207063

---

## 10. EMIS 4.0 API (Reverse-engineered)

From GitHub EMIS-Kemenag-Student-Data-Exporter:

### Endpoint
```
GET https://api-emis.kemenag.go.id/v1/reports/pontren/report-kemenag/santri
```

### Query Parameters
| Param | Type | Description |
|-------|------|-------------|
| per_page | int | Records per page (default 50) |
| page | int | Page number |
| academic_year_id | int | Academic year identifier |

### Authentication
```
Authorization: Bearer <TOKEN>
Origin: https://emis.kemenag.go.id
Referer: https://emis.kemenag.go.id/
```

### Response Structure
```json
{
  "success": true,
  "results": [...],
  "metadata": {
    "pagination": {
      "last_page": <int>
    }
  }
}
```

### Student Record Fields (API response)
| API Key | Description |
|---------|-------------|
| student_id | EMIS internal student ID (UUID format: a6442673-7101-4aba-...) |
| full_name | Nama Lengkap |
| nik | NIK (16 digits) |
| nisn | NISN (10 digits) |
| gender_name | Jenis Kelamin |
| birth_place | Tempat Lahir |
| birth_date | Tanggal Lahir |
| age | Umur |
| level_name | Tingkat/Kelas |
| rombel | Rombongan Belajar |
| student_status | Status Siswa (Aktif, Tidak Aktif) |
| status_description | Keterangan Status |
| statistic_num | NSM Lembaga |
| institution_name | Nama Lembaga |
| address | Alamat |
| graduate_year | Tahun Lulus |

### Academic Year ID Mapping
```
year_id = sequential from 1 (2017/2018 Odd)
base_pair = (year_id - 1) // 2
year_a = 2017 + base_pair
semester = "Even" if year_id % 2 == 0 else "Odd"
```

Source: https://github.com/Adibrino/EMIS-Kemenag-Student-Data-Exporter

---

## 11. Data Exchange: EMIS ↔ Pusdatin/Dapodik

### Atribut Data Peserta Didik yang dialirkan dari EMIS ke Pusdatin:

| Field | Field |
|-------|-------|
| Id Peserta Didik | Jurusan |
| NIK | Alamat Siswa |
| NISN | Nomor HP |
| Nama Siswa | Alamat Email |
| Tempat Lahir | Tanggal Masuk Sekolah |
| Tanggal Lahir | Tahun Lulus |
| Jenis Kelamin | Jenis Keluar |
| Agama | Kebutuhan Khusus |
| Nama Ibu Kandung | Id Sekolah |
| Tingkat/Kelas | NPSN |
| Rombel Paralel | Nama Madrasah |

### Integration Points
- **EMIS → Pusdatin**: NISN issuance, NIK validation
- **Pusdatin → EMIS**: NISN assignment, Dukcapil validation results, akreditasi scores
- **EMIS → BAN S/M**: Accreditation data
- **Mechanism**: Web service based on NIK and No. KK
- **Sync delay**: 1x24 hours for data updates

### Integrated Systems
- Pusaka (Super App)
- EDM-ERKAM (e-RKAM)
- AKGTK, AKMI
- BOS, PIP
- IJOP Madrasah
- Simba, Sikap, Simsarpras
- PDUM (Pendataan Ujian Madrasah)
- Simpeg, Siaga
- Simpatika → EMIS 4.0 GTK
- RDM (Rapor Digital Madrasah)

Source: https://id.scribd.com/document/496240496/Integrasi-EMIS-Dapodik

---

## 12. CSV/Template Import Format

### Template Rules (strict)
1. **DO NOT** add, remove, or modify columns
2. **DO NOT** add rows outside template
3. Columns A-F are typically read-only (identity fields)
4. Save as **CSV (MS-DOS)** — comma-separated, NOT semicolon
5. Regional settings must be **English (UK)** to ensure comma delimiter
6. Edit from source XLS, save as CSV — don't edit CSV directly

### Template Types Available in EMIS
| Template | Purpose |
|----------|---------|
| Template PPDB | New student admission from Sekolah Umum |
| Template Data Ruangan | Room/classroom configuration |
| Template Data Siswa CAPESUN | Final-year exam candidates |
| Template Kebutuhan Khusus | Special needs flags (0/1 per field) |
| Template NIK/NISN/NISM | Student identity numbers |
| Template Tempat Tinggal | Student residence data |
| Template Rapor | Grade/score entry |

### PPDB Template Constraints
- Only for students from Sekolah Umum (TK, SD, SMP, SMA)
- Data is per-Rombel per-Jenjang
- System does NOT accept corrections to Nama, Tempat Lahir, Tanggal Lahir after upload
- Uploading madrasah students through PPDB template is prohibited (sanctions apply)

### CSV Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| Data not visible | Wrong delimiter (not comma) | Change regional settings to English (UK), re-save |
| Red columns | Invalid data per reference codes | Fix per petunjuk pengisian, re-save |
| No Save button | Empty rows in CSV | Open in Notepad, delete empty rows (,,,,,,,,,,) |

### CAPESUN Export
- Output format: `.ez` file (custom EMIS format)
- Process: Configure rombel → Move students to CAPESUN → Download template → Fill data → Save as CSV → Upload
- Berita Acara (official report) must be printed

Source: https://www.slideshare.net/slideshow/problematika-nisn-dan-pengembangan-emis-18-19/251029110

---

## 13. Rapor/Grade Template Columns

### K-13 Kurikulum columns:
| Code | Field |
|------|-------|
| KKM | Kriteria Ketuntasan Minimal (e.g. 70, 75) |
| PA | Pengetahuan dalam Angka (e.g. 70.5, 80, 90) |
| PP | Pengetahuan dalam Predikat: "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-" |
| KA | Keterampilan dalam Angka |
| KP | Keterampilan dalam Predikat (same scale as PP) |
| S | Sikap (same predikat scale) |

### KTSP Kurikulum columns:
| Code | Field |
|------|-------|
| KKM | Same |
| PA | Same |
| PP | Dikosongkan (leave empty) |
| Deskripsi | Kode 1-2: Terlampaui, Kode 3: Tercapai, Kode 4: Belum Tercapai |

Source: https://www.slideshare.net/slideshow/petunjuk-pengisian-raport-emis/251029045

---

## 14. PPDB Business Rules (for MA)

1. **Input Data Baru** is NOT available for MTs and MA — students at these levels must already exist in EMIS or Dapodik
2. For MA PPDB, student must have:
   - Status "alumni" from jenjang sebelumnya (MTs), OR
   - Status "tidak aktif" at kelas awal of same jenjang
3. Student search uses: NIK, NISN, or (Nama + Tempat Lahir + Tanggal Lahir)
4. PPDB from madrasah: search by NSM of origin + NIK/NISN
5. PPDB from sekolah umum: search by NPSN of origin + NISN
6. Students currently active at another lembaga cannot be registered until processed out
7. After PPDB input, students appear as "Aktif Tanpa Rombel" — must be assigned to rombel

Source: https://www.slideshare.net/slideshow/03-materi-ppdb-siswa/251028970

---

## 15. Mutasi (Transfer) Rules

1. Transfer requires NPSN of destination school — must be valid
2. Transfer needs Kab/Kota approval
3. After approval, student appears in destination's active list
4. Origin school can print Surat Pindah
5. Mutasi request requires: Surat Keterangan Pindah/Keluar, or manual entry of: Jenis Lembaga Asal, Nama Lembaga, NSM, Tingkat, Nama Siswa, NISN, Alasan

Source: https://www.slideshare.net/slideshow/panduan-emis-40-menu-siswa-panduan-emis-40/267649560

---

## 16. Approval Workflow

```
Operator Lembaga (data entry)
  → Draft saved
    → Kepala Lembaga (approval)
      → Kemenag Kab/Kota (for identity changes: NIK, Nama, Tempat/Tgl Lahir, Jenis Kelamin)
        → Kemenag Provinsi (for certain operations)
          → Pusat (for NISN issuance, special cases)
```

**Changes that require Kemenag Kab/Kota approval:**
- NIK, Nama Lengkap, Tempat Lahir, Tanggal Lahir, Jenis Kelamin (for parent data)
- Student additions outside PPDB period
- Student data input at Kab/Kota level for cases where lembaga cannot

**Changes that only need Kamad approval:**
- Address, contact, occupation, education of parents
- Student personal data (hobi, cita-cita, tempat tinggal, etc.)

Source: https://www.slideshare.net/slideshow/panduan-emis-40-menu-siswa-panduan-emis-40/267649560

---

## 17. Data Pendukung (Supporting Documents)

Required for student data changes:
1. Kartu Keluarga (KK) Siswa
2. Raport Siswa
3. Surat Pindah (for mutasi)
4. Ijazah (for PPDB)
5. Surat Usulan Penambahan Data Siswa
6. Surat Pernyataan Kebenaran Data (signed by Kamad)
7. Rekapan Data Siswa yang diusulkan

Source: https://id.scribd.com/document/685344640/B-Format-Surat-Dukung-Dampingi-Demi-Data-3

---

## 18. Pemutakhiran Schedule (Data Update Cycle)

- Semester-based: Ganjil (Odd) and Genap (Even) per academic year
- Access period controlled centrally — "masa pendataan dibuka/ditutup"
- Outside update period: read-only (Lihat Detail only, no Ubah Data)
- Order of operations: (1) Kelulusan → (2) Kenaikan Kelas → (3) PPDB/Siswa Baru
- Deadline example: 31 December for semester ganjil completion
- Finalized with BAP (Berita Acara Pendataan) — requires Kamad signature (since TA 2025/2026)

Source: https://tirto.id/jadwal-cara-pemutakhiran-data-emis-kemenag-ta-2025-2026-hdXB

---

## 19. Data AKM/ANBK Export Fields

For ANBK (Asesmen Nasional Berbasis Komputer), EMIS provides:

| Field |
|-------|
| NAMA LENGKAP |
| NIK |
| NISN |
| Tempat Lahir |
| Tanggal Lahir |
| Agama |
| Jenis Kelamin |
| Alamat |
| Nama Ayah |
| Nama Ibu |
| Tingkat (Jenjang Madrasah) |
| Nama Rombel |
| Jurusan |

Source: https://www.edugoedu.com/panduan-pengisian-emis-4-0-madrasah/

---

## 20. User Roles & Access

| Role | Access Level |
|------|-------------|
| Operator/Pengelola Lembaga | Data entry, edit, upload, submit drafts |
| Kepala Lembaga/Madrasah | Approve changes, confirm data, sign BAP, download PDF reports |
| Kemenag Kab/Kota | Approve identity changes, add students outside PPDB, verify data |
| Kemenag Provinsi | Verify and approve escalated changes |
| Kemenag Pusat | System administration, NISN processing |
| Guru (GTK account) | View own data, limited edit of personal teaching info |

Source: https://idsch.id/emis-kementerian-agama/
