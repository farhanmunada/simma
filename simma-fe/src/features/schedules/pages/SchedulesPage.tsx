import React, { useState, useEffect } from "react";
import { ScheduleFilterBar } from "../components/ScheduleFilterBar";
import { TimetableGrid } from "../components/TimetableGrid";
import { PlotScheduleModal } from "../components/PlotScheduleModal";
import { RoomsModal } from "../components/RoomsModal";
import { TimeSlotsModal } from "../components/TimeSlotsModal";
import {
  useScheduleRooms,
  useScheduleTimeSlots,
  useScheduleMatrix,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
} from "../api/schedules.api";
import {
  useClassrooms,
  useTeachers,
  useSubjects,
  useAcademicYears,
  useSemesters,
} from "../../settings/api/settings.api";
import type { ScheduleViewType, ScheduleItem } from "../types";
import type { DayOfWeek } from "@simma/shared";

export const SchedulesPage: React.FC = () => {
  const [viewType, setViewType] = useState<ScheduleViewType>("classroom");
  const [targetId, setTargetId] = useState<string>("");

  const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
  const [isRoomsModalOpen, setIsRoomsModalOpen] = useState(false);
  const [isTimeSlotsModalOpen, setIsTimeSlotsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: DayOfWeek; slotId: string } | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);

  // Queries
  const { data: classrooms = [] } = useClassrooms();
  const { data: teachers = [] } = useTeachers();
  const { data: subjects = [] } = useSubjects();
  const { data: rooms = [] } = useScheduleRooms();
  const { data: timeSlots = [] } = useScheduleTimeSlots();
  const { data: academicYears = [] } = useAcademicYears();
  const { data: semesters = [] } = useSemesters();

  const activeYear = academicYears.find((y) => y.isActive) || academicYears[0];
  const activeSem = semesters.find((s) => s.isActive) || semesters[0];

  const teacherOptions = teachers.map((t) => ({ id: t.id, name: t.fullName }));

  // Auto-select initial targetId
  useEffect(() => {
    if (!targetId) {
      if (viewType === "classroom" && classrooms[0]) {
        setTargetId(classrooms[0].id);
      } else if (viewType === "teacher" && teacherOptions[0]) {
        setTargetId(teacherOptions[0].id);
      } else if (viewType === "room" && rooms[0]) {
        setTargetId(rooms[0].id);
      }
    }
  }, [viewType, targetId, classrooms, teacherOptions, rooms]);

  const { data: matrix, isLoading: isMatrixLoading } = useScheduleMatrix(
    viewType,
    targetId,
    activeYear?.id,
    activeSem?.id,
  );

  const createScheduleMutation = useCreateSchedule();
  const updateScheduleMutation = useUpdateSchedule();
  const deleteScheduleMutation = useDeleteSchedule();

  const handleSlotClick = (day: DayOfWeek, slotId: string) => {
    setEditingSchedule(null);
    setSelectedSlot({ day, slotId });
    setIsPlotModalOpen(true);
  };

  const handleEditSchedule = (scheduleId: string) => {
    // Look up schedule cell details from matrix
    if (!matrix) return;
    for (const row of matrix.rows) {
      for (const day of Object.keys(row.cells) as DayOfWeek[]) {
        const cell = row.cells[day];
        if (cell && cell.scheduleId === scheduleId) {
          setEditingSchedule({
            id: scheduleId,
            academicYearId: activeYear?.id || "",
            semesterId: activeSem?.id || "",
            classroomId: viewType === "classroom" ? targetId : "",
            subjectId: "",
            teacherId: viewType === "teacher" ? targetId : "",
            roomId: viewType === "room" ? targetId : undefined,
            timeSlotId: row.timeSlot.id,
            dayOfWeek: day,
            status: cell.status || "published",
            createdAt: "",
            updatedAt: "",
          });
          setSelectedSlot({ day, slotId: row.timeSlot.id });
          setIsPlotModalOpen(true);
          return;
        }
      }
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (confirm("Hapus jadwal pelajaran ini?")) {
      await deleteScheduleMutation.mutateAsync(scheduleId);
    }
  };

  const handleSaveSchedule = async (data: {
    classroomId: string;
    subjectId: string;
    teacherId: string;
    roomId?: string;
    timeSlotId: string;
    dayOfWeek: DayOfWeek;
    status: "draft" | "published";
    notes?: string;
  }) => {
    if (editingSchedule) {
      await updateScheduleMutation.mutateAsync({
        id: editingSchedule.id,
        data,
      });
    } else {
      await createScheduleMutation.mutateAsync({
        ...data,
        academicYearId: activeYear?.id,
        semesterId: activeSem?.id,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Jadwal Pelajaran (Dual-Kurikulum)
        </h1>
        <p className="text-xs text-slate-500">
          Manajemen jadwal terpadu kurikulum formal & diniyah dengan proteksi anti-bentrok guru, ruang, dan rombel.
        </p>
      </div>

      <ScheduleFilterBar
        viewType={viewType}
        onViewTypeChange={setViewType}
        targetId={targetId}
        onTargetIdChange={setTargetId}
        classrooms={classrooms}
        teachers={teacherOptions}
        rooms={rooms}
        academicYearName={activeYear?.name}
        semesterName={activeSem ? (activeSem.type === 1 ? "Ganjil" : "Genap") : undefined}
        onOpenRooms={() => setIsRoomsModalOpen(true)}
        onOpenTimeSlots={() => setIsTimeSlotsModalOpen(true)}
      />

      <TimetableGrid
        matrix={matrix}
        isLoading={isMatrixLoading}
        viewType={viewType}
        onSlotClick={handleSlotClick}
        onEditSchedule={handleEditSchedule}
        onDeleteSchedule={handleDeleteSchedule}
      />

      {isPlotModalOpen && (
        <PlotScheduleModal
          isOpen={isPlotModalOpen}
          onClose={() => setIsPlotModalOpen(false)}
          onSubmit={handleSaveSchedule}
          initialSchedule={editingSchedule}
          defaultDay={selectedSlot?.day}
          defaultSlotId={selectedSlot?.slotId}
          defaultClassId={viewType === "classroom" ? targetId : undefined}
          classrooms={classrooms}
          subjects={subjects}
          teachers={teacherOptions}
          rooms={rooms}
          timeSlots={timeSlots}
        />
      )}

      {isRoomsModalOpen && (
        <RoomsModal
          isOpen={isRoomsModalOpen}
          onClose={() => setIsRoomsModalOpen(false)}
          rooms={rooms}
        />
      )}

      {isTimeSlotsModalOpen && (
        <TimeSlotsModal
          isOpen={isTimeSlotsModalOpen}
          onClose={() => setIsTimeSlotsModalOpen(false)}
          timeSlots={timeSlots}
        />
      )}
    </div>
  );
};
