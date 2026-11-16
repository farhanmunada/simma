import json
import os
import subprocess

ARCHIFY_CLI = "C:/Users/vola/AppData/Local/hermes/skills/archify/bin/archify.mjs"
TMP_DIR = ".archify_tmp"
os.makedirs(TMP_DIR, exist_ok=True)


def diagram(module, filename, title, lanes, phases, path, labels):
    nodes = []
    for index, item in enumerate(labels):
        node_id, lane, kind, label, sublabel = item
        nodes.append({"id": node_id, "lane": lane, "col": index, "type": kind, "label": label, "sublabel": sublabel, "width": 165})
    edges = []
    for index in range(len(labels) - 1):
        edges.append({"id": f"e{index + 1}", "from": labels[index][0], "to": labels[index + 1][0], "label": "Lanjutkan", "variant": "emphasis" if index >= len(labels) - 2 else "default"})
    return {"module": module, "filename": filename, "spec": {
        "schema_version": 2,
        "diagram_type": "workflow",
        "meta": {"title": title, "animation": "trace", "visual_preset": "signal-flow", "quality_profile": "standard"},
        "lanes": lanes, "phases": phases, "mainPath": path, "nodes": nodes, "edges": edges
    }}


LANE4 = lambda a, b, c, d: [{"id": "actor", "label": a}, {"id": "ui", "label": b}, {"id": "be", "label": c}, {"id": "db", "label": d}]
PHASES = lambda a, b, c: [
    {"id": "p1", "label": a, "fromCol": 0, "toCol": 1, "variant": "default"},
    {"id": "p2", "label": b, "fromCol": 2, "toCol": 3, "variant": "security"},
    {"id": "p3", "label": c, "fromCol": 4, "toCol": 5, "variant": "emphasis"},
]

