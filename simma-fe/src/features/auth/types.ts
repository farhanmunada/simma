import type { UserRole, AuthUser } from "../../stores/auth.store";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user: {
    id: string;
    email?: string;
    username?: string;
    fullName?: string;
    role: UserRole;
    secondaryRoles?: UserRole[];
    teacherId?: string | null;
    avatarUrl?: string | null;
  };
}

export interface TeacherScopeData {
  teacherId: string | null;
  homeroomClassroomIds: string[];
  subjectAssignments: Array<{ classroomId: string; subjectId: string }>;
  assignedClassroomIds: string[];
  extracurricularIds: string[];
  tahfidzClassroomIds: string[];
  mutabaahClassroomIds: string[];
  p5raClassroomIds: string[];
  p5raProjectIds: string[];
}

export type { UserRole, AuthUser };
