import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  ADDITIONAL_DUTY_TYPES,
  ADDITIONAL_DUTY_JTM_MAP,
  MIN_JTM_TPG,
  type AdditionalDutyType,
} from "@simma/shared";
import type { WorkloadSummaryDto } from "../types";

interface WorkloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    teacherId: string;
    teachingJtm: number;
    additionalDutyType: AdditionalDutyType;
    additionalDutyJtm: number;
  }) => Promise<void>;
  workloadItem?: WorkloadSummaryDto | null;
}

export const WorkloadModal: React.FC<WorkloadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  workloadItem,
}) => {
  const [teachingJtm, setTeachingJtm] = useState(18);
  const [additionalDuty, setAdditionalDuty] = useState<AdditionalDutyType>("tidak_ada");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (workloadItem) {
      setTeachingJtm(workloadItem.teachingJtm);
      setAdditionalDuty(workloadItem.additionalDutyType);
    }
  }, [workloadItem, isOpen]);

  if (!isOpen || !workloadItem) return null;

  const dutyJtm = ADDITIONAL_DUTY_JTM_MAP[additionalDuty] ?? 0;
  const total = Number(teachingJtm) + dutyJtm;
  const isEligible = total >= MIN_JTM_TPG;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        teacherId: workloadItem.teacherId,
        teachingJtm: Number(teachingJtm),
        additionalDutyType: additionalDuty,
        additionalDutyJtm: dutyJtm,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Beban Jam Mengajar (JTM)</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-xs text-gray-500">Nama Guru</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">{workloadItem.fullName}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Jam Tatap Muka Pokok (JTM) *
            </label>
            <input
              type="number"
              min={0}
              max={60}
              required
              value={teachingJtm}
              onChange={(e) => setTeachingJtm(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Tugas Tambahan Diakui Kemenag
            </label>
            <select
              value={additionalDuty}
              onChange={(e) => setAdditionalDuty(e.target.value as AdditionalDutyType)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white capitalize"
            >
              {ADDITIONAL_DUTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, " ")} ({ADDITIONAL_DUTY_JTM_MAP[type]} JTM)
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Akumulasi</p>
              <p className="text-lg font-bold text-gray-900">{total} JTM / Minggu</p>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                isEligible ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}
            >
              {isEligible ? "Layak TPG (≥24 JTM)" : "Belum Memenuhi (<24 JTM)"}
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "Simpan Beban"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
