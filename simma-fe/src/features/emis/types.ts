import type {
  EmisExportType,
  EmisExportFormat,
  EmisEntityType,
  EmisBapStatus,
} from "@simma/shared";

export type { EmisExportType, EmisExportFormat, EmisEntityType, EmisBapStatus };

export interface EmisAnomalyItem {
  id: string;
  entityType: EmisEntityType;
  entityId: string;
  entityName: string;
  identifier: string;
  classroomName?: string;
  fieldName: string;
  currentValue: string;
  issueDescription: string;
  suggestedAction: string;
  severity: "critical" | "warning";
}

export interface EmisReadinessSummary {
  overallPercentage: number;
  isReadyForExport: boolean;
  students: {
    total: number;
    valid: number;
    invalid: number;
    percentage: number;
  };
  teachers: {
    total: number;
    valid: number;
    invalid: number;
    percentage: number;
  };
  classrooms: {
    total: number;
    valid: number;
    invalid: number;
    percentage: number;
  };
  institution: {
    total: number;
    valid: number;
    invalid: number;
    percentage: number;
  };
}

export interface EmisAuditResponse {
  summary: EmisReadinessSummary;
  anomalies: EmisAnomalyItem[];
}

export interface EmisBapRecord {
  id: string;
  bapNumber: string;
  academicYear: string;
  semester: string;
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  totalTeachers: number;
  pnsTeachers: number;
  nonPnsTeachers: number;
  totalClassrooms: number;
  readinessPercentage: number;
  status: EmisBapStatus;
  headmasterName: string;
  operatorName: string;
  approvedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface EmisExportQueryParams {
  format?: EmisExportFormat;
}

export interface EmisAuditFilterParams {
  entityType?: EmisEntityType;
  severity?: "critical" | "warning";
  search?: string;
}
