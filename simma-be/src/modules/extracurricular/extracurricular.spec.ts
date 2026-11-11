import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExtracurricularService } from "./extracurricular.service.js";
import type { ExtracurricularRepository } from "./extracurricular.repository.js";
import { ConflictError, ValidationError, NotFoundError } from "../../core/errors/index.js";

describe("Modul 17 Ekstrakurikuler - Service Unit Tests", () => {
  let mockRepo: Partial<ExtracurricularRepository>;
  let service: ExtracurricularService;

  beforeEach(() => {
    mockRepo = {
      findExtracurriculars: vi.fn(),
      findExtracurricularById: vi.fn(),
      findExtracurricularByCode: vi.fn(),
      createExtracurricular: vi.fn(),
      updateExtracurricular: vi.fn(),
      deleteExtracurricular: vi.fn(),
      findMembers: vi.fn(),
      findMemberById: vi.fn(),
      findMemberByStudentAndPeriod: vi.fn(),
      countStudentActiveEkskul: vi.fn(),
      countMembers: vi.fn(),
      createMember: vi.fn(),
      updateMember: vi.fn(),
      deleteMember: vi.fn(),
      findGrades: vi.fn(),
      findStudentGradesForRdm: vi.fn(),
      upsertGrade: vi.fn(),
      batchUpsertGrades: vi.fn(),
      getStats: vi.fn(),
    };
    service = new ExtracurricularService(mockRepo as any);
  });

  describe("Master Ekstrakurikuler", () => {
    it("harus menolak pembuatan ekskul jika kode sudah terdaftar (ConflictError)", async () => {
      vi.mocked(mockRepo.findExtracurricularByCode!).mockResolvedValue({
        id: "ekskul-1",
        code: "PRAMUKA",
        name: "Pramuka",
      } as any);

      await expect(
        service.createExtracurricular({
          code: "PRAMUKA",
          name: "Gerakan Pramuka",
          category: "kepanduan",
        })
      ).rejects.toThrow(ConflictError);
    });

    it("harus berhasil membuat ekskul jika kode unik", async () => {
      vi.mocked(mockRepo.findExtracurricularByCode!).mockResolvedValue(undefined as any);
      vi.mocked(mockRepo.createExtracurricular!).mockResolvedValue({
        id: "ekskul-new",
        code: "PRAMUKA",
        name: "Gerakan Pramuka",
        category: "kepanduan",
      } as any);

      const result = await service.createExtracurricular({
        code: "PRAMUKA",
        name: "Gerakan Pramuka",
        category: "kepanduan",
      });

      expect(result.id).toBe("ekskul-new");
      expect(mockRepo.createExtracurricular).toHaveBeenCalledTimes(1);
    });

    it("harus melempar NotFoundError jika getById tidak menemukan data", async () => {
      vi.mocked(mockRepo.findExtracurricularById!).mockResolvedValue(undefined);

      await expect(service.getExtracurricularById("non-existent")).rejects.toThrow(NotFoundError);
    });
  });

  describe("Pendaftaran & Keanggotaan Santri", () => {
    it("harus menolak pendaftaran jika status ekskul non-aktif (F-EKS-01)", async () => {
      vi.mocked(mockRepo.findExtracurricularById!).mockResolvedValue({
        id: "ekskul-1",
        name: "Robotik",
        isActive: false,
      } as any);

      await expect(
        service.registerMember({
          extracurricularId: "ekskul-1",
          studentId: "student-1",
          academicYearId: "ta-2024",
          semester: "ganjil",
        })
      ).rejects.toThrow(ValidationError);
    });

    it("harus menolak jika siswa sudah terdaftar pada ekskul yang sama di periode yang sama", async () => {
      vi.mocked(mockRepo.findExtracurricularById!).mockResolvedValue({
        id: "ekskul-1",
        name: "Pramuka",
        isActive: true,
      } as any);
      vi.mocked(mockRepo.findMemberByStudentAndPeriod!).mockResolvedValue({
        id: "member-1",
      } as any);

      await expect(
        service.registerMember({
          extracurricularId: "ekskul-1",
          studentId: "student-1",
          academicYearId: "ta-2024",
          semester: "ganjil",
        })
      ).rejects.toThrow(ConflictError);
    });

    it("harus menolak pendaftaran jika kuota anggota penuh (kapasitas)", async () => {
      vi.mocked(mockRepo.findExtracurricularById!).mockResolvedValue({
        id: "ekskul-1",
        name: "Robotik",
        isActive: true,
        maxCapacity: 20,
      } as any);
      vi.mocked(mockRepo.findMemberByStudentAndPeriod!).mockResolvedValue(undefined as any);
      vi.mocked(mockRepo.countMembers!).mockResolvedValue(20);

      await expect(
        service.registerMember({
          extracurricularId: "ekskul-1",
          studentId: "student-1",
          academicYearId: "ta-2024",
          semester: "ganjil",
        })
      ).rejects.toThrow(/Kuota pendaftaran/);
    });

    it("harus membatasi pendaftaran maksimal 3 ekskul aktif per siswa (F-EKS-02)", async () => {
      vi.mocked(mockRepo.findExtracurricularById!).mockResolvedValue({
        id: "ekskul-4",
        name: "Karya Ilmiah",
        isActive: true,
        maxCapacity: 30,
      } as any);
      vi.mocked(mockRepo.findMemberByStudentAndPeriod!).mockResolvedValue(undefined as any);
      vi.mocked(mockRepo.countMembers!).mockResolvedValue(10);
      vi.mocked(mockRepo.countStudentActiveEkskul!).mockResolvedValue(3); // Sudah 3 ekskul aktif

      await expect(
        service.registerMember({
          extracurricularId: "ekskul-4",
          studentId: "student-1",
          academicYearId: "ta-2024",
          semester: "ganjil",
        })
      ).rejects.toThrow(/maksimal 3 ekstrakurikuler/);
    });

    it("harus berhasil mendaftarkan santri jika semua syarat terpenuhi", async () => {
      vi.mocked(mockRepo.findExtracurricularById!).mockResolvedValue({
        id: "ekskul-1",
        name: "Pramuka",
        isActive: true,
        maxCapacity: 50,
      } as any);
      vi.mocked(mockRepo.findMemberByStudentAndPeriod!).mockResolvedValue(undefined as any);
      vi.mocked(mockRepo.countMembers!).mockResolvedValue(15);
      vi.mocked(mockRepo.countStudentActiveEkskul!).mockResolvedValue(1);
      vi.mocked(mockRepo.createMember!).mockResolvedValue({
        id: "member-new",
        studentId: "student-1",
        extracurricularId: "ekskul-1",
        role: "MEMBER",
        status: "ACTIVE",
      } as any);

      const result = await service.registerMember({
        extracurricularId: "ekskul-1",
        studentId: "student-1",
        academicYearId: "ta-2024",
        semester: "ganjil",
      });

      expect(result.id).toBe("member-new");
      expect(mockRepo.createMember).toHaveBeenCalledTimes(1);
    });
  });

  describe("Penilaian & Integrasi Rapor RDM", () => {
    it("harus mengubah data nilai ke format cetak RDM Kemenag secara akurat", async () => {
      vi.mocked(mockRepo.findStudentGradesForRdm!).mockResolvedValue([
        {
          id: "grade-1",
          extracurricularName: "Pramuka",
          category: "kepanduan",
          score: "A",
          notes: "Aktif memimpin regu dan disiplin dalam upacara perkemahan",
          semester: "ganjil",
        },
        {
          id: "grade-2",
          extracurricularName: "Robotik Madrasah",
          category: "keilmuan",
          score: "B",
          notes: "Cakap merakit mikrokontroler sensor gerak",
          semester: "ganjil",
        },
      ] as any);

      const rdmGrades = await service.getStudentRdmGrades("student-1", "ta-2024", "ganjil");

      expect(rdmGrades).toHaveLength(2);
      expect(rdmGrades[0]).toEqual({
        name: "Pramuka",
        score: "Sangat Baik",
        description: "Aktif memimpin regu dan disiplin dalam upacara perkemahan",
      });
      expect(rdmGrades[1]).toEqual({
        name: "Robotik Madrasah",
        score: "Baik",
        description: "Cakap merakit mikrokontroler sensor gerak",
      });
    });

    it("harus menolak batch upsert nilai jika daftar kosong", async () => {
      await expect(service.batchUpsertGrades({ items: [] } as any)).rejects.toThrow(ValidationError);
    });

    it("harus memanggil repository batchUpsertGrades ketika data valid", async () => {
      const items = [
        {
          extracurricularMemberId: "member-1",
          academicYearId: "ta-1",
          semester: "ganjil" as const,
          score: "A" as const,
          notes: "Sangat aktif",
        },
      ];
      vi.mocked(mockRepo.batchUpsertGrades!).mockResolvedValue(items as any);

      const res = await service.batchUpsertGrades({ items });
      expect(res).toHaveLength(1);
      expect(mockRepo.batchUpsertGrades).toHaveBeenCalledWith(items);
    });
  });
});