DIAGRAMS = [
    diagram("12-keuangan-spp", "activity-generate-tagihan.html", "Alur Generate Tagihan Bulanan SPP", LANE4("Bendahara", "UI Billing", "Backend Finance", "PostgreSQL Finance"), PHASES("Master Tarif", "Generate Massal", "Tagihan Aktif"), ["tarif", "filter_siswa", "generate_batch", "validasi_status", "save_invoices", "publish_billing"], [
        ("tarif", "actor", "external", "Tetapkan Pos & Tarif", "SPP, asrama, komite"), ("filter_siswa", "ui", "frontend", "Pilih Siswa Aktif", "Kecualikan lulus/mutasi"), ("generate_batch", "be", "backend", "Generate Tagihan Massal", "Awal periode billing"), ("validasi_status", "be", "security", "Cek Duplikasi Tagihan", "Satu siswa satu pos/periode"), ("save_invoices", "db", "database", "Simpan Invoice", "Status belum lunas"), ("publish_billing", "ui", "frontend", "Tagihan Terbit", "Terlihat wali murid")]),
    diagram("12-keuangan-spp", "activity-pembayaran-kwitansi.html", "Alur Pembayaran Kasir & Cetak Kwitansi", LANE4("Kasir TU", "UI Kasir", "Backend Payment", "Database Kas"), PHASES("Pencarian Siswa", "Pembayaran", "Kwitansi Resmi"), ["search_student", "select_bills", "validate_amount", "commit_payment", "generate_receipt", "print_receipt"], [
        ("search_student", "actor", "external", "Cari Siswa", "NIS, NISN, atau nama"), ("select_bills", "ui", "frontend", "Pilih Multi-Pos", "Bayar penuh atau parsial"), ("validate_amount", "be", "security", "Validasi Nominal", "Cegah bayar melebihi sisa"), ("commit_payment", "db", "database", "Commit Transaksi", "Nomor kwitansi unik"), ("generate_receipt", "be", "cloud", "Generate Kwitansi PDF", "QR keabsahan transaksi"), ("print_receipt", "ui", "frontend", "Cetak / Unduh", "Bukti bayar wali")]),
    diagram("12-keuangan-spp", "activity-dispensasi-tunggakan.html", "Alur Tunggakan & Approval Dispensasi Ujian", LANE4("Bendahara / Kamad", "UI Tunggakan", "Backend Approval", "Database Audit"), PHASES("Deteksi Tunggakan", "Permohonan", "Approval Kamad"), ["detect_arrears", "create_warning", "submit_dispensation", "check_authority", "save_approval", "issue_exam_pass"], [
        ("detect_arrears", "actor", "external", "Deteksi Tunggakan", "Kelas dan periode"), ("create_warning", "ui", "frontend", "Terbitkan Peringatan", "Rincian tunggakan"), ("submit_dispensation", "actor", "frontend", "Ajukan Dispensasi", "Permohonan wali murid"), ("check_authority", "be", "security", "Cek Hak Approval", "Khusus Kepala Madrasah"), ("save_approval", "db", "database", "Simpan Persetujuan", "Audit alasan & durasi"), ("issue_exam_pass", "ui", "frontend", "Kartu Ujian Aktif", "Dispensasi berlaku")]),

    diagram("13-kepegawaian-gtk", "activity-registrasi-gtk.html", "Alur Registrasi Data Pokok GTK & Dokumen", LANE4("Admin Kepegawaian", "UI Profil GTK", "Backend GTK", "Database GTK"), PHASES("Input Biodata", "Validasi Identitas", "Arsip Dokumen"), ["input_gtk", "upload_documents", "validate_identity", "check_duplicate", "save_gtk_profile", "archive_gtk"], [
        ("input_gtk", "actor", "external", "Input Profil GTK", "NIP, NIK, NUPTK, status"), ("upload_documents", "ui", "frontend", "Unggah Berkas", "Ijazah, SK, sertifikat"), ("validate_identity", "be", "backend", "Validasi Data", "Format dan field wajib"), ("check_duplicate", "be", "security", "Cek Identitas Ganda", "NIK/NUPTK unik"), ("save_gtk_profile", "db", "database", "Simpan Profil GTK", "Data pokok terstruktur"), ("archive_gtk", "ui", "frontend", "Brankas GTK Aktif", "Akses sesuai role")]),
    diagram("13-kepegawaian-gtk", "activity-validasi-jtm.html", "Alur Pemeriksaan Beban Mengajar 24 JTM", LANE4("Waka Kurikulum", "UI JTM Checker", "Backend Jadwal", "Database GTK"), PHASES("Ambil Jadwal", "Hitung JTM", "Approval Beban"), ["open_teacher", "load_schedule", "calculate_jtm", "check_minimum", "save_validation", "show_status"], [
        ("open_teacher", "actor", "external", "Buka Profil Guru", "Periode aktif"), ("load_schedule", "ui", "frontend", "Ambil Jadwal Mengajar", "Rombel dan mapel"), ("calculate_jtm", "be", "backend", "Hitung Total JTM", "Agregasi jam mingguan"), ("check_minimum", "be", "security", "Cek Minimum 24 JTM", "Indikator memenuhi/belum"), ("save_validation", "db", "database", "Simpan Snapshot", "Riwayat beban semester"), ("show_status", "ui", "frontend", "Tampil Status", "Siap review Kamad")]),
    diagram("13-kepegawaian-gtk", "activity-ekspor-gtk.html", "Alur Ekspor Data GTK ke EMIS/Simpatika", LANE4("Operator TU", "UI Export", "Backend Exporter", "File Archive"), PHASES("Pilih Dataset", "Validasi Template", "Arsip Ekspor"), ["select_gtk_scope", "map_template", "validate_required", "generate_csv", "save_export_log", "download_file"], [
        ("select_gtk_scope", "actor", "external", "Pilih Periode GTK", "Semester aktif"), ("map_template", "ui", "frontend", "Pemetaan Kolom", "Template EMIS GTK"), ("validate_required", "be", "security", "Validasi Field Wajib", "Tolak data belum lengkap"), ("generate_csv", "be", "cloud", "Generate CSV/XLSX", "Format siap unggah"), ("save_export_log", "db", "database", "Arsip Log Ekspor", "Hash dan waktu ekspor"), ("download_file", "ui", "frontend", "Unduh Berkas", "Dokumen pelaporan")]),

    diagram("14-jadwal-pelajaran", "activity-konfigurasi-slot.html", "Alur Konfigurasi Slot Waktu Formal & Diniyah", LANE4("Waka Kurikulum", "UI Time Slots", "Backend Schedule", "Database Setup"), PHASES("Hari & Sesi", "Validasi Waktu", "Publikasi Slot"), ["define_days", "define_periods", "validate_time_range", "check_overlap", "save_slots", "publish_slots"], [
        ("define_days", "actor", "external", "Pilih Hari Aktif", "Senin sampai Sabtu"), ("define_periods", "ui", "frontend", "Susun Slot Jam", "Formal dan kepondokan"), ("validate_time_range", "be", "security", "Validasi Jam", "Mulai < selesai"), ("check_overlap", "be", "security", "Cek Overlap Slot", "Tidak ada waktu tumpang tindih"), ("save_slots", "db", "database", "Simpan Slot", "Periode akademik"), ("publish_slots", "ui", "frontend", "Slot Dipublikasikan", "Siap plotting jadwal")]),
    diagram("14-jadwal-pelajaran", "activity-plotting-anti-bentrok.html", "Alur Plotting Jadwal & Deteksi Bentrok", LANE4("Waka Kurikulum", "UI Drag Drop", "Conflict Engine", "Database Jadwal"), PHASES("Plot Mapel", "Deteksi Bentrok", "Simpan Versi"), ["drag_subject", "select_teacher_room", "detect_conflict", "show_conflict", "save_schedule_version", "notify_teacher"], [
        ("drag_subject", "actor", "external", "Drag Mapel ke Slot", "Rombel dan hari"), ("select_teacher_room", "ui", "frontend", "Pilih Guru & Ruang", "Resource jadwal"), ("detect_conflict", "be", "security", "Deteksi Bentrok", "Guru, rombel, ruang"), ("show_conflict", "ui", "frontend", "Tampilkan Pencegahan", "Plot dibatalkan bila bentrok"), ("save_schedule_version", "db", "database", "Simpan Versi Jadwal", "Draft atau published"), ("notify_teacher", "ui", "frontend", "Notifikasi Guru", "Perubahan jadwal")]),
    diagram("14-jadwal-pelajaran", "activity-cetak-jadwal.html", "Alur Cetak Jadwal Per Kelas, Guru, dan Ruang", LANE4("Waka / Guru", "UI Schedule View", "Backend PDF", "Archive"), PHASES("Pilih Perspektif", "Render Dokumen", "Distribusi"), ["select_view", "load_published", "compile_layout", "generate_pdf", "archive_pdf", "download_schedule"], [
        ("select_view", "actor", "external", "Pilih Tampilan", "Kelas, guru, atau ruang"), ("load_published", "ui", "frontend", "Ambil Jadwal Aktif", "Semester published"), ("compile_layout", "be", "backend", "Susun Layout", "A4/A3 landscape"), ("generate_pdf", "be", "cloud", "Generate PDF", "Kop madrasah"), ("archive_pdf", "db", "database", "Arsip Dokumen", "Versi jadwal"), ("download_schedule", "ui", "frontend", "Unduh Jadwal", "Siap cetak")]),

    diagram("15-mutasi-siswa", "activity-mutasi-masuk.html", "Alur Mutasi Masuk Siswa Pindahan", LANE4("Admin TU", "UI Mutasi", "Backend Students", "Database Buku Induk"), PHASES("Input Berkas Asal", "Validasi NISN", "Penerimaan"), ["input_transfer_in", "upload_origin_letter", "validate_nisn", "select_target_class", "create_student_record", "issue_acceptance"], [
        ("input_transfer_in", "actor", "external", "Input Siswa Pindahan", "Sekolah asal dan data diri"), ("upload_origin_letter", "ui", "frontend", "Unggah Surat Asal", "Nomor surat pindah"), ("validate_nisn", "be", "security", "Validasi NISN", "Cegah data nasional ganda"), ("select_target_class", "ui", "frontend", "Pilih Kelas Tujuan", "Rombel aktif"), ("create_student_record", "db", "database", "Buat Record Buku Induk", "Stambuk baru"), ("issue_acceptance", "ui", "frontend", "SK Penerimaan", "Siap ditandatangani Kamad")]),
    diagram("15-mutasi-siswa", "activity-mutasi-keluar.html", "Alur Clearance & Mutasi Keluar Siswa", LANE4("Admin TU", "UI Clearance", "Approval Engine", "Database Histori"), PHASES("Permohonan Keluar", "Bebas Tanggungan", "SK Mutasi"), ["submit_transfer_out", "load_clearance", "check_three_domains", "block_or_approve", "update_student_status", "generate_transfer_letter"], [
        ("submit_transfer_out", "actor", "external", "Ajukan Mutasi Keluar", "Tujuan dan alasan"), ("load_clearance", "ui", "frontend", "Muat Checklist Clearance", "Perpus, keuangan, tatib"), ("check_three_domains", "be", "security", "Validasi 3 Tanggungan", "Semua wajib bebas"), ("block_or_approve", "ui", "security", "Tahan atau Lanjutkan", "Tombol cetak terkunci"), ("update_student_status", "db", "database", "Status Mutasi Keluar", "Hentikan tagihan berikutnya"), ("generate_transfer_letter", "ui", "cloud", "Terbitkan Surat Mutasi", "Barcode/QR verifikasi")]),
    diagram("15-mutasi-siswa", "activity-kelulusan-massal.html", "Alur Kelulusan Massal Kelas XII", LANE4("Waka Kesiswaan", "UI Kelulusan", "Backend Graduation", "Database Histori"), PHASES("Seleksi Kelas XII", "Finalisasi", "SKL & Arsip"), ["select_grade_twelve", "review_academic_status", "input_graduation_numbers", "lock_history", "update_graduate_status", "generate_skl"], [
        ("select_grade_twelve", "actor", "external", "Pilih Siswa Kelas XII", "Tahun ajaran aktif"), ("review_academic_status", "ui", "frontend", "Review Status Akademik", "Nilai dan clearance"), ("input_graduation_numbers", "actor", "frontend", "Input Nomor Ijazah", "Nomor seri Kemenag"), ("lock_history", "be", "security", "Kunci Histori Akademik", "Cegah perubahan pasca lulus"), ("update_graduate_status", "db", "database", "Status Lulus", "Buku induk terupdate"), ("generate_skl", "ui", "cloud", "Generate SKL", "Dokumen siswa")]),

    diagram("16-tatib-kedisiplinan", "activity-input-pelanggaran.html", "Alur Input Pelanggaran & Eskalasi Poin", LANE4("Guru / Musyrif", "UI Tatib", "Backend Discipline", "Database Kasus"), PHASES("Laporan Kejadian", "Kalkulasi Poin", "Eskalasi"), ["report_incident", "select_violation", "calculate_points", "check_threshold", "save_case", "create_escalation"], [
        ("report_incident", "actor", "external", "Laporkan Kejadian", "Tanggal, lokasi, saksi"), ("select_violation", "ui", "frontend", "Pilih Master Pelanggaran", "Bobot poin"), ("calculate_points", "be", "backend", "Hitung Akumulasi", "Pelanggaran dan apresiasi"), ("check_threshold", "be", "security", "Cek Ambang Eskalasi", "25/50/75/100 poin"), ("save_case", "db", "database", "Simpan Kasus", "Bukti dan kronologi"), ("create_escalation", "ui", "frontend", "Terapkan SP/Konseling", "Tindakan otomatis")]),
    diagram("16-tatib-kedisiplinan", "activity-konseling-surat-ortu.html", "Alur Konseling BK & Surat Panggilan Orang Tua", LANE4("Guru BK", "UI Konseling", "Backend Privacy", "Database Rahasia BK"), PHASES("Buka Kasus", "Catatan Privat", "Panggilan Ortu"), ["open_case", "schedule_session", "write_private_note", "check_severity", "save_confidential_note", "generate_parent_letter"], [
        ("open_case", "actor", "external", "Buka Riwayat Kasus", "Hak akses BK"), ("schedule_session", "ui", "frontend", "Jadwalkan Konseling", "Waktu dan ruang BK"), ("write_private_note", "actor", "frontend", "Tulis Catatan Privat", "Rekam pembinaan"), ("check_severity", "be", "security", "Cek Tingkat Kasus", "Approval sanksi berat"), ("save_confidential_note", "db", "database", "Simpan Catatan Rahasia", "Hanya BK/Kamad"), ("generate_parent_letter", "ui", "cloud", "Cetak Surat Panggilan", "Naskah dinas")]),

    diagram("17-ekstrakurikuler", "activity-daftar-ekskul.html", "Alur Pendaftaran Ekskul Siswa & Validasi Kuota", LANE4("Siswa", "Portal Ekskul", "Backend Enrollment", "Database Ekskul"), PHASES("Katalog Ekskul", "Pilih Kegiatan", "Validasi Kuota"), ["browse_catalog", "select_activities", "check_selection_limit", "check_quota", "save_membership", "show_enrollment"], [
        ("browse_catalog", "actor", "external", "Buka Katalog Ekskul", "Kategori dan jadwal"), ("select_activities", "ui", "frontend", "Pilih Ekskul", "1 wajib + maksimal 2 pilihan"), ("check_selection_limit", "be", "security", "Validasi Batas Pilihan", "Aturan semester"), ("check_quota", "be", "security", "Cek Kuota Anggota", "Tolak jika penuh"), ("save_membership", "db", "database", "Simpan Keanggotaan", "Periode aktif"), ("show_enrollment", "ui", "frontend", "Kartu Ekskul Aktif", "Jadwal latihan")]),
    diagram("17-ekstrakurikuler", "activity-nilai-ekskul-rdm.html", "Alur Presensi, Nilai Ekskul & Sinkron Rapor", LANE4("Pembina Ekskul", "UI Penilaian", "Backend RDM", "Database Rapor"), PHASES("Presensi Latihan", "Predikat", "Integrasi Rapor"), ["open_roster", "mark_attendance", "input_predicate", "validate_description", "save_extracurricular_grade", "sync_rdm_report"], [
        ("open_roster", "actor", "external", "Buka Daftar Binaan", "Siswa ekskul"), ("mark_attendance", "ui", "frontend", "Catat Presensi Latihan", "Sesi mingguan"), ("input_predicate", "actor", "frontend", "Input Predikat", "A/B/C"), ("validate_description", "be", "security", "Validasi Narasi", "Deskripsi capaian wajib"), ("save_extracurricular_grade", "db", "database", "Simpan Nilai Ekskul", "Semester aktif"), ("sync_rdm_report", "ui", "frontend", "Tampil di Rapor RDM", "Tanpa salin-tempel")]),

    diagram("18-emis-export", "activity-audit-readiness.html", "Alur Audit Kesiapan Data EMIS 4.0", LANE4("Operator EMIS", "UI Audit", "Backend Validator", "Database Master"), PHASES("Pindai Data", "Temukan Anomali", "Perbaikan"), ["start_audit", "scan_students_gtk", "validate_emis_rules", "list_anomalies", "save_audit_log", "open_correction_form"], [
        ("start_audit", "actor", "external", "Jalankan Audit", "Semester cut-off"), ("scan_students_gtk", "ui", "frontend", "Pindai Siswa & GTK", "Dataset aktif"), ("validate_emis_rules", "be", "security", "Validasi Aturan EMIS", "NIK, NISN, ibu kandung"), ("list_anomalies", "ui", "frontend", "Tampilkan Anomali", "Daftar data bermasalah"), ("save_audit_log", "db", "database", "Simpan Hasil Audit", "Readiness meter"), ("open_correction_form", "ui", "frontend", "Buka Form Perbaikan", "Kembali ke data sumber")]),
    diagram("18-emis-export", "activity-ekspor-bap.html", "Alur Ekspor Data EMIS & Berita Acara", LANE4("Operator EMIS", "UI Export", "Backend Exporter", "File Archive"), PHASES("Pilih Dataset", "Generate Template", "BAP"), ["select_dataset", "validate_readiness", "map_emis_columns", "generate_export", "archive_export", "sign_bap"], [
        ("select_dataset", "actor", "external", "Pilih Dataset", "Siswa, GTK, rombel"), ("validate_readiness", "ui", "frontend", "Cek Readiness 100%", "Tombol ekspor bersyarat"), ("map_emis_columns", "be", "backend", "Map Template Resmi", "Header EMIS 4.0"), ("generate_export", "be", "cloud", "Generate CSV/XLSX", "Berkas siap unggah"), ("archive_export", "db", "database", "Arsip Versi Ekspor", "Log semester"), ("sign_bap", "ui", "frontend", "Cetak Draft BAP", "Approval Kepala Madrasah")]),

    diagram("19-sarana-prasarana", "activity-registrasi-aset-qr.html", "Alur Registrasi Aset & Cetak Label QR", LANE4("Staf Sarpras", "UI Inventaris", "Backend Asset", "Database Aset"), PHASES("Input Barang", "Nomor Aset", "Label QR"), ["input_asset", "select_location", "generate_asset_code", "validate_unique_code", "save_asset", "print_qr_label"], [
        ("input_asset", "actor", "external", "Input Detail Barang", "Merek, kategori, tahun"), ("select_location", "ui", "frontend", "Pilih Ruangan", "Gedung dan penanggung jawab"), ("generate_asset_code", "be", "backend", "Generate Kode Aset", "Nomor inventaris unik"), ("validate_unique_code", "be", "security", "Cek Kode Unik", "Tidak boleh duplikat"), ("save_asset", "db", "database", "Simpan Inventaris", "Status kondisi awal"), ("print_qr_label", "ui", "cloud", "Cetak Stiker QR", "Siap ditempel pada barang")]),
    diagram("19-sarana-prasarana", "activity-peminjaman-aset.html", "Alur Peminjaman & Pengembalian Fasilitas", LANE4("Guru / Peminjam", "UI Peminjaman", "Backend Asset", "Database Sirkulasi"), PHASES("Scan Aset", "Approval", "Pengembalian"), ["scan_asset_qr", "submit_loan", "check_asset_status", "approve_loan", "save_loan_log", "confirm_return"], [
        ("scan_asset_qr", "actor", "external", "Scan QR Aset", "Baca detail dan status"), ("submit_loan", "ui", "frontend", "Ajukan Peminjaman", "Tujuan dan waktu kembali"), ("check_asset_status", "be", "security", "Cek Status Aset", "Harus tersedia"), ("approve_loan", "actor", "frontend", "Approval Sarpras", "Waka Sarpras"), ("save_loan_log", "db", "database", "Simpan Sirkulasi", "Status dipinjam"), ("confirm_return", "ui", "frontend", "Konfirmasi Kembali", "Cek kondisi fisik")]),
    diagram("19-sarana-prasarana", "activity-tiket-pemeliharaan.html", "Alur Tiket Kerusakan & Pemeliharaan Aset", LANE4("Guru / Staf", "UI Helpdesk", "Backend Maintenance", "Database Tiket"), PHASES("Laporan Kerusakan", "Disposisi", "Penyelesaian"), ["report_damage", "upload_evidence", "classify_ticket", "assign_technician", "update_repair_status", "close_ticket"], [
        ("report_damage", "actor", "external", "Laporkan Kerusakan", "AC, kursi, lampu, alat"), ("upload_evidence", "ui", "frontend", "Unggah Foto Bukti", "Lokasi dan aset"), ("classify_ticket", "be", "backend", "Klasifikasi Tiket", "Prioritas dan estimasi biaya"), ("assign_technician", "actor", "frontend", "Disposisi Perbaikan", "Staf atau vendor"), ("update_repair_status", "db", "database", "Update Status", "Diajukan / perbaikan"), ("close_ticket", "ui", "frontend", "Tiket Selesai", "Biaya dan bukti selesai")]),
]


def render(item):
    out_dir = os.path.join("docs", "modules", item["module"])
    os.makedirs(out_dir, exist_ok=True)
    output = os.path.join(out_dir, item["filename"]).replace("\\", "/")
    spec = item["spec"]
    spec["meta"]["output"] = output
    temp = os.path.join(TMP_DIR, f"batch3-{item['module']}-{item['filename']}.json")
    with open(temp, "w", encoding="utf-8") as handle:
        json.dump(spec, handle, indent=2)
    result = subprocess.run(["node", ARCHIFY_CLI, "render", "workflow", temp, output], text=True, capture_output=True)
    if result.returncode:
        print(f"[FAIL] {output}: {result.stderr.strip()}")
        return False
    print(f"[OK] {output}")
    return True


if __name__ == "__main__":
    passed = sum(render(item) for item in DIAGRAMS)
    print(f"Rendered {passed}/{len(DIAGRAMS)} diagrams in Batch 3.")
