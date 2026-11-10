import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://simma:simma_secret@localhost:5432/simma_test";
process.env.JWT_ACCESS_SECRET = "test-jwt-access-secret-minimum-32-chars-long";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-minimum-32-chars-long";
process.env.JWT_ACCESS_EXPIRY = "15m";
process.env.JWT_REFRESH_EXPIRY = "7d";

import { P5raService } from "./p5ra.service.js";
import { type P5raRepository } from "./p5ra.repository.js";
import { generateP5raReportPdf } from "./p5ra.pdf.js";
import {
  CreateP5raProjectSchema,
  CreateP5raTargetSchema,
  BatchP5raAssessmentSchema,
} from "./p5ra.schema.js";
import type {
  P5raProject,
  P5raProjectTarget,
  P5raAssessment,
  P5raStudentNote,
  Student,
  Semester,
  AcademicYear,
  Classroom,
  Institution,
} from "../../db/schema/index.js";
import type { StudentP5raReportData } from "./p5ra.types.js";

const projectId = "11111111-1111-1111-1111-111111111111";
const studentId = "22222222-2222-2222-2222-222222222222";
const targetId1 = "33333333-3333-3333-3333-333333333331";
const targetId2 = "33333333-3333-3333-3333-333333333332";
const classroomId = "44444444-4444-4444-4444-444444444444";
const academicYearId = "55555555-5555-5555-5555-555555555555";
const semesterId = "66666666-6666-6666-6666-666666666666";

