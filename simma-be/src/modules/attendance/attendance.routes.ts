import type { FastifyPluginAsync } from "fastify";
import type { Role } from "@simma/shared";
import { authenticate, requireRoles } from "../../core/auth/index.js";
import { attendanceController } from "./attendance.controller.js";

const allowedRoles: Role[] = [
  "super_admin",
  "operator",
  "admin_tu",
  "kepala_madrasah",
  "waka_kesiswaan",
  "wali_kelas",
  "guru",
  "guru_mapel",
  "guru_diniyah",
];

const teacherAttendanceManageRoles: Role[] = [
  "super_admin",
  "operator",
  "admin_tu",
  "kepala_madrasah",
];

export const attendanceRoutes: FastifyPluginAsync = async (app) => {
  // Global auth & role guard for all attendance endpoints
  app.addHook("preHandler", authenticate);
  app.addHook("preHandler", requireRoles(...allowedRoles));

  // --- Bulk Endpoints ---
  app.post("/bulk", attendanceController.bulkRecordStudents);
  app.patch("/bulk", attendanceController.bulkRecordStudents);
  app.post("/students/bulk", attendanceController.bulkRecordStudents);
  app.post(
    "/teachers/bulk",
    { preHandler: [requireRoles(...teacherAttendanceManageRoles)] },
    attendanceController.bulkRecordTeachers,
  );

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
  app.get(
    "/teachers",
    { preHandler: [requireRoles(...teacherAttendanceManageRoles)] },
    attendanceController.getTeacherAttendances,
  );
  app.post(
    "/teachers",
    { preHandler: [requireRoles(...teacherAttendanceManageRoles)] },
    attendanceController.recordTeacher,
  );
  app.get(
    "/teachers/:id",
    { preHandler: [requireRoles(...teacherAttendanceManageRoles)] },
    attendanceController.getTeacherAttendanceById,
  );
  app.patch(
    "/teachers/:id",
    { preHandler: [requireRoles(...teacherAttendanceManageRoles)] },
    attendanceController.updateTeacherAttendance,
  );
  app.delete(
    "/teachers/:id",
    { preHandler: [requireRoles(...teacherAttendanceManageRoles)] },
    attendanceController.deleteTeacherAttendance,
  );

  // --- Root student attendance shortcuts ---
  app.get("/", attendanceController.getStudentAttendances);
  app.post("/", attendanceController.recordStudent);
  app.get("/:id", attendanceController.getStudentAttendanceById);
  app.patch("/:id", attendanceController.updateStudentAttendance);
  app.delete("/:id", attendanceController.deleteStudentAttendance);
};
