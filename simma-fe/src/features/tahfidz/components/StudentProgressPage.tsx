import React, { useState } from "react";
import { Search, BookOpen, AlertCircle } from "lucide-react";
import { useStudentTahfidzProgress } from "../api/tahfidz.api";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { TahfidzProgressSummary } from "./TahfidzProgressSummary";

export const StudentProgressPage: React.FC = () => {
  const [studentInput, setStudentInput] = useState("");
  const [activeStudentId, setActiveStudentId] = useState("");

  const {
    data: progressData,
    isLoading,
    isError,
    error,
  } = useStudentTahfidzProgress(activeStudentId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentInput.trim()) {
      setActiveStudentId(studentInput.trim());
    }
  };

  const summary = progressData?.summary;
  const juzMap = progressData?.juzMap || [];
  const completedPercent = summary
    ? Math.round((summary.completedJuzCount / 30) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-slate-800">Monitoring Capaian Hafalan Siswa</h1>
        <p className="text-xs text-slate-500">
          Progres akumulasi 30 Juz Al-Qur'an dan status kelulusan ujian Tasmi' per santri/siswa
        </p>
      </div>

      {/* Student Selector */}
      <Card className="p-3">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-end gap-2.5">
          <div className="flex-1 w-full">
            <Input
              label="Masukkan UUID Siswa (Student ID)"
              placeholder="Contoh: 123e4567-e89b-12d3-a456-426614174000"
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
              required
            />
          </div>
          <Button type="submit" size="sm" className="gap-1.5 w-full sm:w-auto">
            <Search className="w-4 h-4" />
            <span>Lihat Progres</span>
          </Button>
        </form>
      </Card>

      {!activeStudentId ? (
        <Card className="p-8 text-center text-xs text-slate-500">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
          <p className="font-semibold text-slate-700">Pilih atau Masukkan ID Siswa</p>
          <p className="text-slate-400 mt-0.5">
            Ketik ID siswa pada kolom di atas untuk menampilkan bagan capaian 30 juz.
          </p>
        </Card>
      ) : isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500">Memuat capaian hafalan siswa...</div>
      ) : isError ? (
        <Card className="p-6 text-center text-xs text-red-600 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{(error as Error)?.message || "Gagal memuat capaian hafalan siswa."}</span>
        </Card>
      ) : (
        <TahfidzProgressSummary
          summary={summary}
          juzMap={juzMap}
          completedPercent={completedPercent}
        />
      )}
    </div>
  );
};
