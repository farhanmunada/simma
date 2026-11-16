import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Save,
  CheckCheck,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { getClassrooms } from "../../settings/api/settings.api";
import {
  useDailyChecklist,
  useSaveDailyChecklist,
  useEarlyWarnings,
} from "../api/mutabaah.api";
import { ChecklistGrid } from "../components/ChecklistGrid";
import { UzurModal } from "../components/UzurModal";
import { EarlyWarningAlertBanner } from "../components/EarlyWarningAlertBanner";
import type {
  StudentDailyChecklistRowDto,
  MutabaahEntryStatus,
} from "../types";

const STATUS_CYCLE: MutabaahEntryStatus[] = [
  "terlaksana",
  "masbuk",
  "tidak_terlaksana",
  "uzur",
];

export const MutabaahDailyChecklistPage: React.FC = () => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(todayStr);
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const [studentsData, setStudentsData] = useState<StudentDailyChecklistRowDto[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [uzurTarget, setUzurTarget] = useState<StudentDailyChecklistRowDto | null>(null);

  const { data: classrooms = [] } = useQuery({
    queryKey: ["classrooms-list"],
    queryFn: () => getClassrooms(),
  });

  const {
    data: checklistData,
    isLoading,
    refetch,
  } = useDailyChecklist({
    date,
    classroomId: selectedClassId || undefined,
  });

  const { data: earlyWarnings = [] } = useEarlyWarnings(
    selectedClassId || undefined
  );

  const saveMutation = useSaveDailyChecklist();

  useEffect(() => {
    if (checklistData?.students) {
      setStudentsData(checklistData.students);
      setHasUnsavedChanges(false);
    }
  }, [checklistData]);

  const handleToggleStatus = (studentId: string, activityId: string) => {
    setStudentsData((prev) =>
      prev.map((student) => {
        if (student.studentId !== studentId) return student;

        const currentEntry = student.entries.find((e) => e.activityId === activityId);
        const currentStatus =
          currentEntry?.status || (student.isUzur ? "uzur" : "terlaksana");
        const nextIndex =
          (STATUS_CYCLE.indexOf(currentStatus) + 1) % STATUS_CYCLE.length;
        const nextStatus = STATUS_CYCLE[nextIndex];

        let updatedEntries = [...student.entries];
        const existingIdx = updatedEntries.findIndex((e) => e.activityId === activityId);

        const newScore =
          nextStatus === "terlaksana"
            ? 100
            : nextStatus === "masbuk" || nextStatus === "uzur"
            ? 70
            : 0;

        if (existingIdx >= 0) {
          updatedEntries[existingIdx] = {
            ...updatedEntries[existingIdx],
            status: nextStatus,
            score: newScore,
          };
        } else {
          const act = checklistData?.activities.find((a) => a.id === activityId);
          if (act) {
            updatedEntries.push({
              activityId: act.id,
              activityName: act.name,
              category: act.category,
              weight: act.weight,
              status: nextStatus,
              score: newScore,
              volume: act.targetCount,
            });
          }
        }

        return { ...student, entries: updatedEntries };
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleSetAllTerlaksanaForStudent = (studentId: string) => {
    if (!checklistData?.activities) return;
    setStudentsData((prev) =>
      prev.map((student) => {
        if (student.studentId !== studentId) return student;
        const newEntries = checklistData.activities.map((act) => ({
          activityId: act.id,
          activityName: act.name,
          category: act.category,
          weight: act.weight,
          status: "terlaksana" as MutabaahEntryStatus,
          score: 100,
          volume: act.targetCount,
        }));
        return { ...student, entries: newEntries };
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleSetAllTerlaksanaClass = () => {
    if (!checklistData?.activities) return;
    setStudentsData((prev) =>
      prev.map((student) => {
        if (student.isUzur) return student;
        const newEntries = checklistData.activities.map((act) => ({
          activityId: act.id,
          activityName: act.name,
          category: act.category,
          weight: act.weight,
          status: "terlaksana" as MutabaahEntryStatus,
          score: 100,
          volume: act.targetCount,
        }));
        return { ...student, entries: newEntries };
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleSaveChecklist = async () => {
    const flattenedEntries: {
      studentId: string;
      activityId: string;
      status: MutabaahEntryStatus;
      volume: number;
      score: number;
      notes?: string;
    }[] = [];

    studentsData.forEach((student) => {
      student.entries.forEach((entry) => {
        flattenedEntries.push({
          studentId: student.studentId,
          activityId: entry.activityId,
          status: entry.status,
          volume: entry.volume || 1,
          score: entry.score,
          notes: entry.notes || undefined,
        });
      });
    });

    await saveMutation.mutateAsync({
      date,
      entries: flattenedEntries,
    });
    setHasUnsavedChanges(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            Checklist Mutaba&apos;ah Yaumiyah
          </h1>
          <p className="text-xs text-slate-500">
            Pencatatan amalan harian santri dan shalat berjama&apos;ah terintegrasi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSetAllTerlaksanaClass}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition shadow-2xs"
          >
            <CheckCheck className="h-4 w-4" />
            Semua Terlaksana
          </button>

          <button
            type="button"
            onClick={handleSaveChecklist}
            disabled={saveMutation.isPending || !hasUnsavedChanges}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-2xs"
          >
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? "Menyimpan..." : "Simpan Checklist"}
          </button>
        </div>
      </div>

      <EarlyWarningAlertBanner warnings={earlyWarnings} />

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Kelas:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-emerald-600 focus:outline-hidden"
            >
              <option value="">Semua Kelas</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="text-xs font-medium text-amber-600 animate-pulse">
              Ada perubahan belum disimpan
            </span>
          )}
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
            title="Muat Ulang"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-500">
          Memuat lembar checklist mutaba&apos;ah...
        </div>
      ) : (
        <ChecklistGrid
          activities={checklistData?.activities || []}
          students={studentsData}
          onToggleStatus={handleToggleStatus}
          onOpenUzur={(student) => setUzurTarget(student)}
          onSetAllTerlaksanaForStudent={handleSetAllTerlaksanaForStudent}
        />
      )}

      {uzurTarget && (
        <UzurModal
          isOpen={Boolean(uzurTarget)}
          onClose={() => {
            setUzurTarget(null);
            refetch();
          }}
          studentId={uzurTarget.studentId}
          studentName={uzurTarget.studentName}
          gender={uzurTarget.gender}
          defaultDate={date}
        />
      )}
    </div>
  );
};
