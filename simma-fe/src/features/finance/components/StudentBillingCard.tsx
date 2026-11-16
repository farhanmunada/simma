import React from "react";
import { User } from "lucide-react";
import type { StudentBillingProfileDto } from "../types";

interface StudentBillingCardProps {
  profile: StudentBillingProfileDto;
  onOpenDispensation: () => void;
}

export const StudentBillingCard: React.FC<StudentBillingCardProps> = ({
  profile,
  onOpenDispensation,
}) => {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{profile.student.fullName}</h3>
            <p className="text-xs text-slate-500">
              {profile.student.classroomName || "Tanpa Kelas"} | NIS: {profile.student.nis || "-"}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-500">Status Siswa:</span>
            <span className="font-semibold text-emerald-600 uppercase">{profile.student.status}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-50">
            <span className="text-slate-500">Total Tunggakan:</span>
            <span className="font-bold text-red-600 text-sm">
              Rp {profile.totalArrears.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Jumlah Tagihan Belum Lunas:</span>
            <span className="font-semibold text-slate-800">{profile.unpaidInvoices.length} Item</span>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={onOpenDispensation}
            className="w-full rounded-lg border border-amber-300 bg-amber-50 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100"
          >
            Ajukan Dispensasi Tunggakan
          </button>
        </div>
      </div>

      {profile.dispensations.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-xs">
          <h4 className="font-bold text-slate-800 mb-2">Riwayat Dispensasi</h4>
          <div className="space-y-2 max-h-36 overflow-y-auto">
            {profile.dispensations.map((d) => (
              <div key={d.id} className="p-2 bg-slate-50 rounded border border-slate-100">
                <div className="flex justify-between">
                  <span className="font-semibold">{d.reason}</span>
                  <span className="uppercase text-[10px] font-bold text-amber-600">{d.status}</span>
                </div>
                {d.notes && <p className="text-slate-500 mt-0.5">{d.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
