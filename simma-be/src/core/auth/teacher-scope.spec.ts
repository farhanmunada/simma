import { describe, it, expect, vi } from "vitest";
import { TeacherScopeService } from "./teacher-scope.service.js";
import { ForbiddenError } from "../errors/app-error.js";
import type { JwtAuthPayload } from "./jwt.js";

describe("TeacherScopeService (Strict Data Scoping)", () => {
  const service = new TeacherScopeService();

  const waliUser: JwtAuthPayload = {
    sub: "u-wali",
    username: "2101",
    role: "wali_kelas",
    secondaryRoles: ["guru_mapel"],
    teacherId: "t-wali",
  };

  const operatorUser: JwtAuthPayload = {
    sub: "u-op",
    username: "1001",
    role: "operator",
    secondaryRoles: [],
    teacherId: "t-op",
  };

  it("allows operator and super_admin to bypass data-level scoping", async () => {
    await expect(service.assertHomeroomClassroom(operatorUser, "class-other")).resolves.toBeUndefined();
    await expect(
      service.assertSubjectClassroom(operatorUser, "class-other", "subj-other"),
    ).resolves.toBeUndefined();
    await expect(service.assertExtracurricular(operatorUser, "ekskul-other")).resolves.toBeUndefined();
  });

  it("enforces homeroom classroom ownership and throws 403 for non-assigned class", async () => {
    vi.spyOn(service, "getScopeForUser").mockResolvedValue({
      teacherId: "t-wali",
      homeroomClassroomIds: ["class-xa"],
      subjectAssignments: [{ classroomId: "class-xa", subjectId: "subj-fiqih" }],
      assignedClassroomIds: ["class-xa"],
      extracurricularIds: ["ekskul-pramuka"],
      tahfidzClassroomIds: ["class-xa"],
      mutabaahClassroomIds: ["class-xa"],
      p5raClassroomIds: ["class-xa"],
      p5raProjectIds: [],
    });

    await expect(service.assertHomeroomClassroom(waliUser, "class-xa")).resolves.toBeUndefined();
    await expect(service.assertHomeroomClassroom(waliUser, "class-xb")).rejects.toThrow(ForbiddenError);

    await expect(
      service.assertSubjectClassroom(waliUser, "class-xa", "subj-fiqih"),
    ).resolves.toBeUndefined();
    await expect(
      service.assertSubjectClassroom(waliUser, "class-xb", "subj-fiqih"),
    ).rejects.toThrow(ForbiddenError);

    await expect(service.assertExtracurricular(waliUser, "ekskul-pramuka")).resolves.toBeUndefined();
    await expect(service.assertExtracurricular(waliUser, "ekskul-futsal")).rejects.toThrow(ForbiddenError);
  });
});
