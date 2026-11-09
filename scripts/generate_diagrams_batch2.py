import json
import os
import subprocess

ARCHIFY_CLI = "C:/Users/vola/AppData/Local/hermes/skills/archify/bin/archify.mjs"
TMP_DIR = ".archify_tmp"
os.makedirs(TMP_DIR, exist_ok=True)

DIAGRAMS = [
    # --- Modul 05: Kesiswaan & Buku Induk ---
    {
        "module": "05-kesiswaan-buku-induk",
        "filename": "activity-pencatatan-buku-induk.html",
        "title": "Alur Pencatatan Buku Induk & Penomoran Stambuk EMIS",
        "lanes": [
            {"id": "staf", "label": "Staf Kesiswaan"},
            {"id": "ui", "label": "UI Buku Induk"},
            {"id": "be", "label": "Backend Students"},
            {"id": "db", "label": "Database PostgreSQL"}
        ],
        "phases": [
            {"id": "p1", "label": "Registrasi Siswa", "fromCol": 0, "toCol": 1, "variant": "default"},
            {"id": "p2", "label": "Format EMIS & Klapper", "fromCol": 2, "toCol": 3, "variant": "security"},
            {"id": "p3", "label": "Cetak Buku Induk", "fromCol": 4, "toCol": 5, "variant": "emphasis"}
        ],
        "mainPath": ["input_siswa", "validasi_emis", "generate_stambuk", "save_klapper_db", "render_lembar_pdf", "arsip_selesai"],
        "nodes": [
            {"id": "input_siswa", "lane": "staf", "col": 0, "type": "external", "label": "Input Data Siswa", "sublabel": "NISN, NIK, Wali, Alamat", "width": 150},
            {"id": "validasi_emis", "lane": "ui", "col": 1, "type": "frontend", "label": "Validasi Standar", "sublabel": "Cek kelengkapan EMIS 4.0", "width": 150},
            {"id": "generate_stambuk", "lane": "be", "col": 2, "type": "backend", "label": "Nomor Stambuk", "sublabel": "Stambuk abadi unik", "width": 150},
            {"id": "save_klapper_db", "lane": "db", "col": 3, "type": "database", "label": "Registrasi Klapper", "sublabel": "Indeks abjad buku klapper", "width": 150},
            {"id": "render_lembar_pdf", "lane": "be", "col": 4, "type": "cloud", "label": "Cetak Lembar Induk", "sublabel": "Format resmi Kemenag PDF", "width": 150},
            {"id": "arsip_selesai", "lane": "staf", "col": 5, "type": "frontend", "label": "Arsip Buku Induk", "sublabel": "Siswa aktif terdaftar", "width": 150}
        ],
        "edges": [
            {"id": "e1", "from": "input_siswa", "to": "validasi_emis", "label": "Kirim Form", "variant": "default"},
            {"id": "e2", "from": "validasi_emis", "to": "generate_stambuk", "label": "Validasi Lolos", "variant": "default"},
            {"id": "e3", "from": "generate_stambuk", "to": "save_klapper_db", "label": "Simpan Record", "variant": "security"},
            {"id": "e4", "from": "save_klapper_db", "to": "render_lembar_pdf", "label": "Generate PDF", "variant": "emphasis"},
            {"id": "e5", "from": "render_lembar_pdf", "to": "arsip_selesai", "label": "Tersimpan", "variant": "emphasis"}
        ]
    },
    {
        "module": "05-kesiswaan-buku-induk",
        "filename": "activity-penempatan-rombel.html",
        "title": "Alur Penempatan Siswa ke Rombel & Kenaikan Kelas",
        "lanes": [
            {"id": "staf", "label": "Waka Kesiswaan"},
            {"id": "ui", "label": "UI Rombel & Kelas"},
            {"id": "be", "label": "Backend Student Roster"},
            {"id": "db", "label": "Database PostgreSQL"}
        ],
        "phases": [
            {"id": "p1", "label": "Pilihan Siswa & Rombel", "fromCol": 0, "toCol": 1, "variant": "default"},
            {"id": "p2", "label": "Kapasitas & Alokasi", "fromCol": 2, "toCol": 3, "variant": "security"},
            {"id": "p3", "label": "Update Rombel", "fromCol": 4, "toCol": 5, "variant": "emphasis"}
        ],
        "mainPath": ["filter_unassigned", "pilih_target_kelas", "check_kuota_max", "assign_students_bulk", "save_roster_db", "update_view_done"],
        "nodes": [
            {"id": "filter_unassigned", "lane": "staf", "col": 0, "type": "external", "label": "Filter Siswa Aktif", "sublabel": "Belum memiliki rombel", "width": 150},
            {"id": "pilih_target_kelas", "lane": "ui", "col": 1, "type": "frontend", "label": "Pilih Kelas Tujuan", "sublabel": "Tingkat X, XI, atau XII", "width": 150},
            {"id": "check_kuota_max", "lane": "be", "col": 2, "type": "security", "label": "Cek Batas Kuota", "sublabel": "Maks 36 siswa per rombel", "width": 150},
            {"id": "assign_students_bulk", "lane": "be", "col": 3, "type": "backend", "label": "Alokasi Rombel", "sublabel": "Mutasi massal atomik", "width": 150},
            {"id": "save_roster_db", "lane": "db", "col": 4, "type": "database", "label": "Simpan ke Roster", "sublabel": "classroom_id terupdate", "width": 150},
            {"id": "update_view_done", "lane": "ui", "col": 5, "type": "frontend", "label": "Roster Terbentuk", "sublabel": "Daftar rombel siap", "width": 150}
        ],
        "edges": [
            {"id": "e1", "from": "filter_unassigned", "to": "pilih_target_kelas", "label": "Pilih Siswa", "variant": "default"},
            {"id": "e2", "from": "pilih_target_kelas", "to": "check_kuota_max", "label": "Submit Alokasi", "variant": "default"},
            {"id": "e3", "from": "check_kuota_max", "to": "assign_students_bulk", "label": "Kuota Aman", "variant": "security"},
            {"id": "e4", "from": "assign_students_bulk", "to": "save_roster_db", "label": "Commit Batch", "variant": "emphasis"},
            {"id": "e5", "from": "save_roster_db", "to": "update_view_done", "label": "Refetch Roster", "variant": "emphasis"}
        ]
    },

    # --- Modul 06: Presensi Siswa ---
    {
        "module": "06-presensi-siswa",
        "filename": "activity-presensi-harian.html",
        "title": "Alur Pencatatan Presensi Kelas Harian & Jam Mapel",
        "lanes": [
            {"id": "guru", "label": "Guru / Wali Kelas"},
            {"id": "ui", "label": "Mobile/Web Presensi"},
            {"id": "be", "label": "Backend Attendance"},
            {"id": "db", "label": "PostgreSQL & Log"}
        ],
        "phases": [
            {"id": "p1", "label": "Buka Roster Kelas", "fromCol": 0, "toCol": 1, "variant": "default"},
            {"id": "p2", "label": "Toggle Cepat", "fromCol": 2, "toCol": 3, "variant": "default"},
            {"id": "p3", "label": "Kunci Presensi", "fromCol": 4, "toCol": 5, "variant": "emphasis"}
        ],
        "mainPath": ["buka_sesi_absen", "load_default_hadir", "toggle_status_absen", "submit_batch_absen", "save_attendance_db", "ringkasan_kehadiran"],
        "nodes": [
            {"id": "buka_sesi_absen", "lane": "guru", "col": 0, "type": "external", "label": "Buka Sesi Presensi", "sublabel": "Pilih kelas & tanggal", "width": 150},
            {"id": "load_default_hadir", "lane": "ui", "col": 1, "type": "frontend", "label": "Load Default Hadir", "sublabel": "Semua siswa tercentang H", "width": 150},
            {"id": "toggle_status_absen", "lane": "guru", "col": 2, "type": "frontend", "label": "Ubah Status Pengecualian", "sublabel": "Klik tombol S, I, A, atau T", "width": 160},
            {"id": "submit_batch_absen", "lane": "ui", "col": 3, "type": "frontend", "label": "Kirim Rekap Harian", "sublabel": "Payload batch presensi", "width": 150},
            {"id": "save_attendance_db", "lane": "db", "col": 4, "type": "database", "label": "Simpan Presensi", "sublabel": "Upsert attendance records", "width": 150},
            {"id": "ringkasan_kehadiran", "lane": "ui", "col": 5, "type": "frontend", "label": "Tampil Rekap Kelas", "sublabel": "Persentase kehadiran hari ini", "width": 160}
        ],
        "edges": [
            {"id": "e1", "from": "buka_sesi_absen", "to": "load_default_hadir", "label": "Buka Lembar", "variant": "default"},
            {"id": "e2", "from": "load_default_hadir", "to": "toggle_status_absen", "label": "Cek Siswa", "variant": "default"},
            {"id": "e3", "from": "toggle_status_absen", "to": "submit_batch_absen", "label": "Klik Simpan", "variant": "default"},
            {"id": "e4", "from": "submit_batch_absen", "to": "save_attendance_db", "label": "Batch Query", "variant": "emphasis"},
            {"id": "e5", "from": "save_attendance_db", "to": "ringkasan_kehadiran", "label": "Update Realtime", "variant": "emphasis"}
        ]
    },
    {
        "module": "06-presensi-siswa",
        "filename": "activity-rekap-alert-presensi.html",
        "title": "Alur Deteksi Siswa Mangkir & Rekapitulasi Rapor",
        "lanes": [
            {"id": "cron", "label": "Background Scheduler"},
            {"id": "be", "label": "Backend Engine"},
            {"id": "bk", "label": "Guru BK & Wali Kelas"},
            {"id": "db", "label": "Database & Alert"}
        ],
        "phases": [
            {"id": "p1", "label": "Agregasi Kehadiran", "fromCol": 0, "toCol": 1, "variant": "default"},
            {"id": "p2", "label": "Evaluasi Ambang Batas", "fromCol": 2, "toCol": 3, "variant": "security"},
            {"id": "p3", "label": "Notifikasi & Rapor", "fromCol": 4, "toCol": 5, "variant": "emphasis"}
        ],
        "mainPath": ["daily_audit_trigger", "calc_unexcused_absent", "check_threshold_3x", "create_bk_alert", "notify_guru_bk", "sync_rapor_attendance"],
        "nodes": [
            {"id": "daily_audit_trigger", "lane": "cron", "col": 0, "type": "cloud", "label": "Audit Kehadiran", "sublabel": "Jadwal harian pukul 16:00", "width": 150},
            {"id": "calc_unexcused_absent", "lane": "be", "col": 1, "type": "backend", "label": "Hitung Akumulasi Alfa", "sublabel": "Filter ketidakhadiran alfa", "width": 150},
            {"id": "check_threshold_3x", "lane": "be", "col": 2, "type": "security", "label": "Evaluasi Ambang Batas", "sublabel": "Siswa alfa >= 3 hari", "width": 150},
            {"id": "create_bk_alert", "lane": "db", "col": 3, "type": "database", "label": "Buat Alert Warning", "sublabel": "Tabel discipline_alerts", "width": 150},
            {"id": "notify_guru_bk", "lane": "bk", "col": 4, "type": "frontend", "label": "Notifikasi Peringatan", "sublabel": "Terima tiket investigasi BK", "width": 150},
            {"id": "sync_rapor_attendance", "lane": "db", "col": 5, "type": "database", "label": "Rekapitulasi Rapor", "sublabel": "Agregasi S/I/A di RDM", "width": 150}
        ],
        "edges": [
            {"id": "e1", "from": "daily_audit_trigger", "to": "calc_unexcused_absent", "label": "Jalankan Job", "variant": "default"},
            {"id": "e2", "from": "calc_unexcused_absent", "to": "check_threshold_3x", "label": "Data Absen", "variant": "default"},
            {"id": "e3", "from": "check_threshold_3x", "to": "create_bk_alert", "label": "Alfa >= 3 Hari", "variant": "security"},
            {"id": "e4", "from": "create_bk_alert", "to": "notify_guru_bk", "label": "Kirim Peringatan", "variant": "emphasis"},
            {"id": "e5", "from": "notify_guru_bk", "to": "sync_rapor_attendance", "label": "Sinkron Rapor", "variant": "emphasis"}
        ]
    },

    # --- Modul 07: Tahfidz & Tasmi' ---
    {
        "module": "07-tahfidz-tasmi",
        "filename": "activity-setoran-harian.html",
        "title": "Alur Setoran Hafalan Harian Ziyadah & Muraja'ah",
        "lanes": [
            {"id": "santri", "label": "Santri / Siswa"},
            {"id": "musyrif", "label": "Ustadz / Musyrif"},
            {"id": "be", "label": "Backend Tahfidz"},
            {"id": "db", "label": "Database & Heatmap"}
        ],
        "phases": [
            {"id": "p1", "label": "Penyimakan Setoran", "fromCol": 0, "toCol": 1, "variant": "default"},
            {"id": "p2", "label": "Penilaian Tajwid & Mutu", "fromCol": 2, "toCol": 3, "variant": "security"},
            {"id": "p3", "label": "Progres 30 Juz", "fromCol": 4, "toCol": 5, "variant": "emphasis"}
        ],
        "mainPath": ["perdengarkan_ayat", "simak_bacaan", "eval_tahfidz_grade", "input_setoran_db", "update_heatmap_juz", "notif_ortu_hafalan"],
        "nodes": [
            {"id": "perdengarkan_ayat", "lane": "santri", "col": 0, "type": "external", "label": "Setor Hafalan Baru", "sublabel": "Ziyadah surah & ayat", "width": 150},
            {"id": "simak_bacaan", "lane": "musyrif", "col": 1, "type": "frontend", "label": "Simak & Koreksi", "sublabel": "Catat kekeliruan makhraj", "width": 150},
            {"id": "eval_tahfidz_grade", "lane": "musyrif", "col": 2, "type": "frontend", "label": "Beri Nilai Mutu", "sublabel": "Mumtaz / Jayyid / Maqbul", "width": 150},
            {"id": "input_setoran_db", "lane": "be", "col": 3, "type": "backend", "label": "Simpan Setoran", "sublabel": "Tabel tahfidz_submissions", "width": 150},
            {"id": "update_heatmap_juz", "lane": "db", "col": 4, "type": "database", "label": "Update Heatmap 30 Juz", "sublabel": "Kalkulasi persentase juz", "width": 150},
            {"id": "notif_ortu_hafalan", "lane": "santri", "col": 5, "type": "frontend", "label": "Tampil Rekap Santri", "sublabel": "Riwayat setoran & progres", "width": 150}
        ],
        "edges": [
            {"id": "e1", "from": "perdengarkan_ayat", "to": "simak_bacaan", "label": "Mulai Setor", "variant": "default"},
            {"id": "e2", "from": "simak_bacaan", "to": "eval_tahfidz_grade", "label": "Selesai Simak", "variant": "default"},
            {"id": "e3", "from": "eval_tahfidz_grade", "to": "input_setoran_db", "label": "Submit Hasil", "variant": "security"},
            {"id": "e4", "from": "input_setoran_db", "to": "update_heatmap_juz", "label": "Update Metrik", "variant": "emphasis"},
            {"id": "e5", "from": "update_heatmap_juz", "to": "notif_ortu_hafalan", "label": "Refetch Progres", "variant": "emphasis"}
        ]
    },
    {
        "module": "07-tahfidz-tasmi",
        "filename": "activity-ujian-tasmi.html",
        "title": "Alur Ujian Tasmi' Bil-Ghaib & Sertifikasi Syahadah",
        "lanes": [
            {"id": "santri", "label": "Santri Peserta"},
            {"id": "dewan", "label": "Dewan Penguji"},
            {"id": "be", "label": "Backend Tasmi Engine"},
            {"id": "cert", "label": "Syahadah PDF Generator"}
        ],
        "phases": [
            {"id": "p1", "label": "Pendaftaran Ujian", "fromCol": 0, "toCol": 1, "variant": "default"},
            {"id": "p2", "label": "Sidang Tasmi 1 Duduk", "fromCol": 2, "toCol": 3, "variant": "security"},
            {"id": "p3", "label": "Penerbitan Syahadah", "fromCol": 4, "toCol": 5, "variant": "emphasis"}
        ],
        "mainPath": ["daftar_tasmi_juz", "verifikasi_syarat", "sidang_tasmi_live", "hitung_skor_kelulusan", "generate_syahadah_pdf", "terima_sertifikat"],
        "nodes": [
            {"id": "daftar_tasmi_juz", "lane": "santri", "col": 0, "type": "external", "label": "Daftar Tasmi 1 Juz", "sublabel": "Pilih target juz ujian", "width": 150},
            {"id": "verifikasi_syarat", "lane": "dewan", "col": 1, "type": "frontend", "label": "Verifikasi Kelayakan", "sublabel": "Cek mutabaah & setoran", "width": 150},
            {"id": "sidang_tasmi_live", "lane": "dewan", "col": 2, "type": "frontend", "label": "Pengujian Sekali Duduk", "sublabel": "Maksimal 3x teguran", "width": 150},
            {"id": "hitung_skor_kelulusan", "lane": "be", "col": 3, "type": "backend", "label": "Kalkulasi Kelulusan", "sublabel": "Ambang kelulusan >= 80", "width": 150},
            {"id": "generate_syahadah_pdf", "lane": "cert", "col": 4, "type": "cloud", "label": "Render Syahadah QR", "sublabel": "Sertifikat resmi tanda tangan", "width": 150},
            {"id": "terima_sertifikat", "lane": "santri", "col": 5, "type": "frontend", "label": "Terima Syahadah", "sublabel": "Dokumen syahadah ber-QR", "width": 150}
        ],
        "edges": [
            {"id": "e1", "from": "daftar_tasmi_juz", "to": "verifikasi_syarat", "label": "Ajukan Ujian", "variant": "default"},
            {"id": "e2", "from": "verifikasi_syarat", "to": "sidang_tasmi_live", "label": "Syarat Lolos", "variant": "default"},
            {"id": "e3", "from": "sidang_tasmi_live", "to": "hitung_skor_kelulusan", "label": "Input Skor", "variant": "security"},
            {"id": "e4", "from": "hitung_skor_kelulusan", "to": "generate_syahadah_pdf", "label": "Dinyatakan Lulus", "variant": "emphasis"},
            {"id": "e5", "from": "generate_syahadah_pdf", "to": "terima_sertifikat", "label": "Unduh PDF", "variant": "emphasis"}
        ]
    },

    # --- Modul 08: Penilaian Akademik ---
    {
        "module": "08-penilaian-akademik",
        "filename": "activity-input-asesmen.html",
        "title": "Alur Input Nilai Formatif/Sumatif Grid Autosave",
        "lanes": [
            {"id": "guru", "label": "Guru Mata Pelajaran"},
            {"id": "ui", "label": "Grid Spreadsheet UI"},
            {"id": "be", "label": "Backend Grades Engine"},
            {"id": "db", "label": "PostgreSQL Grades"}
        ],
        "phases": [
            {"id": "p1", "label": "Spreadsheet Grid", "fromCol": 0, "toCol": 1, "variant": "default"},
            {"id": "p2", "label": "Debounce & Validasi", "fromCol": 2, "toCol": 3, "variant": "default"},
            {"id": "p3", "label": "Autosave Transaksi", "fromCol": 4, "toCol": 5, "variant": "emphasis"}
        ],
        "mainPath": ["buka_grid_nilai", "input_sel_nilai", "debounce_timer_500ms", "val_range_nilai", "upsert_batch_grades", "feedback_tersimpan"],
        "nodes": [
            {"id": "buka_grid_nilai", "lane": "guru", "col": 0, "type": "external", "label": "Pilih Rombel & Mapel", "sublabel": "Grid lembar penilaian", "width": 150},
            {"id": "input_sel_nilai", "lane": "ui", "col": 1, "type": "frontend", "label": "Ketik Skor Angka", "sublabel": "Navigasi panah keyboard", "width": 150},
            {"id": "debounce_timer_500ms", "lane": "ui", "col": 2, "type": "frontend", "label": "Debounce Autosave", "sublabel": "Buffer pengetikan 500ms", "width": 150},
            {"id": "val_range_nilai", "lane": "be", "col": 3, "type": "backend", "label": "Validasi Rentang", "sublabel": "Skor valid rentang 0-100", "width": 150},
            {"id": "upsert_batch_grades", "lane": "db", "col": 4, "type": "database", "label": "Simpan Nilai ke DB", "sublabel": "Tabel assessment_scores", "width": 150},
            {"id": "feedback_tersimpan", "lane": "ui", "col": 5, "type": "frontend", "label": "Indikator Tersimpan", "sublabel": "Centang hijau realtime", "width": 150}
        ],
        "edges": [
            {"id": "e1", "from": "buka_grid_nilai", "to": "input_sel_nilai", "label": "Buka Grid", "variant": "default"},
            {"id": "e2", "from": "input_sel_nilai", "to": "debounce_timer_500ms", "label": "Ketik Nilai", "variant": "default"},
            {"id": "e3", "from": "debounce_timer_500ms", "to": "val_range_nilai", "label": "Kirim Otomatis", "variant": "default"},
            {"id": "e4", "from": "val_range_nilai", "to": "upsert_batch_grades", "label": "Data Valid", "variant": "emphasis"},
            {"id": "e5", "from": "upsert_batch_grades", "to": "feedback_tersimpan", "label": "Status Sukses", "variant": "emphasis"}
        ]
    },
    {
        "module": "08-penilaian-akademik",
        "filename": "activity-kalkulasi-narasi.html",
        "title": "Alur Penghitungan Nilai Akhir & Narasi Capaian KMA 347",
        "lanes": [
            {"id": "guru", "label": "Guru Pengampu"},
            {"id": "be", "label": "Backend Grades Engine"},
            {"id": "nlp", "label": "Generator Deskripsi"},
            {"id": "db", "label": "PostgreSQL Final Grades"}
        ],
        "phases": [
            {"id": "p1", "label": "Pembobotan Formatif & SAS", "fromCol": 0, "toCol": 1, "variant": "default"},
            {"id": "p2", "label": "Evaluasi TP Maks & Min", "fromCol": 2, "toCol": 3, "variant": "security"},
            {"id": "p3", "label": "Generasi Deskripsi RDM", "fromCol": 4, "toCol": 5, "variant": "emphasis"}
        ],
        "mainPath": ["trigger_hitung_rapor", "kalkulasi_bobot_kma", "analisis_tp_ekstrem", "sintesis_narasi_capaian", "simpan_rapor_subject", "preview_narasi_guru"],
        "nodes": [
            {"id": "trigger_hitung_rapor", "lane": "guru", "col": 0, "type": "external", "label": "Hitung Nilai Rapor", "sublabel": "Finalisasi nilai semester", "width": 170},
            {"id": "kalkulasi_bobot_kma", "lane": "be", "col": 1, "type": "backend", "label": "Hitung Nilai Akhir", "sublabel": "Formula KMA 347/450", "width": 170},
            {"id": "analisis_tp_ekstrem", "lane": "be", "col": 2, "type": "backend", "label": "Pilah TP Maks & Min", "sublabel": "Capaian tertinggi & perlu bimbingan", "width": 170},
            {"id": "sintesis_narasi_capaian", "lane": "nlp", "col": 3, "type": "cloud", "label": "Generasi Narasi RDM", "sublabel": "Template resmi RDM Kemenag", "width": 170},
            {"id": "simpan_rapor_subject", "lane": "db", "col": 4, "type": "database", "label": "Kunci Nilai Akhir", "sublabel": "Tabel report_grades", "width": 170},
            {"id": "preview_narasi_guru", "lane": "guru", "col": 5, "type": "frontend", "label": "Review Narasi Rapor", "sublabel": "Guru dapat menyesuaikan redaksi", "width": 170}
        ],
        "edges": [
            {"id": "e1", "from": "trigger_hitung_rapor", "to": "kalkulasi_bobot_kma", "label": "Mulai Hitung", "variant": "default"},
            {"id": "e2", "from": "kalkulasi_bobot_kma", "to": "analisis_tp_ekstrem", "label": "Skor Terkumpul", "variant": "default"},
            {"id": "e3", "from": "analisis_tp_ekstrem", "to": "sintesis_narasi_capaian", "label": "Pola Capaian", "variant": "security"},
            {"id": "e4", "from": "sintesis_narasi_capaian", "to": "simpan_rapor_subject", "label": "Teks Terbentuk", "variant": "emphasis"},
            {"id": "e5", "from": "simpan_rapor_subject", "to": "preview_narasi_guru", "label": "Tampil di Layar", "variant": "emphasis"}
        ]
    },

    # --- Modul 09: Rapor RDM ---
    {
        "module": "09-rapor-rdm",
        "filename": "activity-verifikasi-legger.html",
        "title": "Alur Verifikasi Nilai Wali Kelas & Cetak Legger",
        "lanes": [
            {"id": "wali", "label": "Wali Kelas"},
            {"id": "ui", "label": "Dashboard Legger Nilai"},
            {"id": "be", "label": "Backend RDM Reports"},
            {"id": "db", "label": "Database Simma"}
        ],
        "phases": [
            {"id": "p1", "label": "Inspeksi Kelengkapan", "fromCol": 0, "toCol": 1, "variant": "default"},
            {"id": "p2", "label": "Audit Nilai Kosong", "fromCol": 2, "toCol": 3, "variant": "security"},
            {"id": "p3", "label": "Pengesahan Legger", "fromCol": 4, "toCol": 5, "variant": "emphasis"}
        ],
        "mainPath": ["buka_buku_legger", "tinjau_matriks_mapel", "audit_nilai_bolong", "input_catatan_wali", "kunci_legger_kelas", "export_legger_excel"],
        "nodes": [
            {"id": "buka_buku_legger", "lane": "wali", "col": 0, "type": "external", "label": "Buka Lembar Legger", "sublabel": "Pilih rombel bimbingan", "width": 150},
            {"id": "tinjau_matriks_mapel", "lane": "ui", "col": 1, "type": "frontend", "label": "Tinjau Matriks Nilai", "sublabel": "Seluruh mapel KMA", "width": 150},
            {"id": "audit_nilai_bolong", "lane": "be", "col": 2, "type": "security", "label": "Cek Kelengkapan Nilai", "sublabel": "Pastikan 0 nilai kosong", "width": 150},
            {"id": "input_catatan_wali", "lane": "wali", "col": 3, "type": "frontend", "label": "Input Catatan Wali", "sublabel": "Deskripsi motivasi siswa", "width": 150},
            {"id": "kunci_legger_kelas", "lane": "db", "col": 4, "type": "database", "label": "Kunci Nilai Rombel", "sublabel": "Status locked disahkan", "width": 150},
            {"id": "export_legger_excel", "lane": "ui", "col": 5, "type": "frontend", "label": "Unduh Dokumen Legger", "sublabel": "Format resmi Excel & PDF", "width": 150}
        ],
        "edges": [
            {"id": "e1", "from": "buka_buku_legger", "to": "tinjau_matriks_mapel", "label": "Buka Roster", "variant": "default"},
            {"id": "e2", "from": "tinjau_matriks_mapel", "to": "audit_nilai_bolong", "label": "Audit Nilai", "variant": "default"},
            {"id": "e3", "from": "audit_nilai_bolong", "to": "input_catatan_wali", "label": "Semua Mapel Masuk", "variant": "security"},
            {"id": "e4", "from": "input_catatan_wali", "to": "kunci_legger_kelas", "label": "Kunci Rombel", "variant": "emphasis"},
            {"id": "e5", "from": "kunci_legger_kelas", "to": "export_legger_excel", "label": "Cetak Legger", "variant": "emphasis"}
        ]
    },
    {
        "module": "09-rapor-rdm",
        "filename": "activity-cetak-rapor-rdm.html",
        "title": "Alur Generasi Rapor PDF Format RDM & QR Otentikasi",
        "lanes": [
            {"id": "kamad", "label": "Kepala Madrasah / Wali"},
            {"id": "be", "label": "Backend PDF Engine"},
            {"id": "sign", "label": "TTE Digital & QR Service"},
            {"id": "siswa", "label": "Siswa / Wali Murid"}
        ],
        "phases": [
            {"id": "p1", "label": "Permintaan Cetak Massal", "fromCol": 0, "toCol": 1, "variant": "default"},
            {"id": "p2", "label": "Kompilasi Standar RDM", "fromCol": 2, "toCol": 3, "variant": "security"},
            {"id": "p3", "label": "Sertifikasi QR & Distribusi", "fromCol": 4, "toCol": 5, "variant": "emphasis"}
        ],
        "mainPath": ["request_cetak_rapor", "compile_layout_rdm", "generate_qr_hash", "embed_tte_digital", "arsip_pdf_rapor", "unduh_rapor_resmi"],
        "nodes": [
            {"id": "request_cetak_rapor", "lane": "kamad", "col": 0, "type": "external", "label": "Pilih Cetak Rapor", "sublabel": "Satu rombel / per siswa", "width": 150},
            {"id": "compile_layout_rdm", "lane": "be", "col": 1, "type": "backend", "label": "Compile Layout RDM", "sublabel": "Kop, Nilai, Ekstra, Absensi", "width": 150},
            {"id": "generate_qr_hash", "lane": "sign", "col": 2, "type": "security", "label": "Generate SHA256 QR", "sublabel": "Hash validasi keaslian", "width": 150},
            {"id": "embed_tte_digital", "lane": "sign", "col": 3, "type": "security", "label": "Sematkan Tanda Tangan", "sublabel": "Tanda tangan Kamad & QR", "width": 150},
            {"id": "arsip_pdf_rapor", "lane": "be", "col": 4, "type": "cloud", "label": "Simpan PDF Rapor", "sublabel": "Penyimpanan arsip digital", "width": 150},
            {"id": "unduh_rapor_resmi", "lane": "siswa", "col": 5, "type": "frontend", "label": "Terima Rapor Digital", "sublabel": "PDF siap cetak / unduh", "width": 150}
        ],
        "edges": [
            {"id": "e1", "from": "request_cetak_rapor", "to": "compile_layout_rdm", "label": "Cetak Dokumen", "variant": "default"},
            {"id": "e2", "from": "compile_layout_rdm", "to": "generate_qr_hash", "label": "Render Layout", "variant": "default"},
            {"id": "e3", "from": "generate_qr_hash", "to": "embed_tte_digital", "label": "Sematkan QR", "variant": "security"},
            {"id": "e4", "from": "embed_tte_digital", "to": "arsip_pdf_rapor", "label": "PDF Lengkap", "variant": "emphasis"},
            {"id": "e5", "from": "arsip_pdf_rapor", "to": "unduh_rapor_resmi", "label": "Unduh Berkas", "variant": "emphasis"}
        ]
    },

    # --- Modul 10: P5RA ---
    {
        "module": "10-p5ra",
        "filename": "activity-perencanaan-projek.html",
        "title": "Alur Perencanaan Projek P5RA & Penetapan Rubrik",
        "lanes": [
            {"id": "koordinator", "label": "Koordinator Projek P5RA"},
            {"id": "ui", "label": "UI Perencanaan Projek"},
            {"id": "be", "label": "Backend P5RA Service"},
            {"id": "db", "label": "Database PostgreSQL"}
        ],
        "phases": [
            {"id": "p1", "label": "Inisiasi Tema Projek", "fromCol": 0, "toCol": 1, "variant": "default"},
            {"id": "p2", "label": "Dimensi & Nilai RA", "fromCol": 2, "toCol": 3, "variant": "default"},
            {"id": "p3", "label": "Penetapan Fasilitator", "fromCol": 4, "toCol": 5, "variant": "emphasis"}
        ],
        "mainPath": ["input_tema_projek", "pilih_dimensi_profil", "susun_target_rubrik", "plot_guru_fasilitator", "simpan_projek_db", "publikasi_projek_kelas"],
        "nodes": [
            {"id": "input_tema_projek", "lane": "koordinator", "col": 0, "type": "external", "label": "Tentukan Tema Projek", "sublabel": "Gaya Hidup, Kearifan, Kewirausahaan", "width": 160},
            {"id": "pilih_dimensi_profil", "lane": "ui", "col": 1, "type": "frontend", "label": "Pilih Dimensi & Nilai RA", "sublabel": "Tawassuth, Qudwah, Beriman", "width": 160},
            {"id": "susun_target_rubrik", "lane": "koordinator", "col": 2, "type": "frontend", "label": "Susun Rubrik Penilaian", "sublabel": "BB, MB, BSH, SAB", "width": 160},
            {"id": "plot_guru_fasilitator", "lane": "ui", "col": 3, "type": "frontend", "label": "Tugaskan Fasilitator", "sublabel": "Daftar guru pembimbing", "width": 160},
            {"id": "simpan_projek_db", "lane": "be", "col": 4, "type": "backend", "label": "Simpan Skema Projek", "sublabel": "Tabel p5ra_projects", "width": 160},
            {"id": "publikasi_projek_kelas", "lane": "db", "col": 5, "type": "database", "label": "Projek P5RA Aktif", "sublabel": "Terbuka bagi fasilitator", "width": 160}
        ],
        "edges": [
            {"id": "e1", "from": "input_tema_projek", "to": "pilih_dimensi_profil", "label": "Pilih Tema", "variant": "default"},
            {"id": "e2", "from": "pilih_dimensi_profil", "to": "susun_target_rubrik", "label": "Pilih Dimensi", "variant": "default"},
            {"id": "e3", "from": "susun_target_rubrik", "to": "plot_guru_fasilitator", "label": "Tetapkan Rubrik", "variant": "default"},
            {"id": "e4", "from": "plot_guru_fasilitator", "to": "simpan_projek_db", "label": "Kirim Rencana", "variant": "emphasis"},
            {"id": "e5", "from": "simpan_projek_db", "to": "publikasi_projek_kelas", "label": "Aktifkan Projek", "variant": "emphasis"}
        ]
    },
    {
        "module": "10-p5ra",
        "filename": "activity-asesmen-rapor-p5ra.html",
        "title": "Alur Asesmen 4 Predikat & Cetak Rapor P5RA",
        "lanes": [
            {"id": "fasilitator", "label": "Guru Fasilitator"},
            {"id": "ui", "label": "UI Asesmen Projek"},
            {"id": "be", "label": "Backend P5RA Engine"},
            {"id": "pdf", "label": "Rapor P5RA PDF"}
        ],
        "phases": [
            {"id": "p1", "label": "Observasi Kinerja", "fromCol": 0, "toCol": 1, "variant": "default"},
            {"id": "p2", "label": "Input Predikat 4 Level", "fromCol": 2, "toCol": 3, "variant": "security"},
            {"id": "p3", "label": "Cetak Lembar Rapor P5RA", "fromCol": 4, "toCol": 5, "variant": "emphasis"}
        ],
        "mainPath": ["observasi_kegiatan", "buka_lembar_asesmen", "pilih_predikat_subelemen", "tulis_catatan_proses", "kunci_asesmen_p5ra", "render_rapor_p5ra_pdf"],
        "nodes": [
            {"id": "observasi_kegiatan", "lane": "fasilitator", "col": 0, "type": "external", "label": "Observasi Projek Siswa", "sublabel": "Karya, presentasi, kolaborasi", "width": 160},
            {"id": "buka_lembar_asesmen", "lane": "ui", "col": 1, "type": "frontend", "label": "Buka Lembar Asesmen", "sublabel": "Daftar siswa & sub-elemen", "width": 160},
            {"id": "pilih_predikat_subelemen", "lane": "fasilitator", "col": 2, "type": "frontend", "label": "Pilih Predikat Capaian", "sublabel": "BB / MB / BSH / SAB", "width": 160},
            {"id": "tulis_catatan_proses", "lane": "fasilitator", "col": 3, "type": "frontend", "label": "Input Catatan Proses", "sublabel": "Deskripsi perkembangan sikap", "width": 160},
            {"id": "kunci_asesmen_p5ra", "lane": "be", "col": 4, "type": "backend", "label": "Kunci Data Asesmen", "sublabel": "Tabel p5ra_assessments", "width": 160},
            {"id": "render_rapor_p5ra_pdf", "lane": "pdf", "col": 5, "type": "cloud", "label": "Cetak Rapor P5RA", "sublabel": "Format Kurikulum Merdeka", "width": 160}
        ],
        "edges": [
            {"id": "e1", "from": "observasi_kegiatan", "to": "buka_lembar_asesmen", "label": "Mulai Asesmen", "variant": "default"},
            {"id": "e2", "from": "buka_lembar_asesmen", "to": "pilih_predikat_subelemen", "label": "Pilih Siswa", "variant": "default"},
            {"id": "e3", "from": "pilih_predikat_subelemen", "to": "tulis_catatan_proses", "label": "Set Predikat", "variant": "security"},
            {"id": "e4", "from": "tulis_catatan_proses", "to": "kunci_asesmen_p5ra", "label": "Kirim Nilai", "variant": "emphasis"},
            {"id": "e5", "from": "kunci_asesmen_p5ra", "to": "render_rapor_p5ra_pdf", "label": "Generate PDF", "variant": "emphasis"}
        ]
    },

    # --- Modul 11: Mutaba'ah Yaumiyah ---
    {
        "module": "11-mutabaah-yaumiyah",
        "filename": "activity-input-amalan.html",
        "title": "Alur Monitoring Pengisian Amalan Harian Santri",
        "lanes": [
            {"id": "santri", "label": "Santri Asrama"},
            {"id": "ui", "label": "Mobile Web Mutabaah"},
            {"id": "be", "label": "Backend Mutabaah"},
            {"id": "db", "label": "PostgreSQL Amalan"}
        ],
        "phases": [
            {"id": "p1", "label": "Pilih Tanggal Amalan", "fromCol": 0, "toCol": 1, "variant": "default"},
            {"id": "p2", "label": "Checklist Amalan Yaumiyah", "fromCol": 2, "toCol": 3, "variant": "default"},
            {"id": "p3", "label": "Kalkulasi Skor Ibadah", "fromCol": 4, "toCol": 5, "variant": "emphasis"}
        ],
        "mainPath": ["buka_buku_mutabaah", "checklist_shalat_jamaah", "input_tilawah_dhuha", "submit_amalan_harian", "hitung_skor_yaumiyah", "tampil_radar_chart"],
        "nodes": [
            {"id": "buka_buku_mutabaah", "lane": "santri", "col": 0, "type": "external", "label": "Buka Jurnal Amalan", "sublabel": "Aplikasi ponsel santri", "width": 150},
            {"id": "checklist_shalat_jamaah", "lane": "ui", "col": 1, "type": "frontend", "label": "Checklist Shalat 5 Waktu", "sublabel": "Status Berjamaah / Munfarid", "width": 160},
            {"id": "input_tilawah_dhuha", "lane": "ui", "col": 2, "type": "frontend", "label": "Input Tilawah & Sunnah", "sublabel": "Tahajud, Dhuha, Rawatib", "width": 150},
            {"id": "submit_amalan_harian", "lane": "be", "col": 3, "type": "backend", "label": "Simpan Catatan Harian", "sublabel": "Validasi tanggal hari ini", "width": 150},
            {"id": "hitung_skor_yaumiyah", "lane": "be", "col": 4, "type": "backend", "label": "Hitung Indeks Ibadah", "sublabel": "Skor akumulasi 0-100", "width": 150},
            {"id": "tampil_radar_chart", "lane": "db", "col": 5, "type": "database", "label": "Update Grafik Radar", "sublabel": "Tabel daily_mutabaah", "width": 150}
        ],
        "edges": [
            {"id": "e1", "from": "buka_buku_mutabaah", "to": "checklist_shalat_jamaah", "label": "Buka Form", "variant": "default"},
            {"id": "e2", "from": "checklist_shalat_jamaah", "to": "input_tilawah_dhuha", "label": "Shalat Terisi", "variant": "default"},
            {"id": "e3", "from": "input_tilawah_dhuha", "to": "submit_amalan_harian", "label": "Kirim Amalan", "variant": "default"},
            {"id": "e4", "from": "submit_amalan_harian", "to": "hitung_skor_yaumiyah", "label": "Kalkulasi Skor", "variant": "emphasis"},
            {"id": "e5", "from": "hitung_skor_yaumiyah", "to": "tampil_radar_chart", "label": "Simpan Skor", "variant": "emphasis"}
        ]
    },
    {
        "module": "11-mutabaah-yaumiyah",
        "filename": "activity-evaluasi-musyrif.html",
        "title": "Alur Evaluasi Kedisiplinan Ibadah oleh Musyrif",
        "lanes": [
            {"id": "musyrif", "label": "Musyrif Kamar / Asrama"},
            {"id": "ui", "label": "Dashboard Pengasuhan"},
            {"id": "be", "label": "Backend Engine"},
            {"id": "santri", "label": "Santri Binaan"}
        ],
        "phases": [
            {"id": "p1", "label": "Monitoring Kamar", "fromCol": 0, "toCol": 1, "variant": "default"},
            {"id": "p2", "label": "Pilah Santri Pasif", "fromCol": 2, "toCol": 3, "variant": "security"},
            {"id": "p3", "label": "Bimbingan & Ta'zir", "fromCol": 4, "toCol": 5, "variant": "emphasis"}
        ],
        "mainPath": ["pantau_kepatuhan_kamar", "filter_skor_rendah", "verifikasi_alasan_absen", "catat_bimbingan_ruhani", "terbitkan_surat_tazir", "evaluasi_perilaku_santri"],
        "nodes": [
            {"id": "pantau_kepatuhan_kamar", "lane": "musyrif", "col": 0, "type": "external", "label": "Pantau Dasbor Kamar", "sublabel": "Grafik kepatuhan amalan", "width": 150},
            {"id": "filter_skor_rendah", "lane": "ui", "col": 1, "type": "frontend", "label": "Pilah Skor Rendah", "sublabel": "Santri lalai shalat subuh", "width": 150},
            {"id": "verifikasi_alasan_absen", "lane": "musyrif", "col": 2, "type": "frontend", "label": "Klarifikasi Masalah", "sublabel": "Sakit / udzur syar'i", "width": 150},
            {"id": "catat_bimbingan_ruhani", "lane": "be", "col": 3, "type": "backend", "label": "Catat Lembar Konseling", "sublabel": "Tabel mutabaah_notes", "width": 150},
            {"id": "terbitkan_surat_tazir", "lane": "be", "col": 4, "type": "security", "label": "Tugas Ta'zir Edukatif", "sublabel": "Setoran hafalan tambahan", "width": 150},
            {"id": "evaluasi_perilaku_santri", "lane": "santri", "col": 5, "type": "frontend", "label": "Perbaikan Sikap Santri", "sublabel": "Pemulihan kedisiplinan", "width": 150}
        ],
        "edges": [
            {"id": "e1", "from": "pantau_kepatuhan_kamar", "to": "filter_skor_rendah", "label": "Buka Rekap", "variant": "default"},
            {"id": "e2", "from": "filter_skor_rendah", "to": "verifikasi_alasan_absen", "label": "Panggil Santri", "variant": "default"},
            {"id": "e3", "from": "verifikasi_alasan_absen", "to": "catat_bimbingan_ruhani", "label": "Hasil Diskusi", "variant": "security"},
            {"id": "e4", "from": "catat_bimbingan_ruhani", "to": "terbitkan_surat_tazir", "label": "Sanksi Edukatif", "variant": "emphasis"},
            {"id": "e5", "from": "terbitkan_surat_tazir", "to": "evaluasi_perilaku_santri", "label": "Jalankan Ta'zir", "variant": "emphasis"}
        ]
    }
]

