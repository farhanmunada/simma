import type { FastifyPluginAsync } from "fastify";
import type { Role } from "@simma/shared";
import { authenticate, requireRoles } from "../../core/auth/index.js";
import { attendanceController } from "./attendance.controller.js";

const allowedRoles: Role[] = [
  "super_admin",
  "admin_tu",
  "wali_kelas",
  "guru",
  "guru_mapel",
];

export const attendanceRoutes: FastifyPluginAsync = async (app) => {
  // Global auth & role guard for all attendance endpoints
  app.addHook("preHandler", authenticate);
  app.addHook("preHandler", requireRoles(...allowedRoles));

  // --- Bulk Endpoints ---
  app.post("/bulk", attendanceController.bulkRecordStudents);
  app.patch("/bulk", attendanceController.bulkRecordStudents);
  app.post("/students/bulk", attendanceController.bulkRecordStudents);
  app.post("/teachers/bulk", attendanceController.bulkRecordTeachers);

  // --- Classroom & Summary Endpoints ---
  app.get(
    "/classroom/:classId/date/:date",
    attendanceController.getClassroomAttendance,
  );
  app.get(
    "/student/:studentId/summary",
    attendanceController.getStudentSummary,
  );
  app.get(
    "/teacher/:teacherId/summary",
    attendanceController.getTeacherSummary,
  );

  // --- Student Attendance CRUD ---
  app.get("/students", attendanceController.getStudentAttendances);
  app.post("/students", attendanceController.recordStudent);
  app.get("/students/:id", attendanceController.getStudentAttendanceById);
  app.patch("/students/:id", attendanceController.updateStudentAttendance);
  app.delete("/students/:id", attendanceController.deleteStudentAttendance);

  // --- Teacher Attendance CRUD ---
  app.get("/teachers", attendanceController.getTeacherAttendances);
  app.post("/teachers", attendanceController.recordTeacher);
  app.get("/teachers/:id", attendanceController.getTeacherAttendanceById);
  app.patch("/teachers/:id", attendanceController.updateTeacherAttendance);
  app.delete("/teachers/:id", attendanceController.deleteTeacherAttendance);

  // --- Root student attendance shortcuts ---
  app.get("/", attendanceController.getStudentAttendances);
  app.post("/", attendanceController.recordStudent);
  app.get("/:id", attendanceController.getStudentAttendanceById);
  app.patch("/:id", attendanceController.updateStudentAttendance);
  app.delete("/:id", attendanceController.deleteStudentAttendance);
};
