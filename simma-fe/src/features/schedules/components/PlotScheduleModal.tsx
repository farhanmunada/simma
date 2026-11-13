import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { Input } from "../../../components/ui/Input";
import { CollisionAlertBanner } from "./CollisionAlertBanner";
import { useCheckScheduleCollision } from "../api/schedules.api";
import type { ScheduleItem, CollisionResult, ScheduleRoomItem, ScheduleTimeSlotItem } from "../types";
import { DAY_OF_WEEKS, type DayOfWeek } from "@simma/shared";

interface MasterOption {
  id: string;
  name: string;
}

interface PlotScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    classroomId: string;
    subjectId: string;
    teacherId: string;
    roomId?: string;
    timeSlotId: string;
    dayOfWeek: DayOfWeek;
    status: "draft" | "published";
    notes?: string;
  }) => Promise<void>;
  initialSchedule?: ScheduleItem | null;
  defaultDay?: DayOfWeek;
  defaultSlotId?: string;
  defaultClassId?: string;
  classrooms: MasterOption[];
  subjects: MasterOption[];
  teachers: MasterOption[];
  rooms: ScheduleRoomItem[];
  timeSlots: ScheduleTimeSlotItem[];
}

export const PlotScheduleModal: React.FC<PlotScheduleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialSchedule,
  defaultDay,
  defaultSlotId,
  defaultClassId,
  classrooms,
  subjects,
  teachers,
  rooms,
  timeSlots,
}) => {
  const [classroomId, setClassroomId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [timeSlotId, setTimeSlotId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>("senin");
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [notes, setNotes] = useState("");
  const [collisionResult, setCollisionResult] = useState<CollisionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkCollisionMutation = useCheckScheduleCollision();

  useEffect(() => {
    if (initialSchedule) {
      setClassroomId(initialSchedule.classroomId);
      setSubjectId(initialSchedule.subjectId);
      setTeacherId(initialSchedule.teacherId);
      setRoomId(initialSchedule.roomId || "");
      setTimeSlotId(initialSchedule.timeSlotId);
      setDayOfWeek(initialSchedule.dayOfWeek);
      setStatus(initialSchedule.status === "archived" ? "draft" : initialSchedule.status);
      setNotes(initialSchedule.notes || "");
    } else {
      setClassroomId(defaultClassId || (classrooms[0]?.id || ""));
      setSubjectId(subjects[0]?.id || "");
      setTeacherId(teachers[0]?.id || "");
      setRoomId(rooms[0]?.id || "");
      setTimeSlotId(defaultSlotId || (timeSlots[0]?.id || ""));
      setDayOfWeek(defaultDay || "senin");
      setStatus("published");
      setNotes("");
    }
    setCollisionResult(null);
  }, [isOpen, initialSchedule, defaultDay, defaultSlotId, defaultClassId, classrooms, subjects, teachers, rooms, timeSlots]);

  // Real-time collision detection
  useEffect(() => {
    if (!isOpen || !teacherId || !timeSlotId || !dayOfWeek || !classroomId) return;

    const timer = setTimeout(() => {
      checkCollisionMutation.mutate(
        {
          scheduleId: initialSchedule?.id,
          dayOfWeek,
          timeSlotId,
          teacherId,
          roomId: roomId || undefined,
          classroomId,
        },
        {
          onSuccess: (data) => setCollisionResult(data),
          onError: () => setCollisionResult(null),
        },
      );
    }, 250);

    return () => clearTimeout(timer);
  }, [teacherId, timeSlotId, dayOfWeek, classroomId, roomId, isOpen, initialSchedule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (collisionResult?.hasCollision) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        classroomId,
        subjectId,
        teacherId,
        roomId: roomId || undefined,
        timeSlotId,
        dayOfWeek,
        status,
        notes: notes || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialSchedule ? "Edit Plotting Jadwal" : "Plot Jadwal Pelajaran"}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <CollisionAlertBanner collisionResult={collisionResult} />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Hari"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
            options={DAY_OF_WEEKS.map((d) => ({
              value: d,
              label: d.charAt(0).toUpperCase() + d.slice(1),
            }))}
          />

          <Select
            label="Jam / Waktu"
            value={timeSlotId}
            onChange={(e) => setTimeSlotId(e.target.value)}
            options={timeSlots.map((s) => ({
              value: s.id,
              label: `${s.name} (${s.startTime}-${s.endTime}) [${s.sessionType}]`,
            }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Kelas"
            value={classroomId}
            onChange={(e) => setClassroomId(e.target.value)}
            options={classrooms.map((c) => ({ value: c.id, label: c.name }))}
          />

          <Select
            label="Mata Pelajaran"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            options={subjects.map((s) => ({ value: s.id, label: s.name }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Guru Pengampu"
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            options={teachers.map((t) => ({ value: t.id, label: t.name }))}
          />

          <Select
            label="Ruangan (Opsional)"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            options={[
              { value: "", label: "-- Ruang Kelas Utama --" },
              ...rooms.map((r) => ({ value: r.id, label: `${r.name} (${r.code})` })),
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Status Publikasi"
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            options={[
              { value: "published", label: "Published (Aktif)" },
              { value: "draft", label: "Draft" },
            ]}
          />

          <Input
            label="Catatan Khusus"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Praktikum lab biologi"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting || Boolean(collisionResult?.hasCollision)}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Jadwal"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
