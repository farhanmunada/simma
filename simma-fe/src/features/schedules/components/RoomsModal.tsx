import React, { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Trash2, Plus } from "lucide-react";
import { useCreateScheduleRoom, useDeleteScheduleRoom } from "../api/schedules.api";
import type { ScheduleRoomItem } from "../types";
import { ROOM_TYPES, type RoomType } from "@simma/shared";

interface RoomsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: ScheduleRoomItem[];
}

export const RoomsModal: React.FC<RoomsModalProps> = ({ isOpen, onClose, rooms }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [roomType, setRoomType] = useState<RoomType>("teori");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const createRoomMutation = useCreateScheduleRoom();
  const deleteRoomMutation = useDeleteScheduleRoom();

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    try {
      setIsAdding(true);
      await createRoomMutation.mutateAsync({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        roomType,
        capacity: capacity ? Number(capacity) : undefined,
        location: location.trim() || undefined,
        isActive: true,
      });
      setName("");
      setCode("");
      setCapacity("");
      setLocation("");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus ruangan ini dari daftar jadwal?")) {
      await deleteRoomMutation.mutateAsync(id);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Kelola Ruangan Pembelajaran" maxWidth="lg">
      <div className="space-y-4">
        {/* Form Tambah Ruangan */}
        <form onSubmit={handleAddRoom} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
          <span className="text-xs font-semibold text-slate-800">Tambah Ruangan Baru</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Input
              label="Nama Ruang"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Lab Fisika"
              required
            />
            <Input
              label="Kode Ruang"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="LAB-FIS"
              required
            />
            <Select
              label="Tipe"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value as RoomType)}
              options={ROOM_TYPES.map((t) => ({
                value: t,
                label: t.charAt(0).toUpperCase() + t.slice(1),
              }))}
            />
            <Input
              label="Kapasitas"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="36"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <Input
                label="Lokasi / Gedung"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Gedung B Lantai 2"
              />
            </div>
            <div className="pt-5">
              <Button variant="primary" size="sm" type="submit" disabled={isAdding} className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>{isAdding ? "Menyimpan..." : "Tambah Ruang"}</span>
              </Button>
            </div>
          </div>
        </form>

        {/* Tabel Daftar Ruangan */}
        <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-200">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 bg-slate-100 text-slate-700">
              <tr>
                <th className="px-3 py-2">Nama</th>
                <th className="px-3 py-2">Kode</th>
                <th className="px-3 py-2">Tipe</th>
                <th className="px-3 py-2">Kapasitas</th>
                <th className="px-3 py-2 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-slate-400">
                    Belum ada data ruangan khusus terdaftar.
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-900">{room.name}</td>
                    <td className="px-3 py-2 text-slate-600">{room.code}</td>
                    <td className="px-3 py-2 capitalize text-slate-600">{room.roomType}</td>
                    <td className="px-3 py-2 text-slate-600">{room.capacity ? `${room.capacity} org` : "-"}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(room.id)}
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