def render_diagram(item):
    module = item["module"]
    filename = item["filename"]
    title = item["title"]
    out_dir = os.path.join("docs", "modules", module)
    os.makedirs(out_dir, exist_ok=True)
    out_html = os.path.join(out_dir, filename).replace("\\", "/")
    
    spec = {
        "schema_version": 2,
        "diagram_type": "workflow",
        "meta": {
            "title": title,
            "animation": "trace",
            "visual_preset": "signal-flow",
            "quality_profile": "standard",
            "output": out_html
        },
        "lanes": item["lanes"],
        "phases": item["phases"],
        "mainPath": item["mainPath"],
        "nodes": item["nodes"],
        "edges": item["edges"]
    }
    
    tmp_json = os.path.join(TMP_DIR, f"{module}_{filename}.json")
    with open(tmp_json, "w", encoding="utf-8") as f:
        json.dump(spec, f, indent=2)
        
    cmd = ["node", ARCHIFY_CLI, "render", "workflow", tmp_json, out_html]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"[FAIL] {module}/{filename}: {res.stderr}")
        return False
    else:
        print(f"[OK] {module}/{filename} -> {out_html}")
        return True

if __name__ == "__main__":
    success = 0
    for d in DIAGRAMS:
        if render_diagram(d):
            success += 1
    print(f"Rendered {success}/{len(DIAGRAMS)} diagrams in Batch 2.")
