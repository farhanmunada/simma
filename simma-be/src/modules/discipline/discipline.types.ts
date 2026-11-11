import type {
  DisciplineRuleType,
  DisciplineCategory,
  SanctionLevel,
  InfractionStatus,
  CounselingSessionType,
  CounselingIssueCategory,
  CounselingStatus,
  ParentSummonStatus,
} from "@simma/shared";
import type {
  DisciplineRule,
  NewDisciplineRule,
  StudentInfractionRecord,
  NewStudentInfractionRecord,
  CounselingSessionRecord,
  NewCounselingSessionRecord,
  ParentSummonRecord,
  NewParentSummonRecord,
} from "../../db/schema/discipline.js";

export type {
  DisciplineRule,
  NewDisciplineRule,
  StudentInfractionRecord,
  NewStudentInfractionRecord,
  CounselingSessionRecord,
  NewCounselingSessionRecord,
  ParentSummonRecord,
  NewParentSummonRecord,
};

export interface StudentPointsSummary {
  studentId: string;
  studentName: string;
  nisn: string | null;
  nis: string | null;
  className: string | null;
  totalInfractions: number;
  totalRewards: number;
  infractionPoints: number;
  rewardPoints: number;
  netPoints: number;
  sanctionLevel: SanctionLevel;
  activeSummonCount: number;
  latestInfractionDate: string | null;
}

export interface StudentDisciplineDetail extends StudentPointsSummary {
  infractions: (StudentInfractionRecord & {
    ruleCode?: string | null;
    reporterName?: string | null;
    approverName?: string | null;
  })[];
  summons: ParentSummonRecord[];
  counselingCount: number;
}

export interface EscalationStatusResult {
  studentId: string;
  netPoints: number;
  sanctionLevel: SanctionLevel;
  requiresSummon: boolean;
  recommendedAction: string;
  exceededFiftyPoints: boolean;
}

export interface SummonLetterPdfData {
  institution: {
    name: string;
    nsm?: string | null;
    npsn?: string | null;
    address?: string | null;
    phone?: string | null;
  };
  summon: ParentSummonRecord;
  student: {
    fullName: string;
    nisn?: string | null;
    nis?: string | null;
    className?: string | null;
  };
  infractionsSummary: {
    totalPoints: number;
    netPoints: number;
    items: {
      date: string;
      title: string;
      category: string;
      points: number;
    }[];
  };
  counselorName?: string;
  principalName?: string;
}
