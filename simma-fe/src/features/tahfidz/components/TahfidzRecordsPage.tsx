import React, { useState } from "react";
import {
  Plus,
  Filter,
  Trash2,
  Edit2,
  AlertTriangle,
} from "lucide-react";
import {
  useTahfidzRecords,
  useCreateTahfidzRecord,
  useUpdateTahfidzRecord,
  useDeleteTahfidzRecord,
} from "../api/tahfidz.api";
import type {
  TahfidzRecord,
  TahfidzType,
  TahfidzStatus,
  TahfidzQueryParams,
} from "../types";
import { QURAN_SURAHS, getSurahName } from "../types";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";

export const TahfidzRecordsPage: React.FC = () => {
  // Filters
  const [filterType, setFilterType] = useState<string>("");
  const [filterJuz, setFilterJuz] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  const queryParams: TahfidzQueryParams = {
    type: filterType ? (filterType as TahfidzType) : undefined,
    juz: filterJuz ? parseInt(filterJuz, 10) : undefined,
    status: filterStatus ? (filterStatus as TahfidzStatus) : undefined,
    startDate: filterStartDate || undefined,
    endDate: filterEndDate || undefined,
  };

  const { data: recordsData, isLoading, isError, error } = useTahfidzRecords(queryParams);
  const records = recordsData?.data || [];

  const createMutation = useCreateTahfidzRecord();
  const updateMutation = useUpdateTahfidzRecord();
  const deleteMutation = useDeleteTahfidzRecord();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TahfidzRecord | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [studentId, setStudentId] = useState("");
  const [type, setType] = useState<TahfidzType>("Z");
  const [juz, setJuz] = useState(30);
  const [surah, setSurah] = useState(78);
  const [ayahStart, setAyahStart] = useState(1);
  const [ayahEnd, setAyahEnd] = useState(10);
  const [tajwidScore, setTajwidScore] = useState(85);
  const [makhrojScore, setMakhrojScore] = useState(85);
  const [fluencyScore, setFluencyScore] = useState(85);
  const [status, setStatus] = useState<TahfidzStatus>("lulus");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setStudentId("");
    setType("Z");
    setJuz(30);
    setSurah(78);
    setAyahStart(1);
    setAyahEnd(10);
    setTajwidScore(85);
    setMakhrojScore(85);
    setFluencyScore(85);
    setStatus("lulus");
    setNotes("");
    setDate(new Date().toISOString().split("T")[0]);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: TahfidzRecord) => {
    setEditingRecord(rec);
    setStudentId(rec.studentId);
    setType(rec.type);
    setJuz(rec.juz);
    setSurah(rec.surah);
    setAyahStart(rec.ayahStart);
    setAyahEnd(rec.ayahEnd);
    setTajwidScore(rec.tajwidScore);
    setMakhrojScore(rec.makhrojScore);
    setFluencyScore(rec.fluencyScore);
    setStatus(rec.status);
    setNotes(rec.notes || "");
    setDate(rec.date);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!studentId.trim()) {
      setFormError("ID Siswa wajib diisi.");
      return;
    }
    if (juz < 1 || juz > 30) {
      setFormError("Juz harus di antara 1 sampai 30.");
      return;
    }
    if (surah < 1 || surah > 114) {
      setFormError("Nomor surah harus di antara 1 sampai 114.");
      return;
    }
    if (ayahStart <= 0 || ayahEnd <= 0) {
      setFormError("Nomor ayat harus lebih besar dari 0.");
      return;
    }
    if (ayahStart > ayahEnd) {
      setFormError("Ayat awal tidak boleh lebih besar dari ayat akhir.");
      return;
    }
    if (
      tajwidScore < 0 ||
      tajwidScore > 100 ||
      makhrojScore < 0 ||
      makhrojScore > 100 ||
      fluencyScore < 0 ||
      fluencyScore > 100
    ) {
      setFormError("Skor penilaian harus dalam rentang 0 - 100.");
      return;
    }

    try {
      if (editingRecord) {
        await updateMutation.mutateAsync({
          id: editingRecord.id,
          data: {
            studentId: studentId.trim(),
            type,
            juz,
            surah,
            ayahStart,
            ayahEnd,
            tajwidScore,
            makhrojScore,
            fluencyScore,
            status,
            notes: notes.trim() || null,
            date,
          },
        });
      } else {
        await createMutation.mutateAsync({
          studentId: studentId.trim(),
          type,
          juz,
          surah,
          ayahStart,
          ayahEnd,
          tajwidScore,
          makhrojScore,
          fluencyScore,
          status,
          notes: notes.trim() || null,
          date,
        });
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setFormError(apiErr?.message || "Gagal menyimpan data setoran.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data setoran ini?")) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      alert(apiErr?.message || "Gagal menghapus catatan setoran.");
    }
  };

  const surahOptions = QURAN_SURAHS.map((s) => ({
    value: s.number,
    label: `${s.number}. ${s.name} (${s.totalAyahs} ayat)`,
  }));

  const juzOptions = Array.from({ length: 30 }, (_, i) => ({
    value: i + 1,
    label: `Juz ${i + 1}`,
  }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Setoran Hafalan Al-Qur'an</h1>
          <p className="text-xs text-slate-500">
            Pencatatan harian Ziyadah (tambah hafalan) & Muraja'ah (pengulangan)
          </p>
        </div>
        <Button onClick={handleOpenAdd} size="sm" className="gap-1.5 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>Tambah Setoran</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-3">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-600">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter Setoran</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
          <Select
            label="Tipe Setoran"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            options={[
              { value: "", label: "Semua Tipe" },
              { value: "Z", label: "Ziyadah (Baru)" },
              { value: "M", label: "Muraja'ah (Ulang)" },
            ]}
          />
          <Select
            label="Juz"
            value={filterJuz}
            onChange={(e) => setFilterJuz(e.target.value)}
            options={[{ value: "", label: "Semua Juz" }, ...juzOptions]}
          />
          <Select
            label="Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: "", label: "Semua Status" },
              { value: "lulus", label: "Lulus" },
              { value: "perlu_perbaikan", label: "Perlu Perbaikan" },
            ]}
          />
          <Input
            type="date"
            label="Mulai Tanggal"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
          />
          <Input
            type="date"
            label="Sampai Tanggal"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
          />
        </div>
      </Card>

      {/* Table Data */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Memuat riwayat setoran...</div>
        ) : isError ? (
          <div className="p-6 text-center text-xs text-red-600 flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{(error as Error)?.message || "Gagal memuat riwayat setoran."}</span>
          </div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Belum ada catatan setoran hafalan yang cocok dengan filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs">
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Siswa ID</th>
                  <th className="py-2.5 px-3 text-center">Tipe</th>
                  <th className="py-2.5 px-3">Capaian Ayat</th>
                  <th className="py-2.5 px-3 text-center">Nilai (T / M / K)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3">Catatan</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-xs">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-xs">
                      {item.studentId.slice(0, 8)}...
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {item.type === "Z" ? (
                        <Badge variant="success" size="sm">
                          Ziyadah
                        </Badge>
                      ) : (
                        <Badge variant="info" size="sm">
                          Muraja'ah
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800">
                      <div className="font-medium text-xs">
                        Juz {item.juz} • {getSurahName(item.surah)}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Ayat {item.ayahStart} - {item.ayahEnd}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center text-xs font-mono text-slate-700">
                      <span title="Tajwid">{item.tajwidScore}</span> /{" "}
                      <span title="Makhroj">{item.makhrojScore}</span> /{" "}
                      <span title="Kelancaran">{item.fluencyScore}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {item.status === "lulus" ? (
                        <Badge variant="success" size="sm">
                          Lulus
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          Perlu Perbaikan
                        </Badge>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-500 max-w-xs truncate">
                      {item.notes || "-"}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          title="Edit Catatan"
                          onClick={() => handleOpenEdit(item)}
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                          title="Hapus Catatan"
                          onClick={() => handleDelete(item.id)}
                          isLoading={
                            deleteMutation.isPending &&
                            deleteMutation.variables === item.id
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Input / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingRecord ? "Edit Setoran Hafalan" : "Tambah Setoran Hafalan"}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {formError && (
            <div className="p-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="UUID Siswa (Student ID)"
                placeholder="Contoh: 123e4567-e89b-12d3-a456-426614174000"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
            </div>
            <Input
              type="date"
              label="Tanggal Setoran"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Tipe Setoran"
              value={type}
              onChange={(e) => setType(e.target.value as TahfidzType)}
              options={[
                { value: "Z", label: "Ziyadah (Setoran Baru)" },
                { value: "M", label: "Muraja'ah (Pengulangan)" },
              ]}
            />
            <Select
              label="Juz"
              value={juz}
              onChange={(e) => setJuz(parseInt(e.target.value, 10))}
              options={juzOptions}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <Select
                label="Surah"
                value={surah}
                onChange={(e) => setSurah(parseInt(e.target.value, 10))}
                options={surahOptions}
              />
            </div>
            <Input
              type="number"
              label="Ayat Mulai"
              min={1}
              value={ayahStart}
              onChange={(e) => setAyahStart(parseInt(e.target.value, 10) || 1)}
              required
            />
            <Input
              type="number"
              label="Ayat Selesai"
              min={1}
              value={ayahEnd}
              onChange={(e) => setAyahEnd(parseInt(e.target.value, 10) || 1)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              type="number"
              label="Skor Tajwid (0-100)"
              min={0}
              max={100}
              value={tajwidScore}
              onChange={(e) => setTajwidScore(parseInt(e.target.value, 10) || 0)}
              required
            />
            <Input
              type="number"
              label="Skor Makhroj (0-100)"
              min={0}
              max={100}
              value={makhrojScore}
              onChange={(e) => setMakhrojScore(parseInt(e.target.value, 10) || 0)}
              required
            />
            <Input
              type="number"
              label="Skor Kelancaran (0-100)"
              min={0}
              max={100}
              value={fluencyScore}
              onChange={(e) => setFluencyScore(parseInt(e.target.value, 10) || 0)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Status Kelulusan"
              value={status}
              onChange={(e) => setStatus(e.target.value as TahfidzStatus)}
              options={[
                { value: "lulus", label: "Lulus" },
                { value: "perlu_perbaikan", label: "Perlu Perbaikan" },
              ]}
            />
            <Input
              label="Catatan Guru / Pembimbing"
              placeholder="Contoh: Perhatikan mad wajib dan ghunnah"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              Simpan Setoran
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
