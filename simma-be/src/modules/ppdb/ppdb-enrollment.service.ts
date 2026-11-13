import { getDb } from "../../core/database/client.js";
import { students, parents, studentParents } from "../../db/schema/students.js";
import type { PpdbRepository } from "./ppdb.repository.js";
import type { PpdbApplicant } from "./ppdb.types.js";
import {
  NotFoundError,
  ConflictError,
  ValidationError,
} from "../../core/errors/index.js";

export class PpdbEnrollmentService {
  constructor(private readonly ppdbRepo: PpdbRepository) {}

  async enrollToBukuInduk(id: string): Promise<{
    applicant: PpdbApplicant;
    studentId: string;
  }> {
    const applicant = await this.ppdbRepo.findById(id);
    if (!applicant) {
      throw new NotFoundError("Data calon siswa tidak ditemukan");
    }

    if (applicant.status !== "accepted") {
      throw new ValidationError(
        `Hanya calon siswa berstatus 'accepted' (diterima) yang dapat dipindahkan ke Buku Induk. Status saat ini: '${applicant.status}'`
      );
    }

    if (applicant.studentId) {
      throw new ConflictError(
        `Calon siswa sudah terdaftar di Buku Induk Siswa (ID Siswa: ${applicant.studentId})`
      );
    }

    const db = getDb();

    return db.transaction(async (tx) => {
      const [newStudent] = await tx
        .insert(students)
        .values({
          fullName: applicant.fullName,
          nik: applicant.nik,
          nisn: applicant.nisn || null,
          birthPlace: applicant.birthPlace,
          birthDate: applicant.birthDate,
          gender: applicant.gender,
          motherName: applicant.motherName,
          status: "aktif",
        })
        .returning();

      if (applicant.motherName) {
        const [mother] = await tx
          .insert(parents)
          .values({
            name: applicant.motherName,
            phone: applicant.motherPhone || null,
          })
          .returning();

        await tx.insert(studentParents).values({
          studentId: newStudent.id,
          parentId: mother.id,
          relationType: "ibu",
          isGuardian: true,
        });
      }

      if (applicant.fatherName) {
        const [father] = await tx
          .insert(parents)
          .values({
            name: applicant.fatherName,
            phone: applicant.fatherPhone || null,
          })
          .returning();

        await tx.insert(studentParents).values({
          studentId: newStudent.id,
          parentId: father.id,
          relationType: "ayah",
          isGuardian: !applicant.motherName,
        });
      }

      const updatedApplicant = await this.ppdbRepo.setEnrolled(
        id,
        newStudent.id
      );

      return {
        applicant: updatedApplicant!,
        studentId: newStudent.id,
      };
    });
  }
}