const mockProject: P5raProject = {
  id: projectId,
  academicYearId,
  semesterId,
  title: "Gaya Hidup Berkelanjutan: Pengolahan Sampah Organik",
  theme: "Gaya Hidup Berkelanjutan",
  description: "Projek pengolahan limbah organik madrasah menjadi kompos",
  targetFase: "E",
  coordinatorTeacherId: null,
  startDate: "2024-08-01",
  endDate: "2024-11-30",
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTarget1: P5raProjectTarget = {
  id: targetId1,
  projectId,
  dimension: "Beriman, Bertakwa Kepada Tuhan YME, dan Berakhlak Mulia",
  element: "Akhlak kepada alam",
  subElement: "Menjaga Lingkungan Alam Sekitar",
  targetDescription: "Mewujudkan rasa syukur dengan membangun kesadaran peduli lingkungan alam",
  valuePra: "Berkeadaban (Ta'addub)",
  subValuePra: "Saleh Sosial",
  orderIndex: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTarget2: P5raProjectTarget = {
  id: targetId2,
  projectId,
  dimension: "Gotong Royong",
  element: "Kolaborasi",
  subElement: "Kerjasama",
  targetDescription: "Membangun tim dan mengelola kerjasama dalam projek",
  valuePra: "Keteladanan (Qudwah)",
  subValuePra: "Inisiatif",
  orderIndex: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAssessment1: P5raAssessment = {
  id: "aa111111-1111-1111-1111-111111111111",
  projectId,
  targetId: targetId1,
  studentId,
  predicate: "BSH",
  notes: "Sangat baik memilah sampah",
  assessedBy: null,
  assessedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockStudentNote: P5raStudentNote = {
  id: "bb111111-1111-1111-1111-111111111111",
  projectId,
  studentId,
  processNotes: "Ananda aktif berpartisipasi dalam pembuatan pupuk kompos.",
  updatedBy: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockStudent = {
  id: studentId,
  nik: "3201010101010001",
  nisn: "0012345678",
  nis: "2024001",
  fullName: "Fulan bin Fulan",
  birthPlace: "Padang",
  birthDate: "2008-01-01",
  gender: "L",
  motherName: "Fulanah",
  status: "aktif",
  photoPath: null,
  emisData: {},
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} as unknown as Student;

const mockInstitution = {
  id: "inst-1",
  nsm: "131113710001",
  npsn: "10300001",
  name: "MAN 1 Model Padang",
  address: "Jl. Khatib Sulaiman",
  logoPath: null,
  status: "aktif",
  emisData: {},
  createdAt: new Date(),
  updatedAt: new Date(),
} as unknown as Institution;

const mockAcademicYear = {
  id: academicYearId,
  name: "2024/2025",
  startDate: "2024-07-01",
  endDate: "2025-06-30",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
} as unknown as AcademicYear;

const mockSemester = {
  id: semesterId,
  academicYearId,
  type: 1,
  isActive: true,
  startDate: "2024-07-15",
  endDate: "2024-12-20",
  createdAt: new Date(),
  updatedAt: new Date(),
} as unknown as Semester;

const mockClassroom = {
  id: classroomId,
  semesterId,
  name: "X-A",
  gradeLevel: 10,
  homeroomTeacherId: null,
  capacity: 32,
  createdAt: new Date(),
  updatedAt: new Date(),
} as unknown as Classroom;

describe("Modul 10 P5RA Unit Tests", () => {
  describe("Zod Schemas", () => {
    it("validates valid CreateP5raProjectSchema payload", () => {
      const validPayload = {
        academicYearId,
        semesterId,
        title: "Kewirausahaan Berkelanjutan",
        theme: "Kewirausahaan",
        description: "Membangun usaha mandiri ramah lingkungan",
        targetFase: "E",
        classroomIds: [classroomId],
      };
      const result = CreateP5raProjectSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("rejects invalid theme in CreateP5raProjectSchema", () => {
      const invalidPayload = {
        academicYearId,
        semesterId,
        title: "Test Projek",
        theme: "Tema Sembarangan Bukan Standar Kemenag",
        description: "Deskripsi minimal",
      };
      const result = CreateP5raProjectSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it("validates valid CreateP5raTargetSchema", () => {
      const targetPayload = {
        dimension: "Mandiri",
        element: "Pemahaman diri",
        subElement: "Mengenali kualitas diri",
        targetDescription: "Mampu mengidentifikasi kekuatan dan kelemahan diri",
        valuePra: "Kemandirian (I'timad 'ala an-Nafs)",
        subValuePra: "Percaya Diri",
        orderIndex: 1,
      };
      const result = CreateP5raTargetSchema.safeParse(targetPayload);
      expect(result.success).toBe(true);
    });

    it("validates batch assessments payload", () => {
      const batchPayload = {
        projectId,
        items: [
          {
            studentId,
            targetId: targetId1,
            predicate: "BSH",
            notes: "Bagus sekali",
          },
        ],
      };
      const result = BatchP5raAssessmentSchema.safeParse(batchPayload);
      expect(result.success).toBe(true);
    });
  });

  describe("P5raService", () => {
    let mockRepo: Partial<P5raRepository>;
    let service: P5raService;

    beforeEach(() => {
      mockRepo = {
        findProjectById: vi.fn().mockResolvedValue(mockProject),
        listProjects: vi.fn().mockResolvedValue([mockProject]),
        createProject: vi.fn().mockResolvedValue(mockProject),
        updateProject: vi.fn().mockResolvedValue({ ...mockProject, title: "Updated Title" }),
        deleteProject: vi.fn().mockResolvedValue(mockProject),
        listProjectTargets: vi.fn().mockResolvedValue([mockTarget1, mockTarget2]),
        findTargetById: vi.fn().mockResolvedValue(mockTarget1),
        createTarget: vi.fn().mockResolvedValue(mockTarget1),
        updateTarget: vi.fn().mockResolvedValue({ ...mockTarget1, targetDescription: "Updated desc" }),
        deleteTarget: vi.fn().mockResolvedValue(mockTarget1),
        listStudentsForProject: vi.fn().mockResolvedValue([
          {
            student: mockStudent,
            classroom: mockClassroom,
            assessments: [mockAssessment1],
            processNotes: mockStudentNote,
          },
        ]),
        listAssessments: vi.fn().mockResolvedValue([mockAssessment1]),
        batchUpsertAssessments: vi.fn().mockResolvedValue([mockAssessment1]),
        getStudentNotes: vi.fn().mockResolvedValue(mockStudentNote),
        upsertStudentNotes: vi.fn().mockResolvedValue(mockStudentNote),
        getStudentReportData: vi.fn().mockResolvedValue({
          project: mockProject,
          student: mockStudent,
          classroom: mockClassroom,
          academicYear: mockAcademicYear,
          semester: mockSemester,
          institution: mockInstitution,
          targetsWithAssessment: [
            { target: mockTarget1, assessment: mockAssessment1 },
            { target: mockTarget2, assessment: null },
          ],
          processNotes: mockStudentNote,
          dateGenerated: "10 November 2026",
        }),
      };

      service = new P5raService(mockRepo as P5raRepository);
    });

    it("returns project with details", async () => {
      const result = await service.getProject(projectId);
      expect(result.id).toBe(projectId);
      expect(result.title).toBe(mockProject.title);
      expect(result.targets).toHaveLength(2);
    });

    it("saves batch assessments correctly", async () => {
      const items = [
        {
          targetId: targetId1,
          studentId,
          predicate: "BSH" as const,
          notes: "Aktif",
        },
      ];
      const result = await service.saveBatchAssessments(projectId, items, "user-1");
      expect(mockRepo.batchUpsertAssessments).toHaveBeenCalledWith(projectId, items, "user-1");
      expect(result).toHaveLength(1);
    });

    it("auto-generates process notes for students with positive predicates", async () => {
      const note = await service.generateProcessNotes(projectId, studentId);
      expect(note).toContain("Fulan bin Fulan");
      expect(note).toContain("Berkembang sesuai harapan");
    });

    it("compiles student report data correctly", async () => {
      const report = await service.getStudentReport(projectId, studentId);
      expect(report.project.id).toBe(projectId);
      expect(report.student.fullName).toBe("Fulan bin Fulan");
      expect(report.targetsWithAssessment).toHaveLength(2);
      expect(report.targetsWithAssessment[0].assessment?.predicate).toBe("BSH");
    });

    it("calculates project recap counts", async () => {
      const recap = await service.getProjectRecap(projectId);
      expect(recap.totalStudents).toBe(1);
      expect(recap.overallCounts.BSH).toBe(1);
      expect(recap.overallCounts.total).toBe(1);
    });
  });

  describe("PDF Generator", () => {
    it("generates valid PDF buffer from report data", () => {
      const reportData: StudentP5raReportData = {
        project: mockProject,
        student: mockStudent,
        classroom: mockClassroom,
        academicYear: mockAcademicYear,
        semester: mockSemester,
        institution: mockInstitution,
        targetsWithAssessment: [
          { target: mockTarget1, assessment: mockAssessment1 },
          { target: mockTarget2, assessment: null },
        ],
        processNotes: mockStudentNote,
        dateGenerated: "10 November 2026",
      };

      const buffer = generateP5raReportPdf(reportData);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(100);
      expect(buffer.toString("utf-8")).toContain("%PDF-1.4");
      expect(buffer.toString("utf-8")).toContain("RAPOR PROJEK PENGUATAN PROFIL PELAJAR PANCASILA");
    });
  });
});
