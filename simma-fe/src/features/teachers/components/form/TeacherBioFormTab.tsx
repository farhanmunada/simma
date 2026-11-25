import React from "react";

export interface TeacherBioFormState {
  noKk: string;
  birthPlace: string;
  birthDate: string;
  gender: "L" | "P";
  religion: string;
  marriageStatus: "menikah" | "belum_menikah" | "duda_janda";
  phone: string;
  email: string;
  address: string;
}

interface Props {
  data: TeacherBioFormState;
  onChange: (next: TeacherBioFormState) => void;
}

const inputCls =
  "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none";

export const TeacherBioFormTab: React.FC<Props> = ({ data, onChange }) => {
  const set = <K extends keyof TeacherBioFormState>(k: K, v: TeacherBioFormState[K]) =>
    onChange({ ...data, [k]: v });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Nomor KK (16 Digit)</label>
        <input
          type="text"
          maxLength={16}
          value={data.noKk}
          onChange={(e) => set("noKk", e.target.value.replace(/\D/g, ""))}
          placeholder="16 digit Nomor Kartu Keluarga"
          className={`${inputCls} font-mono`}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Jenis Kelamin</label>
        <div className="flex gap-4 pt-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="gtk-gender"
              checked={data.gender === "L"}
              onChange={() => set("gender", "L")}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            Laki-Laki
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="gtk-gender"
              checked={data.gender === "P"}
              onChange={() => set("gender", "P")}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            Perempuan
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Tempat Lahir</label>
        <input
          type="text"
          value={data.birthPlace}
          onChange={(e) => set("birthPlace", e.target.value)}
          placeholder="Contoh: Temanggung"
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Tanggal Lahir</label>
        <input
          type="date"
          value={data.birthDate}
          onChange={(e) => set("birthDate", e.target.value)}
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Agama</label>
        <input
          type="text"
          value={data.religion}
          onChange={(e) => set("religion", e.target.value)}
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Status Pernikahan</label>
        <select
          value={data.marriageStatus}
          onChange={(e) =>
            set("marriageStatus", e.target.value as TeacherBioFormState["marriageStatus"])
          }
          className={`${inputCls} bg-white`}
        >
          <option value="menikah">Menikah</option>
          <option value="belum_menikah">Belum Menikah</option>
          <option value="duda_janda">Duda / Janda</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">No. WhatsApp / HP</label>
        <input
          type="text"
          value={data.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="0812..."
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="nama@pippmanbaulhikmah.com"
          className={inputCls}
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-xs font-semibold text-gray-700 mb-1">Alamat Domisili Lengkap</label>
        <textarea
          rows={2}
          value={data.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Dusun, Desa, Kecamatan, Kabupaten/Kota..."
          className={inputCls}
        />
      </div>
    </div>
  );
};
