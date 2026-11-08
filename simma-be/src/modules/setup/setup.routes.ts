import type { FastifyPluginAsync } from "fastify";
import { setupController } from "./setup.controller.js";

export const setupRoutes: FastifyPluginAsync = async (app) => {
  // Institutions
  app.get("/institutions", setupController.getInstitution);
  app.get("/institutions/:id", setupController.getInstitutionById);
  app.post("/institutions", setupController.createInstitution);
  app.patch("/institutions/:id", setupController.updateInstitution);

  // Academic Years
  app.get("/academic-years", setupController.getAcademicYears);
  app.get("/academic-years/:id", setupController.getAcademicYearById);
  app.post("/academic-years", setupController.createAcademicYear);
  app.patch("/academic-years/:id", setupController.updateAcademicYear);
  app.delete("/academic-years/:id", setupController.deleteAcademicYear);
  app.patch(
    "/academic-years/:id/set-active",
    setupController.setActiveAcademicYear,
  );

  // Semesters
  app.get("/semesters", setupController.getSemesters);
  app.get("/semesters/:id", setupController.getSemesterById);
  app.post("/semesters", setupController.createSemester);
  app.patch("/semesters/:id", setupController.updateSemester);
  app.delete("/semesters/:id", setupController.deleteSemester);
  app.patch("/semesters/:id/set-active", setupController.setActiveSemester);

  // Classrooms
  app.get("/classrooms", setupController.getClassrooms);
  app.get("/classrooms/:id", setupController.getClassroomById);
  app.post("/classrooms", setupController.createClassroom);
  app.patch("/classrooms/:id", setupController.updateClassroom);
  app.delete("/classrooms/:id", setupController.deleteClassroom);

  // Subjects
  app.get("/subjects", setupController.getSubjects);
  app.get("/subjects/:id", setupController.getSubjectById);
  app.post("/subjects", setupController.createSubject);
  app.patch("/subjects/:id", setupController.updateSubject);
  app.delete("/subjects/:id", setupController.deleteSubject);

  // Teachers
  app.get("/teachers", setupController.getTeachers);
  app.get("/teachers/:id", setupController.getTeacherById);
  app.post("/teachers", setupController.createTeacher);
  app.patch("/teachers/:id", setupController.updateTeacher);
  app.delete("/teachers/:id", setupController.deleteTeacher);
};
