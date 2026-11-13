import React, { useState } from "react";
import { Download, SlidersHorizontal, DoorOpen, Clock } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Select";
import { exportSchedulePdf } from "../api/schedules.api";
import type { ScheduleViewType, ScheduleRoomItem } from "../types";

interface Option {
  id: string;
  name: string;
}

interface ScheduleFilterBarProps {
  viewType: ScheduleViewType;
  onViewTypeChange: (type: ScheduleViewType) => void;
  targetId: string;
  onTargetIdChange: (id: string) => void;
  classrooms: Option[];
  teachers: Option[];
  rooms: ScheduleRoomItem[];
  academicYearName?: string;
  semesterName?: string;
  onOpenRooms: () => void;
  onOpenTimeSlots: () => void;
}

export const ScheduleFilterBar: React.FC<ScheduleFilterBarProps> = ({
  viewType,
  onViewTypeChange,
  targetId,
  onTargetIdChange,
  classrooms,
  teachers,
  rooms,
  academicYearName,
  semesterName,
  onOpenRooms,
  onOpenTimeSlots,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPdf = async () => {
    if (!targetId) return;

    try {
      setIsExporting(true);
      const blob = await exportSchedulePdf({
        viewType,
        targetId,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Jadwal-Pelajaran-${viewType}-${targetId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Gagal mengunduh jadwal pelajaran PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const getTargetOptions = () => {
    switch (viewType) {
      case "classroom":
        return classrooms.map((c) => ({ value: c.id, label: `Kelas: ${c.name}` }));
      case "teacher":
        return teachers.map((t) => ({ value: t.id, label: `Guru: ${t.name}` }));
      case "room":
        return rooms.map((r) => ({ value: r.id, label: `Ruang: ${r.name} (${r.code})` }));
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-36">
          <Select
            label="Tampilan Matriks"
            value={viewType}
            onChange={(e) => {
              const newType = e.target.value as ScheduleViewType;
              onViewTypeChange(newType);
              if (newType === "classroom" && classrooms[0]) onTargetIdChange(classrooms[0].id);
              if (newType === "teacher" && teachers[0]) onTargetIdChange(teachers[0].id);
              if (newType === "room" && rooms[0]) onTargetIdChange(rooms[0].id);
            }}
            options={[
              { value: "classroom", label: "Per Kelas" },
              { value: "teacher", label: "Per Guru" },
              { value: "room", label: "Per Ruangan" },
            ]}
          />
        </div>

        <div className="w-56">
          <Select
            label="Pilih Target"
            value={targetId}
            onChange={(e) => onTargetIdChange(e.target.value)}
            options={getTargetOptions()}
          />
        </div>

        {(academicYearName || semesterName) && (
          <div className="hidden lg:flex flex-col justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Periode Aktif</span>
            <span className="font-semibold text-slate-700">
              {academicYearName || "-"} • Semester {semesterName || "-"}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={onOpenRooms}
          className="gap-1.5 text-xs"
        >
          <DoorOpen className="h-3.5 w-3.5 text-slate-500" />
          <span>Ruangan</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={onOpenTimeSlots}
          className="gap-1.5 text-xs"
        >
          <Clock className="h-3.5 w-3.5 text-slate-500" />
          <span>Jam Belajar</span>
        </Button>

        <Button
          variant="primary"
          size="sm"
          type="button"
          disabled={!targetId || isExporting}
          onClick={handleDownloadPdf}
          className="gap-1.5 text-xs"
        >
          <Download className="h-3.5 w-3.5" />
          <span>{isExporting ? "Mengunduh..." : "Cetak PDF"}</span>
        </Button>
      </div>
    </div>
  );
};
