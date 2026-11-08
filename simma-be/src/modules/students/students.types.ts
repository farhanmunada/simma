import type {
  Student,
  NewStudent,
  Parent,
  NewParent,
  StudentParent,
  NewStudentParent,
  ClassStudent,
  NewClassStudent,
} from "../../db/schema/students.js";

export type {
  Student,
  NewStudent,
  Parent,
  NewParent,
  StudentParent,
  NewStudentParent,
  ClassStudent,
  NewClassStudent,
};

export interface StudentParentDetail extends Parent {
  relationType: string;
  isGuardian: boolean;
}

export interface StudentWithClassroom extends Student {
  classroom?: {
    id: string;
    name: string;
    gradeLevel: number;
  } | null;
}
