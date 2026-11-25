import React from "react";
import {
  EMPLOYMENT_TYPES,
  GTK_TYPES,
  DUTY_STATUSES,
  type EmploymentType,
  type GtkType,
  type DutyStatus,
} from "@simma/shared";
import type { PositionDto } from "../../types";

export interface TeacherIdentityFormState {
  fullName: string;
  positionId: string;
  nik: string;
  nuptk: string;
  employmentType: EmploymentType;
  gtkType: GtkType;
  dutyStatus: DutyStatus;
  nip: string;
  nrg: string;
  pegId: string;
  certification: string;
  certificationField: string;
  tmtFirst: string;
  tmtPns: string;
}

interface Props {
  data: TeacherIdentityFormState;
  positions: PositionDto[];
  onChange: (next: TeacherIdentityFormState) => void;
}

const inputCls =
  "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none";

export const TeacherIdentityTab: React.FC<Props> = ({ data, positions, onChange }) => {
  const set = <K extends keyof TeacherIdentityFormState>(k: K, v: TeacherIdentityFormState[K]) =>
    onChange({ ...data, [k]: v });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap &amp; Gelar *</label>
        <input
          type="text"
          required
          value={data.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          placeholder="Contoh: Drs. H. Ahmad Fauzi, M.Pd."
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Jabatan Resmi Madrasah</label>
        <select
          value={data.positionId}
          onChange={(e) => set("positionId", e.target.value)}
          className={`${inputCls} bg-white`}
        >
          <option value="">-- Pilih Jabatan Resmi --</option>
          {positions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.category})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Status Tugas GTK *</label>
        <select
          value={data.dutyStatus}
          onChange={(e) => set("dutyStatus", e.target.value as DutyStatus)}
          className={`${inputCls} bg-white capitalize`}
        >
          {DUTY_STATUSES.map((d) => (
            <option key={d} value={d}>
              {d.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">NIK (16 Digit) *</label>
        <input
          type="text"
          maxLength={16}
          required
          value={data.nik}
          onChange={(e) => set("nik", e.target.value.replace(/\D/g, ""))}
          placeholder="3323..."
          className={`${inputCls} font-mono`}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">NUPTK (16 Digit)</label>
        <input
          type="text"
          maxLength={16}
          value={data.nuptk}
          onChange={(e) => set("nuptk", e.target.value.replace(/\D/g, ""))}
          placeholder="Opsional"
          className={`${inputCls} font-mono`}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Status Kepegawaian *</label>
        <select
          value={data.employmentType}
          onChange={(e) => set("employmentType", e.target.value as EmploymentType)}
          className={`${inputCls} bg-white`}
        >
          {EMPLOYMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Jenis GTK *</label>
        <select
          value={data.gtkType}
          onChange={(e) => set("gtkType", e.target.value as GtkType)}
          className={`${inputCls} bg-white`}
        >
          {GTK_TYPES.map((t) => (
            <option key={t} value={t}>
              {t === "pendidik" ? "Pendidik (Guru)" : "Tenaga Kependidikan (Tendik)"}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">NIP (PNS / PPPK)</label>
        <input type="text" value={data.nip} onChange={(e) => set("nip", e.target.value)} className={`${inputCls} font-mono`} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">PegID Simpatika</label>
        <input type="text" value={data.pegId} onChange={(e) => set("pegId", e.target.value)} className={inputCls} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">NRG (Nomor Registrasi Guru)</label>
        <input type="text" value={data.nrg} onChange={(e) => set("nrg", e.target.value)} className={`${inputCls} font-mono`} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Bidang Sertifikasi</label>
        <input
          type="text"
          value={data.certificationField}
          onChange={(e) => set("certificationField", e.target.value)}
          placeholder="Contoh: Fiqih / Matematika"
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">TMT Awal Mengabdi</label>
        <input type="date" value={data.tmtFirst} onChange={(e) => set("tmtFirst", e.target.value)} className={inputCls} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">TMT PNS / Inpassing</label>
        <input type="date" value={data.tmtPns} onChange={(e) => set("tmtPns", e.target.value)} className={inputCls} />
      </div>
    </div>
  );
};
