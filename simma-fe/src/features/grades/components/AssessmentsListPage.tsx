import React, { useState } from "react";
import {
  useAssessments,
  useCreateAssessment,
  useUpdateAssessment,
  useDeleteAssessment,
} from "../api/grades.api";
import {
  useClassroomsReference,
  useSubjectsReference,
  useSemestersReference,
  useAcademicYearsReference,
} from "../hooks/useGradesReferences";
import type { Assessment, CreateAssessmentDto, GradeAssessmentType } from "../types";
import { AssessmentsFilterBar } from "./AssessmentsFilterBar";
import { AssessmentsTable } from "./AssessmentsTable";
import { AssessmentFormModal } from "./AssessmentFormModal";
import { DeleteAssessmentModal } from "./DeleteAssessmentModal";

export const AssessmentsListPage: React.FC = () => {
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  const { data: classrooms = [] } = useClassroomsReference();
  const { data: subjects = [] } = useSubjectsReference();
  const { data: semesters = [] } = useSemestersReference();
  const { data: academicYears = [] } = useAcademicYearsReference();

  const {
    data: assessmentsData,
    isLoading,
    isError,
    error,
  } = useAssessments({
    classroomId: selectedClassroomId || undefined,
    subjectId: selectedSubjectId || undefined,
    type: (selectedType as GradeAssessmentType) || undefined,
  });

  const assessments = assessmentsData?.data || [];

  const createMutation = useCreateAssessment();
  const updateMutation = useUpdateAssessment();
  const deleteMutation = useDeleteAssessment();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingAssessment(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    setIsModalOpen(true);
  };

  const handleSaveAssessment = async (dto: CreateAssessmentDto) => {
    if (editingAssessment) {
      await updateMutation.mutateAsync({
        id: editingAssessment.id,
        data: dto,
      });
    } else {
      await createMutation.mutateAsync(dto);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    setDeleteTargetId(null);
  };

  return (
    <div className="space-y-4">
      <AssessmentsFilterBar
        selectedClassroomId={selectedClassroomId}
        onChangeClassroom={setSelectedClassroomId}
        selectedSubjectId={selectedSubjectId}
        onChangeSubject={setSelectedSubjectId}
        selectedType={selectedType}
        onChangeType={setSelectedType}
        classrooms={classrooms}
        subjects={subjects}
        onOpenCreate={handleOpenCreate}
      />

      <AssessmentsTable
        assessments={assessments}
        isLoading={isLoading}
        isError={isError}
        error={error}
        classrooms={classrooms}
        subjects={subjects}
        onEdit={handleOpenEdit}
        onDelete={setDeleteTargetId}
      />

      <AssessmentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingAssessment={editingAssessment}
        classrooms={classrooms}
        subjects={subjects}
        semesters={semesters}
        academicYears={academicYears}
        onSubmit={handleSaveAssessment}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteAssessmentModal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => deleteTargetId && handleDelete(deleteTargetId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
