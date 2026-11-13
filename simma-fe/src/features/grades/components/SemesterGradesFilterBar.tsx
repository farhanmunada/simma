import React from "react";
import { Calculator } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Select } from "../../../components/ui/Select";
import { Button } from "../../../components/ui/Button";
import type { ReferenceItem } from "../hooks/useGradesReferences";

interface SemesterGradesFilterBarProps {
  selectedClassroomId: string;
  onChangeClassroom: (val: string) => void;
  selectedSubjectId: string;
  onChangeSubject: (val: string) => void;
  selectedSemesterId: string;
  onChangeSemester: (val: string) => void;
  classrooms: ReferenceItem[];
  subjects: ReferenceItem[];
  semesters: ReferenceItem[];
  isFilterComplete: boolean;
  onCalculate: () => void;
  isCalculating: boolean;
}

export const SemesterGradesFilterBar: React.FC<SemesterGradesFilterBarProps> = ({
  selectedClassroomId,
  onChangeClassroom,
  selectedSubjectId,
  onChangeSubject,
  selectedSemesterId,
  onChangeSemester,
  classrooms,
  subjects,
  semesters,
  isFilterComplete,
  onCalculate,
  isCalculating,
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
              { value: "", label: "-- Pilih Kelas --" },
              ...classrooms.map((c) => ({ value: c.id, label: c.name || c.code || c.id })),
            ]}
          />
          <Select
            name="filterSubject"
            value={selectedSubjectId}
            onChange={(e) => onChangeSubject(e.target.value)}
            options={[
              { value: "", label: "-- Pilih Mapel --" },
              ...subjects.map((s) => ({ value: s.id, label: s.name || s.code || s.id })),
            ]}
          />
          <Select
            name="filterSemester"
            value={selectedSemesterId}
            onChange={(e) => onChangeSemester(e.target.value)}
            options={[
              { value: "", label: "-- Pilih Semester --" },
              ...semesters.map((s) => ({ value: s.id, label: s.name || s.code || s.id })),
            ]}
          />
        </div>

        <Button
          onClick={onCalculate}
          disabled={!isFilterComplete || isCalculating}
          isLoading={isCalculating}
          className="shrink-0 flex items-center gap-1.5"
        >
          <Calculator className="w-4 h-4" />
          <span>Hitung Nilai Semester Otomatis</span>
        </Button>
      </div>
    </Card>
  );
};
