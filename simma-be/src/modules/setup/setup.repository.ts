import {
  institutionRepository,
  InstitutionRepository,
} from "./repositories/institution.repository.js";
import {
  academicYearsRepository,
  AcademicYearsRepository,
} from "./repositories/academic-years.repository.js";
import {
  semestersRepository,
  SemestersRepository,
} from "./repositories/semesters.repository.js";
import {
  classroomsRepository,
  ClassroomsRepository,
} from "./repositories/classrooms.repository.js";
import {
  subjectsRepository,
  SubjectsRepository,
} from "./repositories/subjects.repository.js";
import {
  teachersRepository,
  TeachersRepository,
} from "./repositories/teachers.repository.js";
import type {
  Institution,
  NewInstitution,
  AcademicYear,
  NewAcademicYear,
  Semester,
  NewSemester,
  Classroom,
  NewClassroom,
  Subject,
  NewSubject,
  Teacher,
  NewTeacher,
} from "./setup.types.js";

export {
  InstitutionRepository,
  AcademicYearsRepository,
  SemestersRepository,
  ClassroomsRepository,
  SubjectsRepository,
  TeachersRepository,
};

export class SetupRepository {
  constructor(
    public readonly institutions: InstitutionRepository = institutionRepository,
    public readonly academicYears: AcademicYearsRepository = academicYearsRepository,
    public readonly semesters: SemestersRepository = semestersRepository,
    public readonly classrooms: ClassroomsRepository = classroomsRepository,
    public readonly subjects: SubjectsRepository = subjectsRepository,
    public readonly teachers: TeachersRepository = teachersRepository,
  ) {}

  // --- Institutions ---
  async findFirstInstitution(): Promise<Institution | null> {
    return this.institutions.findFirstInstitution();
  }

  async findInstitutionById(id: string): Promise<Institution | null> {
    return this.institutions.findInstitutionById(id);
  }

  async createInstitution(data: NewInstitution): Promise<Institution> {
    return this.institutions.createInstitution(data);
  }

  async updateInstitution(
    id: string,
    data: Partial<NewInstitution>,
  ): Promise<Institution | null> {
    return this.institutions.updateInstitution(id, data);
  }

  // --- Academic Years ---
  async findAcademicYears(params: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
  }): Promise<{ data: AcademicYear[]; total: number }> {
    return this.academicYears.findAcademicYears(params);
  }

  async findAcademicYearById(id: string): Promise<AcademicYear | null> {
    return this.academicYears.findAcademicYearById(id);
  }

  async createAcademicYear(data: NewAcademicYear): Promise<AcademicYear> {
    return this.academicYears.createAcademicYear(data);
  }

  async updateAcademicYear(
    id: string,
    data: Partial<NewAcademicYear>,
  ): Promise<AcademicYear | null> {
    return this.academicYears.updateAcademicYear(id, data);
  }

  async deleteAcademicYear(id: string): Promise<boolean> {
    return this.academicYears.deleteAcademicYear(id);
  }

  async setActiveAcademicYear(id: string): Promise<AcademicYear | null> {
    return this.academicYears.setActiveAcademicYear(id);
  }

  // --- Semesters ---
  async findSemesters(params: {
    page: number;
    limit: number;
    academicYearId?: string;
    isActive?: boolean;
  }): Promise<{ data: Semester[]; total: number }> {
    return this.semesters.findSemesters(params);
  }

  async findSemesterById(id: string): Promise<Semester | null> {
    return this.semesters.findSemesterById(id);
  }

  async createSemester(data: NewSemester): Promise<Semester> {
    return this.semesters.createSemester(data);
  }

  async updateSemester(
    id: string,
    data: Partial<NewSemester>,
  ): Promise<Semester | null> {
    return this.semesters.updateSemester(id, data);
  }

  async deleteSemester(id: string): Promise<boolean> {
    return this.semesters.deleteSemester(id);
  }

  async setActiveSemester(id: string): Promise<Semester | null> {
    return this.semesters.setActiveSemester(id);
  }

  // --- Classrooms ---
  async findClassrooms(params: {
    page: number;
    limit: number;
    semesterId?: string;
    gradeLevel?: number;
    search?: string;
  }): Promise<{ data: Classroom[]; total: number }> {
    return this.classrooms.findClassrooms(params);
  }

  async findClassroomById(id: string): Promise<Classroom | null> {
    return this.classrooms.findClassroomById(id);
  }

  async createClassroom(data: NewClassroom): Promise<Classroom> {
    return this.classrooms.createClassroom(data);
  }

  async updateClassroom(
    id: string,
    data: Partial<NewClassroom>,
  ): Promise<Classroom | null> {
    return this.classrooms.updateClassroom(id, data);
  }

  async deleteClassroom(id: string): Promise<boolean> {
    return this.classrooms.deleteClassroom(id);
  }

  // --- Subjects ---
  async findSubjects(params: {
    page: number;
    limit: number;
    phase?: string;
    group?: string;
    search?: string;
  }): Promise<{ data: Subject[]; total: number }> {
    return this.subjects.findSubjects(params);
  }

  async findSubjectById(id: string): Promise<Subject | null> {
    return this.subjects.findSubjectById(id);
  }

  async findSubjectByCode(code: string): Promise<Subject | null> {
    return this.subjects.findSubjectByCode(code);
  }

  async createSubject(data: NewSubject): Promise<Subject> {
    return this.subjects.createSubject(data);
  }

  async updateSubject(
    id: string,
    data: Partial<NewSubject>,
  ): Promise<Subject | null> {
    return this.subjects.updateSubject(id, data);
  }

  async deleteSubject(id: string): Promise<boolean> {
    return this.subjects.deleteSubject(id);
  }

  // --- Teachers ---
  async findTeachers(params: {
    page: number;
    limit: number;
    search?: string;
    employmentType?: string;
    includeDeleted?: boolean;
  }): Promise<{ data: Teacher[]; total: number }> {
    return this.teachers.findTeachers(params);
  }

  async findTeacherById(
    id: string,
    includeDeleted = false,
  ): Promise<Teacher | null> {
    return this.teachers.findTeacherById(id, includeDeleted);
  }

  async findTeacherByNik(nik: string): Promise<Teacher | null> {
    return this.teachers.findTeacherByNik(nik);
  }

  async createTeacher(data: NewTeacher): Promise<Teacher> {
    return this.teachers.createTeacher(data);
  }

  async updateTeacher(
    id: string,
    data: Partial<NewTeacher>,
  ): Promise<Teacher | null> {
    return this.teachers.updateTeacher(id, data);
  }

  async softDeleteTeacher(id: string): Promise<boolean> {
    return this.teachers.softDeleteTeacher(id);
  }
}

export const setupRepository = new SetupRepository();
