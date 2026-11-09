import React from "react";
import { Plus } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import { ASSESSMENT_TYPE_OPTIONS } from "../utils/grade-helpers";
import type { ReferenceItem } from "../hooks/useGradesReferences";

interface AssessmentsFilterBarProps {
  selectedClassroomId: string;
  onChangeClassroom: (val: string) => void;
  selectedSubjectId: string;
  onChangeSubject: (val: string) => void;
  selectedType: string;
  onChangeType: (val: string) => void;
  classrooms: ReferenceItem[];
  subjects: ReferenceItem[];
  onOpenCreate: () => void;
}

export const AssessmentsFilterBar: React.FC<AssessmentsFilterBarProps> = ({
  selectedClassroomId,
  onChangeClassroom,
  selectedSubjectId,
  onChangeSubject,
  selectedType,
  onChangeType,
  classrooms,
  subjects,
  onOpenCreate,
}) => {
  return (
    <Card className="p-3">
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 max-w-2xl">
          <Select
            name="filterClassroom"
            value={selectedClassroomId}
            onChange={(e) => onChangeClassroom(e.target.value)}
            options={[
              { value: "", label: "-- Semua Kelas --" },
              ...classrooms.map((c) => ({ value: c.id, label: c.name || c.code || c.id })),
            ]}
          />
          <Select
            name="filterSubject"
            value={selectedSubjectId}
            onChange={(e) => onChangeSubject(e.target.value)}
            options={[
              { value: "", label: "-- Semua Mapel --" },
              ...subjects.map((s) => ({ value: s.id, label: s.name || s.code || s.id })),
            ]}
          />
          <Select
            name="filterType"
            value={selectedType}
            onChange={(e) => onChangeType(e.target.value)}
            options={[
              { value: "", label: "-- Semua Tipe --" },
              ...ASSESSMENT_TYPE_OPTIONS,
            ]}
          />
        </div>

        <Button onClick={onOpenCreate} className="shrink-0 flex items-center gap-1.5">
          <Plus className="w-4 h-4" />
          <span>Tambah Rencana Penilaian</span>
        </Button>
      </div>
    </Card>
  );
};
