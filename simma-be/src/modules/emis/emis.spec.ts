import { describe, it, expect, vi } from "vitest";
import { EmisService } from "./emis.service.js";

describe("Modul 18 Ekspor EMIS 4.0 Service & Integration Tests", () => {

  describe("EmisService Orchestration & Endpoints", () => {
    const mockRepo: any = {
      getActiveInstitution: vi.fn().mockResolvedValue({
        nsm: "131232010001",
        npsn: "20277890",
        name: "MAN 1 Model Kemenag",
        status: "Negeri",
        address: "Jl. Madrasah No. 10",
        academicYear: "2025/2026",
        semester: "Ganjil",
        headmasterName: "Drs. H. Miftah Faridl, M.Ag",
      }),
      getStudentsForEmis: vi.fn().mockResolvedValue([
        {
          id: "s-1",
          nik: "3201011205080001",
          nisn: "0061234567",
          nis: "2024001",
          fullName: "Ahmad Zaki",
          gender: "L",
          birthPlace: "Jakarta",
          birthDate: "2008-01-01",
          motherName: "Siti Fatimah",
          status: "aktif",
          classroomId: "c-1",
          classroomName: "X-A",
          gradeLevel: 10,
          parents: [{ relationType: "ibu", nik: "3201015505750001", name: "Siti Fatimah" }],
        },
      ]),
      getTeachersForEmis: vi.fn().mockResolvedValue([
        {
          id: "t-1",
          nik: "3201011205800001",
          nuptk: "1234567890123456",
          pegId: "PEG-123456",
          nip: "-",
          fullName: "Ust. Abdullah",
          gender: "L",
          birthPlace: "Bandung",
          birthDate: "1980-05-12",
          employmentType: "GTY",
          gtkType: "Guru Tetap Yayasan",
          dutyStatus: "Aktif Mengajar",
          highestEducation: "S1",
          major: "Pendidikan",
          isCertified: true,
          certificationField: "Matematika",
          totalJtm: 24,
        },
      ]),
      getClassroomsForEmis: vi.fn().mockResolvedValue([
        {
          id: "c-1",
          name: "X-A",
          gradeLevel: 10,
          capacity: 36,
          homeroomTeacherId: "t-1",
          homeroomTeacherName: "Ust. Abdullah",
          homeroomTeacherNuptk: "1234567890123456",
          studentCount: 30,
        },
      ]),
      saveBap: vi.fn((b) => Promise.resolve(b)),
      findBapById: vi.fn(),
      listBapRecords: vi.fn().mockResolvedValue([]),
    };

    const service = new EmisService(mockRepo);

    it("should calculate 100% readiness when all data is valid", async () => {
      const result = await service.getAuditReadiness();
      expect(result.summary.overallPercentage).toBe(100);
      expect(result.summary.isReadyForExport).toBe(true);
      expect(result.anomalies.length).toBe(0);
    });

    it("should export CSV and JSON formatted student records", async () => {
      const csv = await service.exportStudents({ format: "csv" });
      expect(typeof csv).toBe("string");
      expect(csv).toContain("Ahmad Zaki");

      const json = await service.exportStudents({ format: "json" });
      expect(Array.isArray(json)).toBe(true);
      expect((json as any)[0].fullName).toBe("Ahmad Zaki");
    });

    it("should export bundle with metadata and entity summaries", async () => {
      const bundle = await service.exportBundle();
      expect(bundle.metadata.system).toBe("SIMMA EMIS 4.0 Exporter");
      expect(bundle.counts.students).toBe(1);
      expect(bundle.counts.teachers).toBe(1);
    });

    it("should create and approve BAP record", async () => {
      const created = await service.createBapDraft({}, "Operator TU");
      expect(created.status).toBe("draft");
      expect(created.bapNumber.startsWith("BAP-EMIS/")).toBe(true);
      expect(created.operatorName).toBe("Operator TU");

      mockRepo.findBapById.mockResolvedValueOnce(created);
      const approved = await service.approveBap(created.id, { approved: true, notes: "Data valid" }, "Kepala Madrasah");
      expect(approved.status).toBe("approved");
      expect(approved.notes).toBe("Data valid");
    });
  });
});
