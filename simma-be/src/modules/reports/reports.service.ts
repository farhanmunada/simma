import { NotFoundError } from "../../core/errors/index.js";
import { calculateLetterGrade } from "@simma/shared";
import {
  ReportsRepository,
  reportsRepository,
} from "./reports.repository.js";
import { generateReportPdf } from "./reports.pdf.js";
import type {
  StudentReportCard,
  StudentReportGrade,
  ReportAttendanceSummary,
  ReportTahfidzSummary,
  StudentReportNotes,
  ClassroomLegger,
  LeggerStudentEntry,
  LeggerStudentGrade,
} from "./reports.types.js";
import type {
  ReportNotesBodyInput,
  LeggerQueryInput,
  ReportCardQueryInput,
} from "./reports.schema.js";

export class ReportsService {
  constructor(
    private readonly repo: ReportsRepository = reportsRepository,
  ) {}

  private getCompetencyDescription(score: number): string {
    if (score >= 85) {
      return "Menunjukkan penguasaan yang sangat baik dalam mencapai capaian pembelajaran.";
    }
    if (score >= 75) {
      return "Menunjukkan penguasaan yang baik dalam mencapai capaian pembelajaran, perlu penguatan minor.";
    }
    if (score >= 60) {
      return "Menunjukkan penguasaan yang cukup dalam mencapai capaian pembelajaran, perlu pendampingan.";
    }
    return "Perlu bimbingan dan remedial intensif dalam mencapai capaian pembelajaran.";
  }

