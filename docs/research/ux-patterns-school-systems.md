# UX Patterns & Usability Research for School Information Systems
## Focus: Teachers with Low Digital Literacy (SIMMA - Madrasah Aliyah)

*Research compiled: 2026-11-07*

---

## 1. BULK GRADE ENTRY PATTERNS

### 1A. Spreadsheet-Style Grid (CONSENSUS BEST PATTERN)

Every successful school system converges on the same grade entry model:
- **Rows = students** (sorted by roll number)
- **Columns = assignments/assessments**
- **Click cell → type score → Tab/Enter to move**
- **Autosave** with visible status indicator
- **No modal dialogs** between teacher and their stack of papers

**Sources:**
- Pearspark: "keyboard-first grid with autosave and undo... no modal dialogs between a teacher and a stack of quizzes" — https://pearspark.com/features/gradebook
- Koder.ai: "core screen should be a grid: students as rows, assignments as columns. Include bulk actions, keyboard navigation, and autosave with clear status" — https://koder.ai/blog/how-to-build-a-school-web-app-for-students-grades-and-messaging
- Lekktura: Three modes — Single Cell (click-save), Bulk Edit (batch save), Quick Mode (one day, walk roster) — https://lekktura.com/features/teacher-online-gradebook
- Alma SIS: "Open quickly to the current class period without extra clicks. Allow batch entry of grades for an assignment without manually saving each one" — https://www.getalma.com/what-teachers-need-from-a-student-information-system/

### 1B. Smart Defaults & Auto-Calculation

- **Auto-calculate letter grades** from scores (no manual lookup)
- **Auto-calculate weighted averages** (teachers hate doing math)
- **Show running totals** in real-time as grades are entered
- **Pre-select current class/period** from timetable — zero clicks to start

**Source:** OpenEduCat: "Grade and status calculate automatically... If marks_percentage >= 90: Grade = A" — https://newdoc.openeducat.org/exams/enter-results/

### 1C. Excel Import/Upload Pattern (CRITICAL for Indonesian Madrasah)

Indonesian SIM Madrasah systems universally use this pattern:
1. Teacher downloads Excel template (buku nilai)
2. Fills grades offline in familiar Excel
3. Uploads back to system with one click
4. System validates and imports

