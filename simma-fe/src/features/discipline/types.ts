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

export interface DisciplineRuleItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  type: DisciplineRuleType;
  category: DisciplineCategory;
  points: number;
  defaultSanction?: SanctionLevel | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentInfractionItem {
  id: string;
  studentId: string;
  studentName?: string;
  nisn?: string | null;
  nis?: string | null;
  ruleId?: string | null;
  ruleCode?: string | null;
  ruleName?: string | null;
  date: string;
  type: DisciplineRuleType;
  category: DisciplineCategory;
  points: number;
  title: string;
  description?: string | null;
  location?: string | null;
  witness?: string | null;
  evidenceUrl?: string | null;
  reporterId?: string | null;
  reporterName?: string;
  status: InfractionStatus;
  approvedById?: string | null;
  approvedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CounselingSessionItem {
  id: string;
  studentId: string;
  studentName?: string;
  nisn?: string | null;
  counselorId: string;
  counselorUsername?: string;
  sessionDate: string;
  sessionType: CounselingSessionType;
  issueCategory: CounselingIssueCategory;
  problemDescription: string;
  counselingNotes?: string | null;
  actionPlan?: string | null;
  status: CounselingStatus;
  followUpDate?: string | null;
  isConfidential?: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ParentSummonItem {
  id: string;
  letterNumber: string;
  studentId: string;
  studentName?: string;
  nisn?: string | null;
  parentName: string;
  summonDate: string;
  summonTime: string;
  location: string;
  reason: string;
  sanctionLevel: SanctionLevel;
  status: ParentSummonStatus;
  notes?: string | null;
  issuedById?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentDisciplineSummaryItem {
  studentId: string;
  studentName: string;
  nisn?: string | null;
  nis?: string | null;
  className?: string | null;
  totalInfractions: number;
  totalRewards: number;
  infractionPoints: number;
  rewardPoints: number;
  netPoints: number;
  sanctionLevel: SanctionLevel;
  activeSummonCount: number;
  latestInfractionDate?: string | null;
}
