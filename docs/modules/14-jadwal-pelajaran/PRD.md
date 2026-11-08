# PRD: 14. Jadwal Pelajaran Madrasah & Kepondokan

**Modul:** Jadwal Pelajaran (Integrasi Kurikulum Madrasah & Kepondokan)  
**Urutan:** Modul 14 — Penjadwalan & Alokasi Sumber Daya Pembelajaran  
**Status:** Approved  
**Versi:** 1.0  
**Domain:** Sistem Informasi Madrasah Aliyah (SIMMA)  
**Referensi:** Standar Jam Pembelajaran KMA 347/450 & Pola Waktu Pesantren, [docs/RESEARCH.md](../../RESEARCH.md)

---

## 1. Latar Belakang & Visi Modul

Penyusunan jadwal pelajaran di madrasah yang berbasis pondok pesantren memiliki kompleksitas ganda: menyelaraskan jam belajar formal madrasah (pagi hingga siang/sore) dengan jam kurikulum diniyah/kepondokan (ba'da Ashar, ba'da Maghrib, dan ba'da Subuh).

Kesalahan plotting manual kerap menyebabkan bentrok ganda: guru mengajar di dua kelas berbeda pada jam yang sama, atau pemakaian ruang laboratorium IPA/Komputer yang bertabrakan. Modul ini menyediakan penyusunan jadwal visual dengan deteksi bentrok seketika (*instant conflict detection*) dan multi-tampilan cetak (per kelas, per guru, per ruangan).

---

## 2. Aktor & Matriks Hak Akses

| Peran | Kelola Jam & Slot Waktu | Susun Matriks Jadwal | Lihat Jadwal Mengajar | Cetak Jadwal Resmi |
|---|---|---|---|---|
| `waka_kurikulum` | Full Setup | RW (Penyusun Utama) | Full Madrasah | RW (Semua Kelas & Guru) |
| `guru_mapel` | R | R (Tampilan Master) | R (Jadwal Pribadi) | Cetak Jadwal Sendiri |
| `wali_kelas` | R | R | R (Jadwal Kelasnya) | Cetak Jadwal Kelas |
| `siswa` / Wali Murid | R (Portal) | - | R (Jadwal Rombelnya) | Download PDF |

---

## 3. Fitur Utama & Kebutuhan Fungsional

| Kode | Nama Fitur | Deskripsi & Aturan Bisnis |
|---|---|---|
| **F-JAD-01** | Konfigurasi Slot Jam Pelajaran | Pembagian slot jam per hari (Senin s.d. Sabtu) dengan fleksibilitas alokasi sesi: Sesi Formal Madrasah (misal: 07.00 - 14.30) dan Sesi Diniyah Kepondokan (misal: 16.00 - 17.30 dan 19.30 - 21.00), termasuk jeda sholat dzuhur berjama'ah dan istirahat. |
| **F-JAD-02** | Deteksi Bentrok Otomatis (Anti-Collision Engine) | Sistem seketika memblokir atau memberi peringatan visual merah jika: (a) Guru dijadwalkan di >1 kelas pada jam yang sama, (b) Ruangan khusus (Lab/Aula) terpakai ganda, (c) Rombel memiliki >1 mapel pada slot jam yang sama. |
| **F-JAD-03** | Pembatasan Beban Harian Guru (Max JTM) | Validasi agar guru tidak dijadwalkan melebihi batas beban mengajar harian yang wajar (misal: maksimal 6 JTM berturut-turut tanpa jeda). |
| **F-JAD-04** | Tampilan Multi-Dimensi | Antarmuka jadwal fleksibel: (1) View per Rombel Kelas, (2) View per Guru Pengajar, (3) View per Ruangan/Laboratorium, dan (4) Master Matriks Seluruh Madrasah. |
| **F-JAD-05** | Integrasi Real-Time dengan Modul Presensi | Data jadwal aktif otomatis menjadi dasar form presensi harian guru: saat guru membuka SIMMA, sistem langsung menyodorkan kelas dan mapel yang sedang berlangsung saat itu. |
| **F-JAD-06** | Cetak Dokumen Jadwal Resmi (PDF) | Generator PDF tata letak bersih ber-kop madrasah: jadwal ukuran saku per guru, lembar jadwal dinding per ruang kelas, dan master jadwal madrasah (format A3/A4 landscape). |

---

## 4. Aturan Validasi & Integritas Penjadwalan

1. **Integritas Waktu:** Jam mulai tidak boleh lebih besar atau sama dengan jam selesai dalam satu slot jam pelajaran.
2. **Kunci Jadwal Publik:** Jadwal semester yang telah dipublikasikan oleh Waka Kurikulum terkunci dari perubahan acak. Revisi jadwal wajib membuat versi revisi baru dengan notifikasi otomatis ke guru terdampak.

---

## 5. Kriteria Penerimaan (Acceptance Criteria)

- **GIVEN** Waka Kurikulum mencoba menyeret (drag-and-drop) mapel Matematika untuk Ustadz Fauzi ke Kelas X-B pada Hari Selasa Jam Ke-3.
- **WHEN** Ustadz Fauzi ternyata sudah terplot mengajar di Kelas XI-IPA pada jam dan hari yang sama.
- **THEN** Sistem menampilkan dialog pencegahan bentrok berwarna merah dengan teks "Bentrok: Ustadz Fauzi sudah dijadwalkan di Kelas XI-IPA pada Selasa Jam Ke-3", dan plotting dibatalkan secara aman.
