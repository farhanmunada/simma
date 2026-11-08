import type { FastifyPluginAsync } from "fastify";
import { authenticate, requireRoles } from "../../core/auth/index.js";
import { setupController } from "./setup.controller.js";

export const setupRoutes: FastifyPluginAsync = async (app) => {
  const authGuard = {
    preHandler: [authenticate, requireRoles("super_admin", "admin_tu")],
  };

  // Institutions
  app.get("/institutions", authGuard, setupController.getInstitution);
  app.get("/institutions/:id", authGuard, setupController.getInstitutionById);
  app.post("/institutions", authGuard, setupController.createInstitution);
  app.patch("/institutions/:id", authGuard, setupController.updateInstitution);

  // Academic Years
  app.get("/academic-years", authGuard, setupController.getAcademicYears);
  app.get("/academic-years/:id", authGuard, setupController.getAcademicYearById);
  app.post("/academic-years", authGuard, setupController.createAcademicYear);
  app.patch("/academic-years/:id", authGuard, setupController.updateAcademicYear);
  app.delete("/academic-years/:id", authGuard, setupController.deleteAcademicYear);
  app.patch(
    "/academic-years/:id/set-active",
    authGuard,
    setupController.setActiveAcademicYear,
  );

  // Semesters
  app.get("/semesters", authGuard, setupController.getSemesters);
  app.get("/semesters/:id", authGuard, setupController.getSemesterById);
  app.post("/semesters", authGuard, setupController.createSemester);
  app.patch("/semesters/:id", authGuard, setupController.updateSemester);
  app.delete("/semesters/:id", authGuard, setupController.deleteSemester);
  app.patch("/semesters/:id/set-active", authGuard, setupController.setActiveSemester);

  // Classrooms
  app.get("/classrooms", authGuard, setupController.getClassrooms);
  app.get("/classrooms/:id", authGuard, setupController.getClassroomById);
  app.post("/classrooms", authGuard, setupController.createClassroom);
  app.patch("/classrooms/:id", authGuard, setupController.updateClassroom);
  app.delete("/classrooms/:id", authGuard, setupController.deleteClassroom);

  // Subjects
  app.get("/subjects", authGuard, setupController.getSubjects);
  app.get("/subjects/:id", authGuard, setupController.getSubjectById);
  app.post("/subjects", authGuard, setupController.createSubject);
  app.patch("/subjects/:id", authGuard, setupController.updateSubject);
  app.delete("/subjects/:id", authGuard, setupController.deleteSubject);

  // Teachers
  app.get("/teachers", authGuard, setupController.getTeachers);
  app.get("/teachers/:id", authGuard, setupController.getTeacherById);
  app.post("/teachers", authGuard, setupController.createTeacher);
  app.patch("/teachers/:id", authGuard, setupController.updateTeacher);
  app.delete("/teachers/:id", authGuard, setupController.deleteTeacher);
};