  async getStudentReportCard(
    studentId: string,
    semesterId: string,
    query?: ReportCardQueryInput,
  ): Promise<StudentReportCard> {
    const student = await this.repo.findStudentById(studentId);
    if (!student) {
      throw new NotFoundError("Siswa", studentId);
    }

    const semData = await this.repo.findSemesterWithAcademicYear(semesterId);
    if (!semData) {
      throw new NotFoundError("Semester", semesterId);
    }
    const { semester, academicYear } = semData;

    const classData = await this.repo.findStudentClassroom(studentId, semesterId);
    const classroom = classData?.classroom ?? {
      id: "00000000-0000-0000-0000-000000000000",
      name: "Belum Ditentukan",
      gradeLevel: 10,
      semesterId,
      homeroomTeacherId: null,
      capacity: 36,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const homeroomTeacher = classData?.homeroomTeacher ?? null;

    const institution = (await this.repo.findFirstInstitution()) ?? {
      id: "00000000-0000-0000-0000-000000000000",
      name: "Madrasah Aliyah SIMMA",
      nsm: "131232040001",
      npsn: "69999999",
      status: "swasta",
      address: "Jl. Pendidikan Madrasah No. 1",
      logoPath: null,
      emisData: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 1. Grades
    const gradeRows = await this.repo.findStudentSemesterGrades(
      studentId,
      semesterId,
    );

    const grades: StudentReportGrade[] = gradeRows.map(({ grade, subject }) => {
      const letter =
        grade.letterGrade ?? calculateLetterGrade(grade.finalScore);
      return {
        subjectId: subject.id,
        subjectCode: subject.code,
        subjectName: subject.name,
        group: subject.group,
        finalScore: grade.finalScore,
        letterGrade: letter,
        description: this.getCompetencyDescription(grade.finalScore),
      };
    });

    const totalScore = grades.reduce((acc, g) => acc + g.finalScore, 0);
    const averageScore =
      grades.length > 0
        ? Math.round((totalScore / grades.length) * 100) / 100
        : 0;

    // 2. Attendance
    let attendance: ReportAttendanceSummary = {
      hadir: 0,
      izin: 0,
      sakit: 0,
      alpa: 0,
      total: 0,
      percentage: 100,
    };

    if (query?.includeAttendance !== false) {
      const attRows = await this.repo.findStudentAttendance(
        studentId,
        classroom.id !== "00000000-0000-0000-0000-000000000000"
          ? classroom.id
          : undefined,
      );
      let hadir = 0;
      let izin = 0;
      let sakit = 0;
      let alpa = 0;

      for (const row of attRows) {
        if (row.status === "hadir") hadir++;
        else if (row.status === "izin") izin++;
        else if (row.status === "sakit") sakit++;
        else if (row.status === "alpa") alpa++;
      }

      const total = hadir + izin + sakit + alpa;
      const percentage =
        total > 0 ? Math.round((hadir / total) * 10000) / 100 : 100;

      attendance = { hadir, izin, sakit, alpa, total, percentage };
    }

    // 3. Tahfidz
    let tahfidz: ReportTahfidzSummary = {
      totalJuz: 0,
      recordsCount: 0,
      lastSurah: null,
      passedExamsCount: 0,
    };

    if (query?.includeTahfidz !== false) {
      const tahfidzData = await this.repo.findStudentTahfidz(studentId);
      const passedJuzSet = new Set<number>();
      for (const rec of tahfidzData.records) {
        if (rec.status === "lulus") {
          passedJuzSet.add(rec.juz);
        }
      }
      const passedExams = tahfidzData.tasmiExams.filter(
        (e) => e.status === "lulus",
      );

      tahfidz = {
        totalJuz: passedJuzSet.size,
        recordsCount: tahfidzData.records.length,
        lastSurah:
          tahfidzData.records.length > 0
            ? `Surah ke-${tahfidzData.records[0].surah}`
            : null,
        passedExamsCount: passedExams.length,
      };
    }

    // 4. Notes & Attitudes
    const savedNotes = await this.repo.getStudentNotes(studentId, semesterId);
    const notes: StudentReportNotes = savedNotes ?? {
      teacherNotes:
        "Tingkatkan terus motivasi belajar dan pertahankan prestasi yang sudah diraih.",
      spiritualAttitude:
        "Selalu taat menjalankan ibadah dan berakhlak mulia di lingkungan madrasah.",
      socialAttitude:
        "Menunjukkan sikap santun, disiplin, peduli sesama, dan berjiwa gotong royong.",
      extracurriculars: [],
      achievements: [],
    };

    // 5. Rank in class
    let rankInClass: number | null = null;
    let totalStudentsInClass = 1;

    if (classroom.id !== "00000000-0000-0000-0000-000000000000") {
      const classStudentsList = await this.repo.findClassroomStudents(
        classroom.id,
      );
      totalStudentsInClass = Math.max(classStudentsList.length, 1);

      if (classStudentsList.length > 0) {
        const classGrades = await this.repo.findClassroomSemesterGrades(
          classroom.id,
          semesterId,
        );

        // Sum grades per student
        const studentSums = new Map<string, number>();
        for (const s of classStudentsList) {
          studentSums.set(s.id, 0);
        }
        for (const cg of classGrades) {
          const prev = studentSums.get(cg.grade.studentId) ?? 0;
          studentSums.set(cg.grade.studentId, prev + cg.grade.finalScore);
        }

        const sortedScores = Array.from(studentSums.entries()).sort(
          (a, b) => b[1] - a[1],
        );
        const foundRank = sortedScores.findIndex((entry) => entry[0] === studentId);
        if (foundRank !== -1) {
          rankInClass = foundRank + 1;
        }
      }
    }

    return {
      student: {
        id: student.id,
        fullName: student.fullName,
        nisn: student.nisn,
        nis: student.nis,
        gender: student.gender,
        birthPlace: student.birthPlace,
        birthDate: student.birthDate,
      },
      institution: {
        name: institution.name,
        nsm: institution.nsm,
        npsn: institution.npsn,
        address: institution.address,
      },
      academicYear: {
        id: academicYear.id,
        name: academicYear.name,
      },
      semester: {
        id: semester.id,
        type: semester.type,
      },
      classroom: {
        id: classroom.id,
        name: classroom.name,
        gradeLevel: classroom.gradeLevel,
        homeroomTeacher: homeroomTeacher
          ? {
              id: homeroomTeacher.id,
              fullName: homeroomTeacher.fullName,
              nuptk: homeroomTeacher.nuptk,
            }
          : null,
      },
      grades,
      attendance,
      tahfidz,
      notes,
      summary: {
        totalScore,
        averageScore,
        rankInClass,
        totalStudentsInClass,
      },
    };
  }

  async getClassroomLegger(
    classroomId: string,
    semesterId: string,
    query?: LeggerQueryInput,
  ): Promise<ClassroomLegger> {
    const classData = await this.repo.findClassroomById(classroomId);
    if (!classData) {
      throw new NotFoundError("Kelas", classroomId);
    }
    const { classroom, homeroomTeacher } = classData;

    const semData = await this.repo.findSemesterWithAcademicYear(semesterId);
    if (!semData) {
      throw new NotFoundError("Semester", semesterId);
    }
    const { semester, academicYear } = semData;

    const studentsList = await this.repo.findClassroomStudents(classroomId);
    const gradeRows = await this.repo.findClassroomSemesterGrades(
      classroomId,
      semesterId,
    );
    const attendanceRows = await this.repo.findClassroomAttendance(classroomId);

    // Collect distinct subjects
    const subjectMap = new Map<
      string,
      { id: string; code: string; name: string; group: string }
    >();
    for (const row of gradeRows) {
      if (!subjectMap.has(row.subject.id)) {
        subjectMap.set(row.subject.id, {
          id: row.subject.id,
          code: row.subject.code,
          name: row.subject.name,
          group: row.subject.group,
        });
      }
    }
    const subjects = Array.from(subjectMap.values());

    // Group grades and attendance by studentId
    const gradesByStudent = new Map<string, LeggerStudentGrade[]>();
    for (const row of gradeRows) {
      const studentGrades = gradesByStudent.get(row.grade.studentId) ?? [];
      studentGrades.push({
        subjectId: row.subject.id,
        subjectCode: row.subject.code,
        score: row.grade.finalScore,
        letterGrade:
          row.grade.letterGrade ?? calculateLetterGrade(row.grade.finalScore),
      });
      gradesByStudent.set(row.grade.studentId, studentGrades);
    }

    const attendanceByStudent = new Map<
      string,
      { hadir: number; izin: number; sakit: number; alpa: number }
    >();
    for (const att of attendanceRows) {
      const current = attendanceByStudent.get(att.studentId) ?? {
        hadir: 0,
        izin: 0,
        sakit: 0,
        alpa: 0,
      };
      if (att.status === "hadir") current.hadir++;
      else if (att.status === "izin") current.izin++;
      else if (att.status === "sakit") current.sakit++;
      else if (att.status === "alpa") current.alpa++;
      attendanceByStudent.set(att.studentId, current);
    }

    // Build raw entries
    const entries: LeggerStudentEntry[] = studentsList.map((st) => {
      const sGrades = gradesByStudent.get(st.id) ?? [];
      const totalScore = sGrades.reduce((sum, g) => sum + g.score, 0);
      const averageScore =
        sGrades.length > 0
          ? Math.round((totalScore / sGrades.length) * 100) / 100
          : 0;
      const att = attendanceByStudent.get(st.id) ?? {
        hadir: 0,
        izin: 0,
        sakit: 0,
        alpa: 0,
      };

      return {
        studentId: st.id,
        fullName: st.fullName,
        nisn: st.nisn,
        nis: st.nis,
        gender: st.gender,
        grades: sGrades,
        totalScore,
        averageScore,
        rank: 0,
        attendance: att,
      };
    });

    // Compute ranks based on totalScore descending
    entries.sort((a, b) => b.totalScore - a.totalScore);
    entries.forEach((e, idx) => {
      e.rank = idx + 1;
    });

    // Custom sorting if requested
    const sortBy = query?.sortBy ?? "rank";
    const order = query?.order ?? "asc";
    const multiplier = order === "desc" ? -1 : 1;

    if (sortBy === "name") {
      entries.sort(
        (a, b) => a.fullName.localeCompare(b.fullName) * multiplier,
      );
    } else if (sortBy === "nisn") {
      entries.sort(
        (a, b) =>
          (a.nisn ?? "").localeCompare(b.nisn ?? "") * multiplier,
      );
    } else if (sortBy === "totalScore") {
      entries.sort((a, b) => (a.totalScore - b.totalScore) * multiplier);
    } else if (sortBy === "rank" && order === "desc") {
      entries.sort((a, b) => (b.rank - a.rank));
    }

    // Statistics
    const totalStudents = entries.length;
    const allAverages = entries.map((e) => e.averageScore);
    const allTotals = entries.map((e) => e.totalScore);

    const classAverage =
      totalStudents > 0
        ? Math.round(
            (allAverages.reduce((sum, val) => sum + val, 0) / totalStudents) *
              100,
          ) / 100
        : 0;
    const highestScore =
      allTotals.length > 0 ? Math.max(...allTotals) : 0;
    const lowestScore =
      allTotals.length > 0 ? Math.min(...allTotals) : 0;

    return {
      classroom: {
        id: classroom.id,
        name: classroom.name,
        gradeLevel: classroom.gradeLevel,
        homeroomTeacher: homeroomTeacher
          ? {
              id: homeroomTeacher.id,
              fullName: homeroomTeacher.fullName,
              nuptk: homeroomTeacher.nuptk,
            }
          : null,
      },
      academicYear: {
        id: academicYear.id,
        name: academicYear.name,
      },
      semester: {
        id: semester.id,
        type: semester.type,
      },
      subjects,
      students: entries,
      classStatistics: {
        totalStudents,
        classAverage,
        highestScore,
        lowestScore,
      },
    };
  }

  async getStudentReportPdf(
    studentId: string,
    semesterId: string,
  ): Promise<Buffer> {
    const reportCard = await this.getStudentReportCard(studentId, semesterId);
    return generateReportPdf(reportCard);
  }

  async saveStudentNotes(
    studentId: string,
    input: ReportNotesBodyInput,
  ): Promise<StudentReportNotes> {
    const student = await this.repo.findStudentById(studentId);
    if (!student) {
      throw new NotFoundError("Siswa", studentId);
    }

    const sem = await this.repo.findSemesterWithAcademicYear(input.semesterId);
    if (!sem) {
      throw new NotFoundError("Semester", input.semesterId);
    }

    return this.repo.saveStudentNotes(studentId, input);
  }
}

export const reportsService = new ReportsService();
