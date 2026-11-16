import json
import os
import subprocess
import sys

ARCHIFY_CLI = "C:/Users/vola/AppData/Local/hermes/skills/archify/bin/archify.mjs"
TMP_DIR = ".archify_tmp"
os.makedirs(TMP_DIR, exist_ok=True)

# List of all activity diagrams to render across the 19 modules
DIAGRAMS = [
    # --- Modul 01: Auth & RBAC ---
    {
        "module": "01-auth-rbac",
        "filename": "activity-login-auth.html",
        "title": "Alur Login & Penerbitan Token JWT",
        "lanes": [
            {"id": "user", "label": "Pengguna (Klien)"},
            {"id": "fe", "label": "Frontend (React UI)"},
            {"id": "be", "label": "Backend (Fastify Auth)"},
            {"id": "db", "label": "Database (PostgreSQL)"}
        ],
        "phases": [
            {"id": "p1", "label": "Kredensial & Validasi", "fromCol": 0, "toCol": 1, "variant": "default"},
            {"id": "p2", "label": "Verifikasi Keamanan", "fromCol": 2, "toCol": 3, "variant": "security"},
            {"id": "p3", "label": "Sesi & Navigasi", "fromCol": 4, "toCol": 5, "variant": "emphasis"}
        ],
        "mainPath": ["input_form", "submit_api", "check_lockout", "query_user", "verify_pwd", "issue_jwt", "save_session", "render_dashboard"],
        "nodes": [
            {"id": "input_form", "lane": "user", "col": 0, "type": "frontend", "label": "Input Kredensial", "sublabel": "Username & Password", "width": 140},
            {"id": "submit_api", "lane": "fe", "col": 1, "type": "frontend", "label": "Validasi Zod & Kirim", "sublabel": "POST /api/v1/auth/login", "width": 140},
            {"id": "check_lockout", "lane": "be", "col": 2, "type": "security", "label": "Cek Brute Force", "sublabel": "Maks 5x percobaan gagal", "width": 140},
            {"id": "query_user", "lane": "db", "col": 2, "type": "database", "label": "Query User & Role", "sublabel": "Tabel users & roles", "width": 140},
            {"id": "verify_pwd", "lane": "be", "col": 3, "type": "backend", "label": "Verifikasi Hash", "sublabel": "bcrypt 10 rounds", "width": 140},
            {"id": "issue_jwt", "lane": "be", "col": 4, "type": "security", "label": "Generate JWT Token", "sublabel": "Access & Refresh Token", "width": 140},
            {"id": "save_session", "lane": "fe", "col": 4, "type": "frontend", "label": "Simpan Zustand State", "sublabel": "In-memory token", "width": 140},
            {"id": "render_dashboard", "lane": "user", "col": 5, "type": "frontend", "label": "Akses Dashboard", "sublabel": "Redirect sesuai role", "width": 140}
        ],
        "edges": [
            {"id": "e1", "from": "input_form", "to": "submit_api", "label": "Submit Form", "variant": "default"},
            {"id": "e2", "from": "submit_api", "to": "check_lockout", "label": "Request Login", "variant": "default"},
            {"id": "e3", "from": "check_lockout", "to": "query_user", "label": "Cari Akun", "variant": "default"},
            {"id": "e4", "from": "query_user", "to": "verify_pwd", "label": "Data Ditemukan", "variant": "default"},
            {"id": "e5", "from": "verify_pwd", "to": "issue_jwt", "label": "Password Cocok", "variant": "emphasis"},
            {"id": "e6", "from": "issue_jwt", "to": "save_session", "label": "Kirim Token", "variant": "emphasis"},
            {"id": "e7", "from": "save_session", "to": "render_dashboard", "label": "Navigasi", "variant": "emphasis"}
        ]
    },
    {
        "module": "01-auth-rbac",
        "filename": "activity-rbac-guard.html",
        "title": "Alur Pemeriksaan RBAC Guard & Audit Trail",
        "lanes": [
            {"id": "client", "label": "Klien / Frontend"},
            {"id": "mw", "label": "Middleware (Fastify)"},
            {"id": "ctrl", "label": "Controller & Service"},
            {"id": "db", "label": "Database (Audit Log)"}
        ],
        "phases": [
            {"id": "p1", "label": "Request Header", "fromCol": 0, "toCol": 1, "variant": "default"},
            {"id": "p2", "label": "Evaluasi Hak Akses", "fromCol": 2, "toCol": 3, "variant": "security"},
            {"id": "p3", "label": "Audit & Eksekusi", "fromCol": 4, "toCol": 5, "variant": "emphasis"}
        ],
        "mainPath": ["send_req", "extract_jwt", "verify_sig", "eval_role", "log_audit_db", "exec_service", "return_data"],
        "nodes": [
            {"id": "send_req", "lane": "client", "col": 0, "type": "frontend", "label": "Request Terproteksi", "sublabel": "Bearer Header", "width": 140},
            {"id": "extract_jwt", "lane": "mw", "col": 1, "type": "security", "label": "Ekstraksi Token", "sublabel": "Authorization Bearer", "width": 140},
            {"id": "verify_sig", "lane": "mw", "col": 2, "type": "security", "label": "Verifikasi Signature", "sublabel": "jose jwtVerify()", "width": 140},
            {"id": "eval_role", "lane": "mw", "col": 3, "type": "security", "label": "Cek Role Permission", "sublabel": "requireRole(allowed)", "width": 140},
            {"id": "log_audit_db", "lane": "db", "col": 4, "type": "database", "label": "Catat Audit Trail", "sublabel": "User, Action, Resource", "width": 140},
            {"id": "exec_service", "lane": "ctrl", "col": 4, "type": "backend", "label": "Eksekusi Service", "sublabel": "Business Logic Handler", "width": 140},
            {"id": "return_data", "lane": "client", "col": 5, "type": "frontend", "label": "Terima Respons", "sublabel": "HTTP 200 JSON", "width": 140}
        ],
        "edges": [
            {"id": "e1", "from": "send_req", "to": "extract_jwt", "label": "Kirim HTTP", "variant": "default"},
            {"id": "e2", "from": "extract_jwt", "to": "verify_sig", "label": "Token String", "variant": "default"},
            {"id": "e3", "from": "verify_sig", "to": "eval_role", "label": "Payload Valid", "variant": "security"},
            {"id": "e4", "from": "eval_role", "to": "log_audit_db", "label": "Izin Diberikan", "variant": "emphasis"},
            {"id": "e5", "from": "log_audit_db", "to": "exec_service", "label": "Lanjut Eksekusi", "variant": "default"},
            {"id": "e6", "from": "exec_service", "to": "return_data", "label": "Kirim Data", "variant": "emphasis"}
        ]
    },

    # --- Modul 02: Master Setup ---
    {
        "module": "02-master-setup",
        "filename": "activity-siklus-akademik.html",
        "title": "Alur Aktivasi Tahun Ajaran & Semester Aktif",
        "lanes": [
            {"id": "admin", "label": "Administrator"},
            {"id": "ui", "label": "Frontend Settings"},
            {"id": "be", "label": "Backend Setup Service"},
            {"id": "db", "label": "Database Transaction"}
        ],
        "phases": [
            {"id": "p1", "label": "Seleksi Siklus", "fromCol": 0, "toCol": 1, "variant": "default"},
            {"id": "p2", "label": "Konfirmasi & Validasi", "fromCol": 2, "toCol": 3, "variant": "security"},
            {"id": "p3", "label": "Aktivasi Atomik", "fromCol": 4, "toCol": 5, "variant": "emphasis"}
        ],
        "mainPath": ["select_ta", "open_dialog", "submit_active", "val_transaction", "exec_sql_tx", "notify_success"],
        "nodes": [
            {"id": "select_ta", "lane": "admin", "col": 0, "type": "external", "label": "Pilih Tahun Ajaran", "sublabel": "2026/2027 Ganjil", "width": 140},
            {"id": "open_dialog", "lane": "ui", "col": 1, "type": "frontend", "label": "Tampil Konfirmasi", "sublabel": "Peringatan dampak sistem", "width": 160},
            {"id": "submit_active", "lane": "ui", "col": 2, "type": "frontend", "label": "Kirim Permintaan", "sublabel": "POST /academic-years/:id/set-active", "width": 160},
            {"id": "val_transaction", "lane": "be", "col": 3, "type": "backend", "label": "Buka Transaksi DB", "sublabel": "drizzle db.transaction()", "width": 160},
            {"id": "exec_sql_tx", "lane": "db", "col": 4, "type": "database", "label": "Update Status DB", "sublabel": "SET is_active=false, target=true", "width": 160},
            {"id": "notify_success", "lane": "admin", "col": 5, "type": "frontend", "label": "Status Aktif", "sublabel": "Indikator badge hijau aktif", "width": 160}
        ],
        "edges": [
            {"id": "e1", "from": "select_ta", "to": "open_dialog", "label": "Klik Aktifkan", "variant": "default"},
            {"id": "e2", "from": "open_dialog", "to": "submit_active", "label": "Konfirmasi Ya", "variant": "emphasis"},
            {"id": "e3", "from": "submit_active", "to": "val_transaction", "label": "Panggil API", "variant": "default"},
            {"id": "e4", "from": "val_transaction", "to": "exec_sql_tx", "label": "Jalankan Query", "variant": "security"},
            {"id": "e5", "from": "exec_sql_tx", "to": "notify_success", "label": "Komit Transaksi", "variant": "emphasis"}
        ]
    },
    {
        "module": "02-master-setup",
        "filename": "activity-alokasi-rombel-guru.html",
        "title": "Alur Alokasi Rombel & Penugasan Guru Mapel",
        "lanes": [
            {"id": "admin", "label": "Admin Madrasah"},
            {"id": "ui", "label": "Frontend Master UI"},
            {"id": "be", "label": "Backend Setup Module"},
            {"id": "db", "label": "PostgreSQL Setup Tables"}
        ],
        "phases": [
            {"id": "p1", "label": "Input Rombel", "fromCol": 0, "toCol": 1, "variant": "default"},
            {"id": "p2", "label": "Validasi Guru", "fromCol": 2, "toCol": 3, "variant": "default"},
            {"id": "p3", "label": "Pemetaan Mapel", "fromCol": 4, "toCol": 5, "variant": "emphasis"}
        ],
        "mainPath": ["input_rombel", "validate_form", "check_duplicate", "save_rombel", "assign_subject", "commit_mapping"],
        "nodes": [
            {"id": "input_rombel", "lane": "admin", "col": 0, "type": "external", "label": "Input Data Rombel", "sublabel": "Nama, Tingkat, Wali Kelas", "width": 140},
            {"id": "validate_form", "lane": "ui", "col": 1, "type": "frontend", "label": "Validasi Frontend", "sublabel": "Zod CreateClassroomSchema", "width": 140},
            {"id": "check_duplicate", "lane": "be", "col": 2, "type": "backend", "label": "Cek Keunikan Rombel", "sublabel": "Nama rombel unik per TA", "width": 140},
            {"id": "save_rombel", "lane": "db", "col": 3, "type": "database", "label": "Simpan Kelas Baru", "sublabel": "Tabel classrooms", "width": 140},
            {"id": "assign_subject", "lane": "be", "col": 4, "type": "backend", "label": "Petakan Guru Mapel", "sublabel": "Katalog 44 mapel KMA", "width": 140},
            {"id": "commit_mapping", "lane": "db", "col": 5, "type": "database", "label": "Tersimpan di Sistem", "sublabel": "Tabel subject_teachers", "width": 140}
        ],
        "edges": [
            {"id": "e1", "from": "input_rombel", "to": "validate_form", "label": "Submit Kelas", "variant": "default"},
            {"id": "e2", "from": "validate_form", "to": "check_duplicate", "label": "Kirim Data", "variant": "default"},
            {"id": "e3", "from": "check_duplicate", "to": "save_rombel", "label": "Rombel Unik", "variant": "default"},
            {"id": "e4", "from": "save_rombel", "to": "assign_subject", "label": "Kelas Terbentuk", "variant": "emphasis"},
            {"id": "e5", "from": "assign_subject", "to": "commit_mapping", "label": "Simpan Relasi", "variant": "emphasis"}
        ]
    },

    # --- Modul 03: Tata Usaha & Persuratan ---
    {
        "module": "03-tata-usaha-persuratan",
        "filename": "activity-surat-masuk-disposisi.html",
        "title": "Alur Agenda Surat Masuk & Disposisi Kamad",
        "lanes": [
            {"id": "staf_tu", "label": "Staf Tata Usaha"},
            {"id": "kamad", "label": "Kepala Madrasah"},
            {"id": "be", "label": "Backend Persuratan"},
            {"id": "db", "label": "Database & Storage"}
        ],
        "phases": [
            {"id": "p1", "label": "Penerimaan & Upload", "fromCol": 0, "toCol": 1, "variant": "default"},
            {"id": "p2", "label": "Pencatatan Agenda", "fromCol": 2, "toCol": 3, "variant": "default"},
            {"id": "p3", "label": "Disposisi & Instruksi", "fromCol": 4, "toCol": 5, "variant": "emphasis"}
        ],
        "mainPath": ["terima_surat", "upload_scan", "save_agenda", "notif_kamad", "review_kamad", "save_disposisi"],
        "nodes": [
            {"id": "terima_surat", "lane": "staf_tu", "col": 0, "type": "external", "label": "Penerimaan Surat", "sublabel": "Fisik / Eksternal", "width": 140},
            {"id": "upload_scan", "lane": "staf_tu", "col": 1, "type": "frontend", "label": "Input Data & Scan PDF", "sublabel": "No Surat, Asal, Perihal", "width": 140},
            {"id": "save_agenda", "lane": "be", "col": 2, "type": "backend", "label": "Auto-Nomor Agenda", "sublabel": "Pola KMA 44/2010", "width": 140},
            {"id": "notif_kamad", "lane": "db", "col": 3, "type": "database", "label": "Simpan Arsip Digital", "sublabel": "Tabel incoming_letters", "width": 140},
            {"id": "review_kamad", "lane": "kamad", "col": 4, "type": "security", "label": "Review Surat Masuk", "sublabel": "Lembar disposisi digital", "width": 140},
            {"id": "save_disposisi", "lane": "db", "col": 5, "type": "database", "label": "Terbitkan Disposisi", "sublabel": "Tabel letter_dispositions", "width": 140}
        ],
        "edges": [
            {"id": "e1", "from": "terima_surat", "to": "upload_scan", "label": "Scan Dokumen", "variant": "default"},
            {"id": "e2", "from": "upload_scan", "to": "save_agenda", "label": "Simpan Agenda", "variant": "default"},
            {"id": "e3", "from": "save_agenda", "to": "notif_kamad", "label": "Simpan Berkas", "variant": "default"},
            {"id": "e4", "from": "notif_kamad", "to": "review_kamad", "label": "Notifikasi Kamad", "variant": "emphasis"},
            {"id": "e5", "from": "review_kamad", "to": "save_disposisi", "label": "Kirim Instruksi", "variant": "emphasis"}
        ]
    },
    {
        "module": "03-tata-usaha-persuratan",
        "filename": "activity-surat-keluar-penomoran.html",
        "title": "Alur Registrasi Surat Keluar & Naskah Dinas QR",
        "lanes": [
            {"id": "staf_tu", "label": "Staf Tata Usaha"},
            {"id": "be", "label": "Backend Fastify Letters"},
            {"id": "pdf", "label": "PDF & QR Generator"},
            {"id": "db", "label": "Database PostgreSQL"}
        ],
        "phases": [
            {"id": "p1", "label": "Draft Naskah Dinas", "fromCol": 0, "toCol": 1, "variant": "default"},
            {"id": "p2", "label": "Penomoran Otomatis", "fromCol": 2, "toCol": 3, "variant": "security"},
            {"id": "p3", "label": "Cetak & TTE QR", "fromCol": 4, "toCol": 5, "variant": "emphasis"}
        ],
        "mainPath": ["draft_surat", "select_template", "generate_no_surat", "save_outgoing_db", "render_pdf_qr", "download_surat"],
        "nodes": [
            {"id": "draft_surat", "lane": "staf_tu", "col": 0, "type": "external", "label": "Pilih Jenis Surat", "sublabel": "SKAS, Tugas, Rekomendasi", "width": 140},
            {"id": "select_template", "lane": "staf_tu", "col": 1, "type": "frontend", "label": "Input Data Penerima", "sublabel": "Siswa / Guru / Tujuan", "width": 140},
            {"id": "generate_no_surat", "lane": "be", "col": 2, "type": "backend", "label": "Generator Nomor PMA", "sublabel": "[Agenda]/Ma.12/.../2026", "width": 140},
            {"id": "save_outgoing_db", "lane": "db", "col": 3, "type": "database", "label": "Kunci Nomor Agenda", "sublabel": "Tabel outgoing_letters", "width": 140},
            {"id": "render_pdf_qr", "lane": "pdf", "col": 4, "type": "cloud", "label": "Render PDF + QR Code", "sublabel": "Kop Resmi & SHA256 QR", "width": 140},
            {"id": "download_surat", "lane": "staf_tu", "col": 5, "type": "frontend", "label": "Cetak / Unduh PDF", "sublabel": "Surat resmi siap kirim", "width": 140}
        ],
        "edges": [
            {"id": "e1", "from": "draft_surat", "to": "select_template", "label": "Pilih Format", "variant": "default"},
            {"id": "e2", "from": "select_template", "to": "generate_no_surat", "label": "Ajukan Nomor", "variant": "default"},
            {"id": "e3", "from": "generate_no_surat", "to": "save_outgoing_db", "label": "Simpan Record", "variant": "security"},
            {"id": "e4", "from": "save_outgoing_db", "to": "render_pdf_qr", "label": "Compile Naskah", "variant": "emphasis"},
            {"id": "e5", "from": "render_pdf_qr", "to": "download_surat", "label": "File Siap", "variant": "emphasis"}
        ]
    },

    # --- Modul 04: PPDB Madrasah ---
    {
        "module": "04-ppdb-madrasah",
        "filename": "activity-registrasi-pendaftaran.html",
        "title": "Alur Registrasi Calon Siswa & Unggah Dokumen PPDB",
        "lanes": [
            {"id": "calon", "label": "Calon Siswa / Wali"},
            {"id": "portal", "label": "Portal PPDB Online"},
            {"id": "be", "label": "Backend PPDB Service"},
            {"id": "storage", "label": "File Storage & Database"}
        ],
        "phases": [
            {"id": "p1", "label": "Registrasi Akun", "fromCol": 0, "toCol": 1, "variant": "default"},
            {"id": "p2", "label": "Pengisian Formulir", "fromCol": 2, "toCol": 3, "variant": "default"},
            {"id": "p3", "label": "Upload Dokumen", "fromCol": 4, "toCol": 5, "variant": "emphasis"}
        ],
        "mainPath": ["register_akun", "verify_nisn_nik", "pilih_jalur", "fill_data_ortu", "upload_berkas_req", "cetak_kartu_reg"],
        "nodes": [
            {"id": "register_akun", "lane": "calon", "col": 0, "type": "external", "label": "Daftar Akun Calon", "sublabel": "NISN, NIK, Password", "width": 140},
            {"id": "verify_nisn_nik", "lane": "be", "col": 1, "type": "security", "label": "Cek Keunikan NISN", "sublabel": "Role calon_siswa JWT", "width": 140},
            {"id": "pilih_jalur", "lane": "portal", "col": 2, "type": "frontend", "label": "Pilih Jalur Seleksi", "sublabel": "Reguler / Tahfidz / Afirmasi", "width": 140},
            {"id": "fill_data_ortu", "lane": "portal", "col": 3, "type": "frontend", "label": "Lengkapi Biodata", "sublabel": "Asal Madrasah & Ortu", "width": 140},
            {"id": "upload_berkas_req", "lane": "be", "col": 4, "type": "backend", "label": "Upload Dokumen", "sublabel": "Multipart simpan UUID", "width": 160},
            {"id": "cetak_kartu_reg", "lane": "storage", "col": 5, "type": "database", "label": "Terbit Nomor Registrasi", "sublabel": "Kartu Bukti Pendaftaran", "width": 170}
        ],
        "edges": [
            {"id": "e1", "from": "register_akun", "to": "verify_nisn_nik", "label": "Buat Akun", "variant": "default"},
            {"id": "e2", "from": "verify_nisn_nik", "to": "pilih_jalur", "label": "Akun Aktif", "variant": "emphasis"},
            {"id": "e3", "from": "pilih_jalur", "to": "fill_data_ortu", "label": "Isi Form", "variant": "default"},
            {"id": "e4", "from": "fill_data_ortu", "to": "upload_berkas_req", "label": "Kirim Berkas", "variant": "default"},
            {"id": "e5", "from": "upload_berkas_req", "to": "cetak_kartu_reg", "label": "Finalisasi", "variant": "emphasis"}
        ]
    },
    {
        "module": "04-ppdb-madrasah",
        "filename": "activity-verifikasi-seleksi.html",
        "title": "Alur Verifikasi Berkas & Seleksi Panitia PPDB",
        "lanes": [
            {"id": "panitia", "label": "Panitia Seleksi TU"},
            {"id": "ui", "label": "Dashboard Panitia"},
            {"id": "be", "label": "Backend PPDB Logic"},
            {"id": "db", "label": "Database PPDB Applicants"}
        ],
        "phases": [
            {"id": "p1", "label": "Audit Berkas", "fromCol": 0, "toCol": 1, "variant": "default"},
            {"id": "p2", "label": "Validasi Status", "fromCol": 2, "toCol": 3, "variant": "security"},
            {"id": "p3", "label": "Pengumuman", "fromCol": 4, "toCol": 5, "variant": "emphasis"}
        ],
        "mainPath": ["open_applicant", "preview_dokumen", "verify_item_status", "input_skor_tes", "commit_kelulusan", "notify_portal"],
        "nodes": [
            {"id": "open_applicant", "lane": "panitia", "col": 0, "type": "external", "label": "Pilih Pendaftar", "sublabel": "Daftar pendaftar masuk", "width": 150},
            {"id": "preview_dokumen", "lane": "ui", "col": 1, "type": "frontend", "label": "Preview Berkas", "sublabel": "KK, Akta, Rapor, Piagam", "width": 150},
            {"id": "verify_item_status", "lane": "be", "col": 2, "type": "backend", "label": "Verifikasi Berkas", "sublabel": "Status valid / invalid", "width": 150},
            {"id": "input_skor_tes", "lane": "panitia", "col": 3, "type": "frontend", "label": "Input Skor Tes", "sublabel": "Tes Baca Quran & Potensi", "width": 150},
            {"id": "commit_kelulusan", "lane": "db", "col": 4, "type": "database", "label": "Tetapkan Status", "sublabel": "Diterima / Cadangan / Ditolak", "width": 150},
            {"id": "notify_portal", "lane": "ui", "col": 5, "type": "frontend", "label": "Umumkan Hasil", "sublabel": "Tampil di portal calon", "width": 150}
        ],
        "edges": [
            {"id": "e1", "from": "open_applicant", "to": "preview_dokumen", "label": "Buka Berkas", "variant": "default"},
            {"id": "e2", "from": "preview_dokumen", "to": "verify_item_status", "label": "Cek Dokumen", "variant": "default"},
            {"id": "e3", "from": "verify_item_status", "to": "input_skor_tes", "label": "Berkas Lengkap", "variant": "security"},
            {"id": "e4", "from": "input_skor_tes", "to": "commit_kelulusan", "label": "Kalkulasi Skor", "variant": "emphasis"},
            {"id": "e5", "from": "commit_kelulusan", "to": "notify_portal", "label": "Publikasikan", "variant": "emphasis"}
        ]
    },
    {
        "module": "04-ppdb-madrasah",
        "filename": "activity-mutasi-buku-induk.html",
        "title": "Alur Mutasi Atomik Siswa Diterima ke Buku Induk",
        "lanes": [
            {"id": "panitia", "label": "Panitia / Staf TU"},
            {"id": "be", "label": "Backend Service"},
            {"id": "tx", "label": "Database Transaction"},
            {"id": "buku_induk", "label": "Tabel Students & Users"}
        ],
        "phases": [
            {"id": "p1", "label": "Verifikasi Akhir", "fromCol": 0, "toCol": 1, "variant": "default"},
            {"id": "p2", "label": "Migrasi Atomik", "fromCol": 2, "toCol": 3, "variant": "security"},
            {"id": "p3", "label": "Akun Siswa Resmi", "fromCol": 4, "toCol": 5, "variant": "emphasis"}
        ],
        "mainPath": ["trigger_enroll", "check_accepted", "start_tx", "insert_student_record", "create_user_student", "update_ppdb_enrolled"],
        "nodes": [
            {"id": "trigger_enroll", "lane": "panitia", "col": 0, "type": "external", "label": "Trigger Enroll Siswa", "sublabel": "Tombol Masukkan Buku Induk", "width": 140},
            {"id": "check_accepted", "lane": "be", "col": 1, "type": "security", "label": "Validasi Status Lulus", "sublabel": "Pastikan status diterima", "width": 140},
            {"id": "start_tx", "lane": "tx", "col": 2, "type": "backend", "label": "Mulai DB Transaction", "sublabel": "Atomic Drizzle Transaction", "width": 140},
            {"id": "insert_student_record", "lane": "buku_induk", "col": 3, "type": "database", "label": "Insert Data Siswa", "sublabel": "Tabel students EMIS format", "width": 140},
            {"id": "create_user_student", "lane": "buku_induk", "col": 4, "type": "database", "label": "Buat Akun Siswa Baru", "sublabel": "Role siswa di tabel users", "width": 140},
            {"id": "update_ppdb_enrolled", "lane": "tx", "col": 5, "type": "backend", "label": "Update PPDB Enrolled", "sublabel": "is_enrolled=true tersimpan", "width": 140}
        ],
        "edges": [
            {"id": "e1", "from": "trigger_enroll", "to": "check_accepted", "label": "Konfirmasi Enroll", "variant": "default"},
            {"id": "e2", "from": "check_accepted", "to": "start_tx", "label": "Validasi Lolos", "variant": "security"},
            {"id": "e3", "from": "start_tx", "to": "insert_student_record", "label": "Migrasi Data", "variant": "emphasis"},
            {"id": "e4", "from": "insert_student_record", "to": "create_user_student", "label": "Generate Akun", "variant": "emphasis"},
            {"id": "e5", "from": "create_user_student", "to": "update_ppdb_enrolled", "label": "Selesai Enroll", "variant": "emphasis"}
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
    print(f"Rendered {success}/{len(DIAGRAMS)} test diagrams.")
