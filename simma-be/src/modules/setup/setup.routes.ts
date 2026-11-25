import type { FastifyPluginAsync } from "fastify";
import type { Role } from "@simma/shared";
import { authenticate, requireRoles } from "../../core/auth/index.js";
import { setupController } from "./setup.controller.js";

const readRoles: Role[] = [
  "super_admin",
  "operator",
  "admin_tu",
  "kepala_madrasah",
  "waka_kurikulum",
  "waka_kesiswaan",
  "wali_kelas",
  "guru",
  "guru_mapel",
  "guru_diniyah",
];

const writeRoles: Role[] = ["super_admin", "operator", "admin_tu"];

export const setupRoutes: FastifyPluginAsync = async (app) => {
  const readGuard = { preHandler: [authenticate, requireRoles(...readRoles)] };
  const writeGuard = { preHandler: [authenticate, requireRoles(...writeRoles)] };

  // Institutions
  app.get("/institution", readGuard, setupController.getInstitution);
  app.get("/institutions", readGuard, setupController.getInstitution);
  app.get("/institutions/:id", readGuard, setupController.getInstitutionById);
  app.post("/institution", writeGuard, setupController.createInstitution);
  app.post("/institutions", writeGuard, setupController.createInstitution);
  app.patch("/institution", writeGuard, setupController.updateInstitution);
  app.patch("/institutions/:id", writeGuard, setupController.updateInstitution);

  // Academic Years
  app.get("/academic-years", readGuard, setupController.getAcademicYears);
  app.get("/academic-years/:id", readGuard, setupController.getAcademicYearById);
  app.post("/academic-years", writeGuard, setupController.createAcademicYear);
  app.patch("/academic-years/:id", writeGuard, setupController.updateAcademicYear);
  app.delete("/academic-years/:id", writeGuard, setupController.deleteAcademicYear);
  app.patch("/academic-years/:id/set-active", writeGuard, setupController.setActiveAcademicYear);
  app.patch("/academic-years/:id/status", writeGuard, setupController.setActiveAcademicYear);

  // Semesters
  app.get("/semesters", readGuard, setupController.getSemesters);
  app.get("/semesters/:id", readGuard, setupController.getSemesterById);
  app.post("/semesters", writeGuard, setupController.createSemester);
  app.patch("/semesters/:id", writeGuard, setupController.updateSemester);
  app.delete("/semesters/:id", writeGuard, setupController.deleteSemester);
  app.patch("/semesters/:id/set-active", writeGuard, setupController.setActiveSemester);
  app.patch("/semesters/:id/status", writeGuard, setupController.setActiveSemester);

  // Classrooms
  app.get("/classrooms", readGuard, setupController.getClassrooms);
  app.get("/classrooms/:id", readGuard, setupController.getClassroomById);
  app.post("/classrooms", writeGuard, setupController.createClassroom);
  app.patch("/classrooms/:id", writeGuard, setupController.updateClassroom);
  app.delete("/classrooms/:id", writeGuard, setupController.deleteClassroom);

  // Subjects
  app.get("/subjects", readGuard, setupController.getSubjects);
  app.get("/subjects/:id", readGuard, setupController.getSubjectById);
  app.post("/subjects", writeGuard, setupController.createSubject);
  app.patch("/subjects/:id", writeGuard, setupController.updateSubject);
  app.delete("/subjects/:id", writeGuard, setupController.deleteSubject);

  // Teachers
  app.get("/teachers", readGuard, setupController.getTeachers);
  app.get("/teachers/:id", readGuard, setupController.getTeacherById);
  app.post("/teachers", writeGuard, setupController.createTeacher);
  app.patch("/teachers/:id", writeGuard, setupController.updateTeacher);
  app.delete("/teachers/:id", writeGuard, setupController.deleteTeacher);
};
