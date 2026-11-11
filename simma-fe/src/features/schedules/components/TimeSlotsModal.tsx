import React, { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Trash2, Plus } from "lucide-react";
import { useCreateScheduleTimeSlot, useDeleteScheduleTimeSlot } from "../api/schedules.api";
import type { ScheduleTimeSlotItem } from "../types";
import { SESSION_TYPES, type SessionType } from "@simma/shared";

interface TimeSlotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeSlots: ScheduleTimeSlotItem[];
}

export const TimeSlotsModal: React.FC<TimeSlotsModalProps> = ({ isOpen, onClose, timeSlots }) => {
  const [name, setName] = useState("");
  const [sessionType, setSessionType] = useState<SessionType>("formal");
  const [periodOrder, setPeriodOrder] = useState("");
  const [startTime, setStartTime] = useState("07:30");
  const [endTime, setEndTime] = useState("08:15");
  const [isTeachingTime, setIsTeachingTime] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const createSlotMutation = useCreateScheduleTimeSlot();
  const deleteSlotMutation = useDeleteScheduleTimeSlot();

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !periodOrder) return;

    try {
      setIsAdding(true);
      await createSlotMutation.mutateAsync({
        name: name.trim(),
        sessionType,
        periodOrder: Number(periodOrder),
        startTime,
        endTime,
        isTeachingTime,
      });
      setName("");
      setPeriodOrder(String(Number(periodOrder) + 1));
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus slot jam pelajaran ini?")) {
      await deleteSlotMutation.mutateAsync(id);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Kelola Jam Pelajaran & Sesi" maxWidth="lg">
      <div className="space-y-4">
        {/* Form Tambah Slot */}
        <form onSubmit={handleAddSlot} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
          <span className="text-xs font-semibold text-slate-800">Tambah Slot Waktu Baru</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Input
              label="Nama Slot"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jam ke-1"
              required
            />
            <Input
              label="Urutan (Ke-)"
              type="number"
              value={periodOrder}
              onChange={(e) => setPeriodOrder(e.target.value)}
              placeholder="1"
              required
            />
            <Select
              label="Tipe Sesi"
              value={sessionType}
              onChange={(e) => {
                const val = e.target.value as SessionType;
                setSessionType(val);
                setIsTeachingTime(val === "formal" || val === "diniyah");
              }}
              options={SESSION_TYPES.map((t) => ({
                value: t,
                label: t.charAt(0).toUpperCase() + t.slice(1),
              }))}
            />
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={isTeachingTime}
                  onChange={(e) => setIsTeachingTime(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Jam Belajar Aktif</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="grid grid-cols-2 gap-2 flex-1">
              <Input
                label="Waktu Mulai (HH:MM)"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="07:30"
                required
              />
              <Input
                label="Waktu Selesai (HH:MM)"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="08:15"
                required
              />
            </div>
            <div className="pt-5">
              <Button variant="primary" size="sm" type="submit" disabled={isAdding} className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>{isAdding ? "Menyimpan..." : "Tambah Slot"}</span>
              </Button>
            </div>
          </div>
        </form>

        {/* Tabel Daftar Slot */}
        <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-200">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 bg-slate-100 text-slate-700">
              <tr>
                <th className="px-3 py-2">Urutan</th>
                <th className="px-3 py-2">Nama</th>
                <th className="px-3 py-2">Tipe Sesi</th>
                <th className="px-3 py-2">Waktu</th>
                <th className="px-3 py-2">Jam Belajar?</th>
                <th className="px-3 py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {timeSlots.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-slate-400">
                    Belum ada slot waktu terdaftar.
                  </td>
                </tr>
              ) : (
                timeSlots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono text-slate-500">#{slot.periodOrder}</td>
                    <td className="px-3 py-2 font-medium text-slate-900">{slot.name}</td>
                    <td className="px-3 py-2 capitalize text-slate-600">{slot.sessionType}</td>
                    <td className="px-3 py-2 text-slate-600">
                      {slot.startTime} - {slot.endTime}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {slot.isTeachingTime ? "Ya (KBM)" : "Bukan (Istirahat/Upacara)"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(slot.id)}
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-200">
          <Button variant="outline" type="button" onClick={onClose} size="sm">
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
};
