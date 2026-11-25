import type {
  Role,
  EmploymentType,
  GtkType,
  DutyStatus,
  TeacherScopeType,
} from "@simma/shared";
import type { TeacherFullDetailDto, TeacherListItem } from "../../types";
import type { TeacherAccountFormState } from "./TeacherAccountTab";
import type { TeacherIdentityFormState } from "./TeacherIdentityTab";
import type { TeacherBioFormState } from "./TeacherBioFormTab";
import type { TeacherEnrolmentFormState } from "./TeacherEnrolmentTab";

export const DEFAULT_ACCOUNT: TeacherAccountFormState = {
  primaryRole: "guru_mapel",
  secondaryRoles: [],
  employeeCode: "",
  isActive: true,
};

export const DEFAULT_IDENTITY: TeacherIdentityFormState = {
  fullName: "",
  positionId: "",
  nik: "",
  nuptk: "",
  employmentType: "GTY",
  gtkType: "pendidik",
  dutyStatus: "aktif",
  nip: "",
  nrg: "",
  pegId: "",
  certification: "",
  certificationField: "",
  tmtFirst: "",
  tmtPns: "",
};

export const DEFAULT_BIO: TeacherBioFormState = {
  noKk: "",
  birthPlace: "",
  birthDate: "",
  gender: "L",
  religion: "Islam",
  marriageStatus: "menikah",
  phone: "",
  email: "",
  address: "",
};

export const DEFAULT_ENROLMENT: TeacherEnrolmentFormState = {
  homeroomClassroomId: "",
  subjectAssignments: [],
  extracurricularIds: [],
  classroomScopes: [],
};

export function mapTeacherToFormStates(src: TeacherFullDetailDto | TeacherListItem) {
  const p = src.profile;
  const acc = src.account;
  const asg = src.assignments;

  const account: TeacherAccountFormState = {
    primaryRole: (acc?.role ?? "guru_mapel") as Role,
    secondaryRoles: (acc?.secondaryRoles ?? []) as Role[],
    employeeCode: src.employeeCode ?? acc?.username ?? "",
    isActive: acc?.isActive ?? true,
  };

  const identity: TeacherIdentityFormState = {
    fullName: src.fullName ?? "",
    positionId: src.positionId ?? "",
    nik: src.nik ?? "",
    nuptk: src.nuptk ?? "",
    employmentType: (src.employmentType ?? "GTY") as EmploymentType,
    gtkType: (p?.gtkType ?? "pendidik") as GtkType,
    dutyStatus: (p?.dutyStatus ?? "aktif") as DutyStatus,
    nip: p?.nip ?? "",
    nrg: p?.nrg ?? "",
    pegId: p?.pegId ?? "",
    certification: src.certification ?? "",
    certificationField: p?.certificationField ?? "",
    tmtFirst: p?.tmtFirst ?? "",
    tmtPns: p?.tmtPns ?? "",
  };

  const bio: TeacherBioFormState = {
    noKk: p?.noKk ?? "",
    birthPlace: p?.birthPlace ?? "",
    birthDate: p?.birthDate ?? "",
    gender: ((p?.gender ?? "L") as "L" | "P"),
    religion: p?.religion ?? "Islam",
    marriageStatus: ((p?.marriageStatus ?? "menikah") as "menikah" | "belum_menikah" | "duda_janda"),
    phone: p?.phone ?? "",
    email: p?.email ?? "",
    address: p?.address ?? "",
  };

  const enrolment: TeacherEnrolmentFormState = {
    homeroomClassroomId: asg?.homeroomClassroomId ?? "",
    subjectAssignments: (asg?.subjectAssignments ?? []).map((item) => ({
      classroomId: item.classroomId,
      subjectId: item.subjectId,
    })),
    extracurricularIds: asg?.extracurricularIds ?? [],
    classroomScopes: (asg?.classroomScopes ?? []).map((item) => ({
      classroomId: item.classroomId,
      scopeType: item.scopeType as TeacherScopeType,
    })),
  };

  return { account, identity, bio, enrolment };
}

export function buildTeacherSubmitPayload(
  account: TeacherAccountFormState,
  identity: TeacherIdentityFormState,
  bio: TeacherBioFormState,
  enrolment: TeacherEnrolmentFormState,
) {
  return {
    fullName: identity.fullName.trim(),
    employeeCode: account.employeeCode,
    positionId: identity.positionId || undefined,
    nik: identity.nik || undefined,
    nuptk: identity.nuptk || undefined,
    employmentType: identity.employmentType,
    gtkType: identity.gtkType,
    dutyStatus: identity.dutyStatus,
    certification: identity.certification || undefined,
    gender: bio.gender,
    birthPlace: bio.birthPlace || undefined,
    birthDate: bio.birthDate || undefined,
    address: bio.address || undefined,
    phone: bio.phone || undefined,
    email: bio.email || undefined,
    profile: {
      noKk: bio.noKk || undefined,
      religion: bio.religion || undefined,
      marriageStatus: bio.marriageStatus,
      nip: identity.nip || undefined,
      nrg: identity.nrg || undefined,
      pegId: identity.pegId || undefined,
      certificationField: identity.certificationField || undefined,
      tmtFirst: identity.tmtFirst || undefined,
      tmtPns: identity.tmtPns || undefined,
    },
    account: {
      createAccount: true,
      role: account.primaryRole,
      secondaryRoles: account.secondaryRoles,
      employeeCode: account.employeeCode,
      isActive: account.isActive,
    },
    assignments: {
      homeroomClassroomId: enrolment.homeroomClassroomId || null,
      subjectAssignments: enrolment.subjectAssignments,
      extracurricularIds: enrolment.extracurricularIds,
      classroomScopes: enrolment.classroomScopes,
    },
  };
}
