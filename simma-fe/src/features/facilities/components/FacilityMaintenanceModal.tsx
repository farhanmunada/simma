import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import type { FacilityAsset } from "../types";
import { useCreateFacilityMaintenanceTicket } from "../api/facilities.api";

interface FacilityMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAsset?: FacilityAsset | null;
  assets: FacilityAsset[];
}

export const FacilityMaintenanceModal: React.FC<FacilityMaintenanceModalProps> = ({
  isOpen,
  onClose,
  selectedAsset,
  assets,
}) => {
  const [assetId, setAssetId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("SEDANG");
  const [cost, setCost] = useState(0);
  const [reporterName, setReporterName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createTicketMutation = useCreateFacilityMaintenanceTicket();

  useEffect(() => {
    setAssetId(selectedAsset ? selectedAsset.id : assets[0]?.id || "");
    setTitle("");
    setDescription("");
    setPriority("SEDANG");
    setCost(0);
    setReporterName("");
    setError(null);
  }, [isOpen, selectedAsset, assets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!assetId) {
      setError("Pilih aset yang mengalami kerusakan.");
      return;
    }
    if (!title.trim() || !description.trim()) {
      setError("Judul kerusakan dan deskripsi detail wajib diisi.");
      return;
    }

    try {
      await createTicketMutation.mutateAsync({
        assetId,
        title,
        description,
        priority: priority as any,
        cost: Number(cost) || 0,
        reporterName: reporterName || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Gagal membuat tiket perbaikan aset");
    }
  };

  const isSaving = createTicketMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Laporkan Kerusakan / Ajukan Pemeliharaan"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {error && (
          <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
            {error}
          </div>
        )}

        <Select
          label="Pilih Aset Yang Bermasalah *"
          value={assetId}
          onChange={(e) => setAssetId(e.target.value)}
          options={assets.map((a) => ({
            value: a.id,
            label: `${a.name} (${a.code}) - ${a.location || "Tanpa Lokasi"}`,
          }))}
        />

        <Input
          label="Gejala / Judul Kerusakan *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Lampu proyektor mati mendadak"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Tingkat Prioritas"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { value: "RENDAH", label: "Rendah (Dapat Ditunda)" },
              { value: "SEDANG", label: "Sedang (Normal)" },
              { value: "TINGGI", label: "Tinggi (Mengganggu KBM)" },
              { value: "DARURAT", label: "Darurat (Segera Ditangani)" },
            ]}
          />
          <Input
            label="Estimasi Biaya Servis (Rp)"
            type="number"
            min="0"
            value={cost}
            onChange={(e) => setCost(Number(e.target.value))}
          />
        </div>

        <Input
          label="Nama Pelapor / Pengguna"
          value={reporterName}
          onChange={(e) => setReporterName(e.target.value)}
          placeholder="Nama guru / laboran yang menemukan kendala"
        />

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">
            Deskripsi Kerusakan & Kronologi *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Jelaskan secara rinci kondisi fisik atau indikasi kerusakan barang..."
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
            Batal
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Menyimpan..." : "Kirim Laporan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
