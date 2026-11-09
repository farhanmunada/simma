import React, { useState } from "react";
import type { SetupWizardData } from "../../types";

interface ClassroomSetupStepProps {
  data: SetupWizardData["classrooms"];
  onChange: (data: SetupWizardData["classrooms"]) => void;
}

export const ClassroomSetupStep: React.FC<ClassroomSetupStepProps> = ({
  data,
  onChange,
}) => {
  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState<number>(10);
  const [capacity, setCapacity] = useState<number>(36);

  const handleAddClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onChange([...data, { name: name.trim(), gradeLevel, capacity }]);
    setName("");
  };

  const handleRemoveClassroom = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-800">
          Inisialisasi Rombongan Belajar (Kelas)
        </h3>
        <p className="text-xs text-slate-500">
          Tambahkan rombel awal untuk tingkat kelas 10, 11, atau 12 (minimal 1 kelas).
        </p>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
        <h4 className="text-xs font-semibold text-slate-700">Tambah Rombel Cepat</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Nama Rombel (misal: X-1, XI IPA 1)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value={10}>Kelas 10 (Fase E)</option>
              <option value={11}>Kelas 11 (Fase F)</option>
              <option value={12}>Kelas 12 (Fase F)</option>
            </select>
          </div>
          <div>
            <input
              type="number"
              min={1}
              max={50}
              placeholder="Kapasitas"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddClassroom}
          className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors"
        >
          + Tambahkan ke Daftar
        </button>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-700">
          Daftar Rombel Terdaftar ({data.length})
        </label>
        {data.length === 0 ? (
          <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
            Belum ada kelas ditambahkan. Silakan tambahkan minimal satu rombel.
          </p>
        ) : (
          <div className="border border-slate-200 rounded-md divide-y divide-slate-100 overflow-hidden">
            {data.map((c, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2 text-sm bg-white"
              >
                <div>
                  <span className="font-medium text-slate-800">{c.name}</span>
                  <span className="ml-2 text-xs text-slate-500">
                    (Tingkat {c.gradeLevel} • Kapasitas: {c.capacity})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveClassroom(idx)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};