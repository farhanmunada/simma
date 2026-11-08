import type { FastifyPluginAsync } from "fastify";
import { authenticate, requireRoles } from "../../core/auth/index.js";
import { studentsController } from "./students.controller.js";

export const studentRoutes: FastifyPluginAsync = async (app) => {
  const readAuthGuard = {
    preHandler: [
      authenticate,
      requireRoles(
        "super_admin",
        "admin_tu",
        "kepala_madrasah",
        "waka_kurikulum",
        "waka_kesiswaan",
        "guru_mapel",
        "wali_kelas",
      ),
    ],
  };

  const writeAuthGuard = {
    preHandler: [authenticate, requireRoles("super_admin", "admin_tu")],
  };

  // Student CRUD
  app.get("/", readAuthGuard, studentsController.getStudents);
  app.get("/:id", readAuthGuard, studentsController.getStudentById);
  app.post("/", writeAuthGuard, studentsController.createStudent);
  app.patch("/:id", writeAuthGuard, studentsController.updateStudent);
  app.delete("/:id", writeAuthGuard, studentsController.deleteStudent);

  // Student Parents
  app.get("/:id/parents", readAuthGuard, studentsController.getStudentParents);
  app.post("/:id/parents", writeAuthGuard, studentsController.addStudentParent);

  // Class assignment
  app.post("/assign-classroom", writeAuthGuard, studentsController.assignClassroom);
};
