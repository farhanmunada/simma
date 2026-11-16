import { describe, it, expect } from "vitest";
import {
  isValidNik,
  isValidNisn,
  isValidMotherName,
  validateStudent,
  validateTeacher,
  validateClassroom,
  validateInstitution,
  calculateReadiness,
} from "./emis.validator.js";
import {
  formatEmisStudentsCsv,
  formatEmisTeachersCsv,
  formatEmisClassroomsCsv,
  formatEmisInstitutionCsv,
} from "./emis.csv.js";
import { generateEmisBapPdf } from "./emis.pdf.js";
import type { EmisBapRecord, EmisInstitutionExportRow } from "./emis.types.js";

describe("Modul 18 Ekspor EMIS 4.0 Validator, CSV & PDF Tests", () => {
  describe("Audit & Validation Engine", () => {
    it("should accurately validate 16-digit NIK", () => {
      expect(isValidNik("3201011205080001")).toBe(true);
      expect(isValidNik("320101120508001")).toBe(false); // 15 digits
      expect(isValidNik("32010112050800012")).toBe(false); // 17 digits
      expect(isValidNik("320101120508ABCD")).toBe(false); // non-digits
      expect(isValidNik(null)).toBe(false);
    });

    it("should accurately validate 10-digit NISN", () => {
      expect(isValidNisn("0061234567")).toBe(true);
      expect(isValidNisn("006123456")).toBe(false); // 9 digits
      expect(isValidNisn("00612345678")).toBe(false); // 11 digits
      expect(isValidNisn("00612345AB")).toBe(false);
    });

    it("should reject invalid/placeholder biological mother names", () => {
      expect(isValidMotherName("Siti Aminah")).toBe(true);
      expect(isValidMotherName("-")).toBe(false);
      expect(isValidMotherName(".")).toBe(false);
      expect(isValidMotherName("Tidak Tahu")).toBe(false);
      expect(isValidMotherName("")).toBe(false);
      expect(isValidMotherName(undefined)).toBe(false);
    });

    it("should detect critical anomalies on invalid student data", () => {
      const student = {
        id: "s-1",
        nik: "123", // invalid
        nisn: "456", // invalid
        fullName: "Ahmad Dahlan",
        birthPlace: "Jakarta",
        birthDate: "2008-01-01",
        gender: "L",
        motherName: "-", // invalid
        status: "aktif",
        classroomId: null, // missing rombel
        parents: [],
      };

      const result = validateStudent(student);
      expect(result.isReady).toBe(false);
      expect(result.anomalies.length).toBeGreaterThanOrEqual(4);
      expect(result.anomalies.some((a) => a.fieldName === "NIK")).toBe(true);
      expect(result.anomalies.some((a) => a.fieldName === "NISN")).toBe(true);
      expect(result.anomalies.some((a) => a.fieldName === "Nama Ibu Kandung")).toBe(true);
      expect(result.anomalies.some((a) => a.fieldName === "Rombongan Belajar")).toBe(true);
    });

    it("should pass fully compliant student data", () => {
      const student = {
        id: "s-2",
        nik: "3201011205080001",
        nisn: "0061234567",
        fullName: "Fatimah Azzahra",
        birthPlace: "Bandung",
        birthDate: "2008-04-12",
        gender: "P",
        motherName: "Siti Nurhaliza",
        status: "aktif",
        classroomId: "c-1",
        classroomName: "X-A",
        parents: [{ relationType: "ibu", nik: "3201015505750002", name: "Siti Nurhaliza" }],
      };

      const result = validateStudent(student);
      expect(result.isReady).toBe(true);
      expect(result.anomalies.length).toBe(0);
    });

    it("should validate GTK and classroom data", () => {
      const teacherRes = validateTeacher({
        id: "t-1",
        nik: "3201011205800001",
        nuptk: "1234567890123456",
        fullName: "Ust. Abdullah, M.Pd",
        employmentType: "GTY",
      });
      expect(teacherRes.isReady).toBe(true);

      const classRes = validateClassroom({
        id: "c-1",
        name: "X-IPA-1",
        gradeLevel: 10,
        homeroomTeacherId: "t-1",
        studentCount: 30,
      });
      expect(classRes.isReady).toBe(true);

      const emptyClassRes = validateClassroom({
        id: "c-2",
        name: "XI-IPA-2",
        gradeLevel: 11,
        homeroomTeacherId: null,
        studentCount: 0,
      });
      expect(emptyClassRes.isReady).toBe(false);
      expect(emptyClassRes.anomalies.length).toBe(2);
    });

    it("should validate institution NSM and NPSN format", () => {
      const instOk = validateInstitution({
        nsm: "131232010001",
        npsn: "20277890",
        name: "MAN 1",
        address: "Jl. Lapangan",
      });
      expect(instOk.isReady).toBe(true);

      const instBad = validateInstitution({
        nsm: "123",
        npsn: "456",
        name: "MAN 1",
        address: "Jl. Lapangan",
      });
      expect(instBad.isReady).toBe(false);
      expect(instBad.anomalies.length).toBe(2);
    });

    it("should calculate correct readiness metrics", () => {
      const empty = calculateReadiness(0, 0);
      expect(empty.percentage).toBe(100);

      const partial = calculateReadiness(100, 85);
      expect(partial.percentage).toBe(85);
      expect(partial.invalid).toBe(15);
    });
  });

  describe("CSV Generation for Official Kemenag Templates", () => {
    it("should generate RFC 4180 compliant CSV for Siswa", () => {
      const csv = formatEmisStudentsCsv([
        {
          no: 1,
          nik: "3201011205080001",
          nisn: "0061234567",
          nis: "2024001",
          fullName: "Ahmad, S.Pd",
          gender: "L",
          birthPlace: "Jakarta, Barat",
          birthDate: "2008-01-01",
          motherName: "Siti Aminah",
          motherNik: "3201015505750001",
          fatherName: "Budi",
          fatherNik: "3201011205750001",
          classroomName: "X-A",
          gradeLevel: "10",
          status: "aktif",
        },
      ]);

      expect(csv).toContain('"No","NIK","NISN","NIS","Nama Lengkap"');
      expect(csv).toContain('"Ahmad, S.Pd"');
      expect(csv).toContain('"Jakarta, Barat"');
    });

    it("should generate valid CSV for GTK, Rombel, and Institution", () => {
      const gtkCsv = formatEmisTeachersCsv([
        {
          no: 1,
          nik: "3201011205800001",
          nuptk: "1234567890123456",
          pegId: "PEG-123456",
          nip: "-",
          fullName: "Drs. H. Miftah Faridl",
          gender: "L",
          birthPlace: "Bandung",
          birthDate: "1975-05-12",
          employmentType: "PNS",
          gtkType: "Guru PNS",
          dutyStatus: "Aktif Mengajar",
          highestEducation: "S2",
          major: "Pendidikan Agama Islam",
          isCertified: "Sudah",
          certificationField: "PAI",
          totalJtm: 24,
        },
      ]);
      expect(gtkCsv).toContain('"No","NIK","NUPTK","PegID","NIP","Nama Lengkap"');
      expect(gtkCsv).toContain("Drs. H. Miftah Faridl");

      const rombelCsv = formatEmisClassroomsCsv([
        {
          no: 1,
          classroomName: "X-A",
          gradeLevel: 10,
          homeroomTeacherName: "Ust. Abdullah",
          homeroomTeacherNuptk: "12345",
          studentCount: 32,
          capacity: 36,
        },
      ]);
      expect(rombelCsv).toContain('"No","Nama Rombel","Tingkat Kelas","Wali Kelas"');
      expect(rombelCsv).toContain("Ust. Abdullah");

      const instCsv = formatEmisInstitutionCsv({
        nsm: "131232010001",
        npsn: "20277890",
        name: "MAN 1 Model",
        status: "Negeri",
        address: "Jl. Madrasah No. 10",
        academicYear: "2025/2026",
        semester: "Ganjil",
        headmasterName: "Drs. H. Miftah Faridl, M.Ag",
      });
      expect(instCsv).toContain('"NSM","NPSN","Nama Madrasah"');
      expect(instCsv).toContain("131232010001");
      expect(instCsv).toContain("20277890");
    });
  });

  describe("Native PDF BAP Generation", () => {
    it("should generate valid PDF buffer for Berita Acara Pendataan", () => {
      const mockBap: EmisBapRecord = {
        id: "bap-1",
        bapNumber: "BAP-EMIS/2026/1/1001",
        academicYear: "2025/2026",
        semester: "Ganjil",
        totalStudents: 350,
        maleStudents: 170,
        femaleStudents: 180,
        totalTeachers: 28,
        pnsTeachers: 10,
        nonPnsTeachers: 18,
        totalClassrooms: 12,
        readinessPercentage: 98,
        status: "draft",
        headmasterName: "Drs. H. Miftah Faridl, M.Ag",
        operatorName: "Ahmad Fauzan, S.Kom",
        createdAt: new Date().toISOString(),
      };

      const mockInst: EmisInstitutionExportRow = {
        nsm: "131232010001",
        npsn: "20277890",
        name: "MAN 1 Model Kemenag",
        status: "Negeri",
        address: "Jl. Madrasah No. 10",
        academicYear: "2025/2026",
        semester: "Ganjil",
        headmasterName: "Drs. H. Miftah Faridl, M.Ag",
      };

      const buffer = generateEmisBapPdf(mockBap, mockInst);
      expect(Buffer.isBuffer(buffer)).toBe(true);
      const str = buffer.toString("latin1");
      expect(str.startsWith("%PDF-1.4")).toBe(true);
      expect(str.includes("%%EOF")).toBe(true);
      expect(str.includes("BAP-EMIS/2026/1/1001")).toBe(true);
    });
  });
});