**Key quote from SIM Madrasah guide:** "Proses input nilai sangat mudah sekali ga repot harus online kami sediakan inputan berupa excel buku nilai yang sangat mudah dimengerti setelah nilai terisi bapak ibu guru bisa langsung import ke SIM Madrasah dengan sekali klik" (Grade input is very easy, no need to be online, we provide Excel grade book input that's very easy to understand, after grades are filled teachers can directly import to SIM Madrasah with one click)

**Source:** https://id.scribd.com/document/805268703/Pedoman-sim-mtsku

### 1D. Maker-Checker Workflow (SchoolDeck — Anti-Tampering)

3-stage grade entry workflow:
1. **Subject teacher enters** marks (RBAC — can only see their assigned subjects/sections)
2. **Class teacher verifies** (checker) — marks flagged as 'pending' until verified
3. **Principal locks** + audit trail (OTP-based override for changes)

**Source:** SchoolDeck/Databus — https://databus.co/schooldeck/features/examinations/

### 1E. Anti-Patterns to AVOID

| Anti-Pattern | Why It Fails | Source |
|---|---|---|
| One-student-at-a-time modal forms | Too slow for 36 students × multiple components | Pearspark, Koder.ai |
| No autosave / save button per cell | Teachers lose work, afraid to navigate away | Lekktura |
| Gradebook doesn't show current period | Extra clicks = teacher opens spreadsheet instead | Alma SIS |
| Forcing fake zeros for missing work | Skews averages; teachers need Missing/Excused codes | Koder.ai |
| "Save" = "Publish" (no separation) | Parents see partial/incorrect grades mid-entry | Koder.ai |
| Too many grade categories | "Too many categories will be confusing... may cause teachers to spend too much time on data entry" | https://www.greatschoolspartnership.org/wp-content/uploads/2020/01/Grading-and-Reporting-for-Educational-Equity-Full-Book.pdf |
| Grade column layout bugs (Canvas) | Wide gradebooks with many columns break layout, users can't find Total column | https://community.instructure.com/en/discussion/comment/625606 |
| Google Classroom gradebook | "sluggish... no option to easily check off routine tasks... grade book doesn't even sort students by last name" | Reddit r/teaching |

---

## 2. ATTENDANCE MARKING PATTERNS

### 2A. Default-Present Pattern (CONSENSUS BEST)

All successful attendance systems use this:
1. Open class → **all students default to Present** (green)
2. Teacher **only taps the 2-3 absent students**
3. Save once

**This flips from "tap 47 times" to "tap 2 times"**

**Sources:**
- Inkwelly: "The default flips from 'tap 47 times' to 'tap two times'" — https://inkwelly.com/en/features/mark-daily-attendance
- Edutris: "Mark the whole section present in one tap and only change the absentees" — https://www.edutris.com/features/attendance
- Classegy: "Class teachers mark absent and late students in a single tap... full classroom of 40 students completed in under 30 seconds" — https://classegy.com/features/attendance-biometrics
- ERPfly: "Keep the register screen to one tap per student, or teachers will go back to paper within a month" — https://www.erpfly.com/industries/education/

### 2B. Auto-Load Current Class (Zero Navigation)

- System reads timetable → knows which class this teacher has NOW
- Opens directly to that class roster — **no class picker, no dropdown**
- Roll number sort with student photos

**Source:** Inkwelly: "A class teacher opens Inkwelly... taps Mark Today. The class she is assigned to opens directly—no class picker, no list to scroll" — https://inkwelly.com/en/features/mark-daily-attendance

### 2C. Status Options

Standard set across all systems: **P (Present) · A (Absent) · L (Late) · E (Excused)**
Some add: Half-Day, Leave (with remarks field)

Color coding: Green=Present, Red=Absent, Yellow/Orange=Late

### 2D. Instant Parent Notification

- Absent marked → SMS/WhatsApp to parent within 15 minutes
- "This prevents students from leaving home and not reaching school without parent knowing"

**Source:** EngineerBabu — https://engineerbabu.com/blog/school-erp-software-development/

### 2E. Offline/Low-Connectivity Handling

- Lightweight page that works on slow mobile data
- Some systems: offline mode → queue → sync when connected
- Critical for on-premise/LAN scenarios like SIMMA

**Source:** OpenEduCat: "Offline mode stores records locally and syncs when connectivity returns" — https://openeducat.org/features/attendance-management/

### 2F. Anti-Patterns

| Anti-Pattern | Impact |
|---|---|
| Requiring student-by-student selection from dropdown | 10x slower than tap grid |
| No "Mark All Present" bulk action | Forces tapping every student even when 95% present |
| Requiring internet connection to even view roster | Dead in rural/LAN settings |
| No timestamp/source tracking | Can't audit who marked and when |

---

## 3. TAHFIDZ/QURAN MEMORIZATION TRACKING

### 3A. Core Data Model (From Indonesian Madrasah Practice)

Each setoran (deposit/submission) records:
- **Student** (santri)
- **Date/time**
- **Type**: Ziyadah (new memorization) vs Muraja'ah (review/repetition)
- **Surah + starting ayah → ending ayah** (or page-based)
- **Assessment dimensions**:
  - Tajwid (recitation rules correctness)
  - Makhrajul huruf (articulation points)
  - Kelancaran (fluency/smoothness)
- **Status**: Accepted (lulus) / Needs revision (perlu perbaikan)
- **Teacher/examiner** who listened

**Sources:**
- SIM Akademik EKA SPIDI: "fitur input data harian siswa yang mencakup presensi kelas, presensi ibadah, mutabaah harian, dan setoran hafalan Al-Qur'an" — https://ojs.staialfurqan.ac.id/alqiyam/article/download/1401/947/
- Monitoring analysis: "guru menilai terhadap aspek tajwid, makhrajul huruf, dan kelancaran membaca" — https://e-journal.unimudasorong.ac.id/index.php/jurnalpetisi/article/download/4615/2060

### 3B. Interactive Quran Page Pattern

Best apps use an **interactive Quran page display** where:
- Teacher sees the mushaf page
- Can tap/mark specific ayahs as memorized
- Visual indicator of what's already memorized vs not yet
- Shows where student left off last time

**Source:** Quamus Tahfidz: "menggunakan halaman Quran Interaktif... guru untuk langsung melihat halaman terakhir hafalan siswa, dan memberikan penanda ayat yang sudah dihafal dan yang belum" — https://apps.apple.com/id/app/quamus-tahfidz/id6462849666

### 3C. Progress Visualization

- **Juz completion chart** (30 juz total)
- **Surah-by-surah heatmap** showing completion level
- **Daily streak tracking** for motivation
- **Progress bar** per student showing % of target achieved

**Sources:**
- Hafiz Tracker: "Visual surah heatmap shows your completion at a glance" — https://play.google.com/store/apps/details?id=com.keecon.hifz_tracker_pro
- Tahfidz Tracker: "Lihat progres total hafalan dan streak harian" — https://play.google.com/store/apps/details?id=com.tahfidztracker

### 3D. Reporting to Parents

- **Real-time notification** after each setoran
- Report includes: student data, setoran type (ziyadah/muraja'ah), analysis, progress
- Periodic rapor tahfidz (memorization report card)

**Source:** Quamus Tahfidz: "Laporan setoran tahfidz siswa... dikirimkan langsung ke orang tua secara realtime" — https://apps.apple.com/id/app/quamus-tahfidz/id6462849666

### 3E. Integration with School System

Tahfidz should NOT be a separate app. It should integrate with:
- Student master data
- Attendance system
- Academic reporting
- Overall school dashboard

**Source:** JIAC paper: "Dilengkapi dengan database terintegrasi dan antarmuka interaktif, sistem ini memungkinkan pengelolaan tugas hafalan, penilaian, laporan evaluasi" — https://journal.univpancasila.ac.id/index.php/jiac/article/download/8448/3748

---

## 4. SPP/TUITION PAYMENT RECORDING

### 4A. Core Workflow (Indonesian Madrasah Pattern)

1. **Admin generates monthly tagihan (bills)** per student based on class/payment rules
2. **Parent pays** (cash at counter, transfer, or digital — QRIS/e-wallet)
3. **Admin records payment** — selects student → amount auto-populated from outstanding tagihan
4. **Receipt printed/sent** (PDF kwitansi)
5. **Arrears tracking** — system shows tunggakan (outstanding balance) per student
6. **Reports**: daily/monthly/yearly rekapitulasi (recapitulation)

**Sources:**
- MTs Hidayatus Shibyan study: "admin dapat mengelola data siswa, menginput tagihan, memantau status pembayaran, dan menghasilkan laporan keuangan otomatis (harian, bulanan, tahunan)" — https://jurnal.dharmawangsa.ac.id/index.php/syntax/en/article/view/8004
- MTs Al-Ikhwan: "membantu proses perekapan hasil pembayaran SPP dari siswa yang sudah registrasi dan yang belum registrasi" — https://garuda.kemdiktisaintek.go.id/documents/detail/1656678

### 4B. Key Input Design for Admin

- **Student search by name or NIS** (nomor induk siswa) — fast lookup
- **Auto-show outstanding tagihan** when student selected
- **Payment amount defaults** to monthly SPP amount (one click to confirm)
- **Multiple payment types**: SPP, seragam, LKS, uang gedung, infaq
- **Partial payment support** with remaining balance shown
- **Print receipt immediately** after recording

### 4C. Monitoring Features

- **Class-wise payment summary**: who has paid, who hasn't
- **Color-coded status**: Lunas (paid/green), Belum (unpaid/red), Sebagian (partial/yellow)
- **SMS/notification to parents** for overdue payments
- **Dashboard for kepala madrasah/yayasan** — view without requesting from keuangan

**Source:** JTISI study: "Wali Siswa dapat melihat pembayaran siswa yang telah jatuh tempo... Kepala Madrasah dan Pihak Yayasan dapat melihat laporan pembayaran SPP secara langsung melalui Website tanpa harus meminta ke bagian Keuangan" — https://journal.al-matani.com/index.php/jtisi/article/download/517/332

---

## 5. GENERAL UX PRINCIPLES FOR LOW DIGITAL LITERACY USERS

### 5A. Interface Design Rules

| Principle | Implementation | Source |
|---|---|---|
| **Large, clickable buttons** | Min 44×44px touch targets, clear labels | Classter |
| **Bahasa Indonesia labels** | No English UI jargon | SIM Madrasah guides |
| **Color-coded sections** | Icons + colors to aid navigation | Classter |
| **Sensible defaults** | Current term, today's date, teacher's class pre-selected | Koder.ai |
| **Minimize navigation depth** | Key tasks max 2 clicks from dashboard | Classter |
| **Visual hierarchy** | Big type for names/scores, clear section dividers | BookBolt |
| **No information overload** | "Simplified graphs, reduced indicators" | Learning Analytics dashboard study |
| **Clear task labels** | "Enter Grades" button, not buried in dropdown | Classter |

### 5B. Onboarding & Training

- **Step-by-step guides** with screenshots (avoid jargon)
- **Peer mentoring** (tech-savvy teachers help others) — most effective method
- **Gradual rollout** — start with basic features, add complexity over time
- **Principal's persuasive, staged approach** — "not to create pressure"

**Source:** Indonesian principal study: "strategi centered on 'a persuasive and staged approach, beginning with outreach on the importance of digitalization, followed by training adjusted to each teacher's and staff member's ability level'" — https://journal.diginus.id/ITEJ/article/download/1725/888

### 5C. Indonesian Academic Study (STIE Pontianak)

User-Centered Design for low digital literacy users achieved:
- **99% task success rate** for low digital literacy group
- **SUS score 69** (marginal but acceptable) for low literacy
- **SUS score 81.4** for high literacy group
- Key: Use UCD approach with iterative testing

**Source:** https://jse.rezkimedia.org/jse/article/view/791

### 5D. Elderly/Senior Teacher LMS Study

Redesigned LMS prototype for elderly teachers:
- Old system SUS score: **50** (unusable)
- Redesigned SUS score: **76** (good/acceptable)
- Key improvements: "clean visual layout, intuitive navigation, tooltips and clear instructions"

**Source:** https://journals2.ums.ac.id/khif/article/download/2780/5722

---

## 6. ARCHITECTURE CONSIDERATIONS (LAN/On-Premise)

### 6A. Offline-First Design

For madrasah with unreliable internet:
- **Treat offline as central design choice, not fallback**
- LAN-based server with browser access
- Lightweight pages that work on slow connections
- Excel import/export as bridge for offline work

**Source:** World Bank EdTech report: "Where readiness is limited, offline and low-bandwidth design should be treated as a central design choice rather than a fallback" — https://documents1.worldbank.org/curated/en/099062326183513900/pdf/P510410-b8bfd536-b1f5-484e-a770-e7c73579ada3.pdf

### 6B. Concurrent Access (Morning Attendance Spike)

When 20+ teachers mark attendance simultaneously at 7:30 AM:
- Use **bulk upsert with composite indexes** (class_id, section_id, date)
- Buffer raw payloads before batch write
- Sort records in app layer before SQL to prevent deadlocks

**Source:** School ERP Laravel architecture: "Eliminate deadlocks by wrapping attendance submissions in database transactions, using composite indexes... buffering raw check-in payloads into Redis streams" — https://studygolang.com/articles/81160

---

## 7. KEY DESIGN DECISIONS FOR SIMMA

Based on all research, recommended patterns:

### Grade Entry
1. **Primary**: Spreadsheet-style inline grid (keyboard-navigable, autosave)
2. **Secondary**: Excel template download → fill offline → upload/import
3. **Auto-calculate** letter grades and weighted averages
4. **Separate "save" from "publish"** to prevent premature parent visibility
5. **Quick Entry mode** for one assessment at a time (simplified single-column)

### Attendance
1. **Default-present** with tap-to-toggle exceptions only
2. **Auto-load** teacher's current class from jadwal
3. **Status**: Hadir (H) · Alpha (A) · Izin (I) · Sakit (S) · Terlambat (T)
4. **Save once** for entire class
5. **Works on LAN** without external internet

### Tahfidz
1. **Per-setoran logging**: student, surah/ayat range, type (ziyadah/muraja'ah)
2. **Three assessment dimensions**: tajwid, makhraj, kelancaran
3. **Visual progress**: juz completion chart, surah heatmap
4. **Integrated** with student master data (not separate module)

### SPP Payment
1. **Student quick-search** → auto-show outstanding tagihan
2. **One-click confirm** for standard monthly amount
3. **Print kwitansi** immediately
4. **Dashboard**: class-wise lunas/belum status with color coding
5. **Role-based access**: admin inputs, kepala sekolah/yayasan views reports

### General UX
1. **Bahasa Indonesia** throughout, no English jargon
2. **Big buttons, big text**, minimal nesting
3. **Task-oriented dashboard**: "Input Nilai", "Absensi Hari Ini", "Setoran Hafalan"
4. **Contextual defaults**: auto-select current semester, current class, today's date
5. **Error prevention > error correction**: validation before save, confirmation for destructive actions
6. **Excel as bridge**: always offer import/export for teachers who prefer familiar tools
