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
} from "../../db/schema/setup";
import type { SetupQueryInput } from "@simma/shared";

export type {
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
  SetupQueryInput,
};

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}
