# ARCHITECTURE & SYSTEM DESIGN: SIMMA

## 1. Topologi Deployment On-Premise (Ubuntu Server di LAN Sekolah)

SIMMA dijalankan secara lokal di atas Ubuntu Server menggunakan Docker Compose:

```text
[ Klien LAN/WiFi Madrasah: Laptop Guru, PC TU, HP Santri ]
                           │
                           ▼ (Port 80 / HTTP)
              ┌─────────────────────────┐
              │  Nginx Reverse Proxy    │
              │  & Static Cache Server  │
              └────────────┬────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         ▼ / (Static Assets)                 ▼ /api/* (JSON REST)
┌──────────────────┐               ┌──────────────────┐
│  simma-fe        │               │  simma-be        │
│  (React SPA dist)│               │  (Fastify Node22)│
└──────────────────┘               └─────────┬────────┘
                                             │ (Connection Pool: max 30)
                                             ▼
                                  ┌──────────────────┐
                                  │  PostgreSQL 16   │
                                  │  (Mounted Volume)│
                                  └──────────────────┘
```

---

## 2. Pilihan Stack & Alasan Teknis (Konkurensi & Stabilitas)

| Komponen | Pilihan Teknologi | Alasan Pemilihan |
|---|---|---|
| **OS Server** | Ubuntu Server 24.04 LTS | Bebas overhead GUI, manajemen background process stabil, ramah Docker |
| **Backend API (`simma-be`)** | Node.js (v22 LTS) + Fastify (TS) | Throughput I/O tinggi, memory footprint rendah di RAM server, validation native Zod |
| **ORM & DB Access** | Drizzle ORM | Raw SQL performance, zero runtime overhead, type-safe query tanpa rust-engine bloat |
| **Database** | PostgreSQL 16 | ACID compliant untuk kas SPP, row-level locking (anti-lock saat input nilai serentak), JSONB untuk field dinamis EMIS |
| **Frontend UI (`simma-fe`)** | Vite + React (TypeScript) + Tailwind + shadcn/ui | Client-side rendering (CPU server fokus ke data), TanStack Table (Virtual) anti-lag di tabel padat nilai |
| **Orkestrasi** | Docker Compose | Satu perintah deployment terisolasi, data ter-mount aman di disk lokal server |

---

## 3. Strategi Menghadapi High Concurrency (Input Nilai Serentak)

1. **Batch Upsert Endpoint:**
   - Guru tidak mengirim request HTTP per siswa.
   - Frontend mengirim seluruh nilai 1 kelas (30-40 siswa) dalam 1 payload JSON array ke `/api/v1/grades/batch-upsert`.
   - Backend memprosesnya dalam satu kueri SQL `INSERT ... ON CONFLICT (student_id, subject_id, academic_year_id) DO UPDATE`.
2. **PostgreSQL Connection Pool:**
   - Fastify mengelola pool koneksi terukur (`min: 5`, `max: 30`) agar tidak membebani memori PostgreSQL saat puluhan guru aktif serentak.
3. **Virtual DOM Table di Klien:**
   - Frontend memanfaatkan `@tanstack/react-table` + `@tanstack/react-virtual`. Dari 200 baris nilai, hanya 15-20 baris yang dirender di DOM layar klien pada saat bersamaan.

---

## 4. Skema Basis Data Relasional Inti

```sql
-- 1. IDENTITAS & RBAC
CREATE TABLE madrasah_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nsm VARCHAR(12) UNIQUE NOT NULL,
    npsn VARCHAR(8) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    accreditation VARCHAR(2) DEFAULT 'A',
    headmaster_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- SUPERADMIN, KAMAD, WAKA_KURIKULUM, WAKA_KESISWAAN, BENDAHARA, GURU, TU, SISWA, WALI
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. AKADEMIK KEMENAG & SISWA
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL, -- "2026/2027"
    semester VARCHAR(10) NOT NULL, -- "GANJIL" / "GENAP"
    is_active BOOLEAN DEFAULT FALSE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    nis VARCHAR(20) UNIQUE NOT NULL,
    nisn VARCHAR(10) UNIQUE NOT NULL,
    nik VARCHAR(16) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    birth_place VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    status_in_family VARCHAR(50),
    is_pip_recipient BOOLEAN DEFAULT FALSE,
    parent_phone VARCHAR(20),
    emis_extra_data JSONB DEFAULT '{}'::jsonb, -- Atribut dinamis format EMIS Kemenag
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    grade_level INT NOT NULL, -- 10, 11, 12
    name VARCHAR(50) NOT NULL, -- "X-1", "XI-MIPA-1", "XII-KEAGAMAAN"
    major VARCHAR(50) NOT NULL, -- "UMUM", "MIPA", "IPS", "BAHASA", "KEAGAMAAN"
    homeroom_teacher_id UUID REFERENCES users(id)
);

CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- "UMUM", "PAI_QURDIS", "PAI_AKIDAH", "PAI_FIKIH", "PAI_SKI", "BAHASA_ARAB", "MULOK"
    kkm NUMERIC(5,2) DEFAULT 75.00
);

-- 3. NILAI & RAPOR (RDM COMPLIANT)
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    formative_score NUMERIC(5,2) DEFAULT 0.00,
    summative_lm_score NUMERIC(5,2) DEFAULT 0.00,
    summative_final_score NUMERIC(5,2) DEFAULT 0.00,
    final_score NUMERIC(5,2) DEFAULT 0.00,
    letter_grade VARCHAR(2),
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_student_subject_year UNIQUE (student_id, subject_id, academic_year_id)
);

-- 4. MODUL TAHFIDZ & IHYA AMALAN
CREATE TABLE tahfidz_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id),
    record_date DATE NOT NULL,
    surah_name VARCHAR(100) NOT NULL,
    ayah_start INT NOT NULL,
    ayah_end INT NOT NULL,
    juz INT NOT NULL,
    tajweed_grade VARCHAR(5) NOT NULL, -- "A", "B", "C", "D"
    fluency_grade VARCHAR(5) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. KEUANGAN & SPP
CREATE TABLE fee_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    is_recurring BOOLEAN DEFAULT TRUE
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id),
    fee_type_id UUID NOT NULL REFERENCES fee_types(id),
    period_month INT,
    period_year INT,
    total_amount NUMERIC(12,2) NOT NULL,
    paid_amount NUMERIC(12,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'UNPAID', -- "UNPAID", "PARTIAL", "PAID"
    due_date DATE NOT NULL
);
```
