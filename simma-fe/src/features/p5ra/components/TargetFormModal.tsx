import React, { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { P5RA_DIMENSIONS } from "@simma/shared";

interface TargetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    dimension: string;
    element: string;
    subElement: string;
    targetDescription: string;
    valuePra?: string;
    subValuePra?: string;
    orderIndex?: number;
  }) => void;
  isLoading?: boolean;
}

export const TargetFormModal: React.FC<TargetFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [dimension, setDimension] = useState<string>(P5RA_DIMENSIONS[0]);
  const [element, setElement] = useState("");
  const [subElement, setSubElement] = useState("");
  const [targetDescription, setTargetDescription] = useState("");
  const [valuePra, setValuePra] = useState("");
  const [subValuePra, setSubValuePra] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!element.trim() || !subElement.trim() || !targetDescription.trim()) return;

    onSubmit({
      dimension,
      element: element.trim(),
      subElement: subElement.trim(),
      targetDescription: targetDescription.trim(),
      valuePra: valuePra.trim() || undefined,
      subValuePra: subValuePra.trim() || undefined,
    });

    setElement("");
    setSubElement("");
    setTargetDescription("");
    setValuePra("");
    setSubValuePra("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Target Capaian Projek (P5 & PRA)"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Dimensi Profil Pelajar Pancasila <span className="text-red-500">*</span>
          </label>
          <Select
            value={dimension}
            onChange={(e) => setDimension(e.target.value)}
            options={P5RA_DIMENSIONS.map((d) => ({ label: d, value: d }))}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Elemen <span className="text-red-500">*</span>
            </label>
            <Input
              value={element}
              onChange={(e) => setElement(e.target.value)}
              placeholder="Contoh: Akhlak kepada alam"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Sub-Elemen <span className="text-red-500">*</span>
            </label>
            <Input
              value={subElement}
              onChange={(e) => setSubElement(e.target.value)}
              placeholder="Contoh: Menjaga lingkungan sekitar"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Deskripsi Target Capaian Fase <span className="text-red-500">*</span>
          </label>
          <textarea
            value={targetDescription}
            onChange={(e) => setTargetDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-slate-300 p-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Rumusan capaian yang diharapkan di akhir projek..."
            required
          />
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
          <span className="text-xs font-semibold text-slate-800">
            Nilai Profil Rahmatan Lil 'Alamin (PRA) Kemenag
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nilai Utama PRA
              </label>
              <Input
                value={valuePra}
                onChange={(e) => setValuePra(e.target.value)}
                placeholder="Contoh: Berkeadaban (Ta'addub)"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Sub-Nilai PRA
              </label>
              <Input
                value={subValuePra}
                onChange={(e) => setSubValuePra(e.target.value)}
                placeholder="Contoh: Saleh Sosial"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Simpan Target
          </Button>
        </div>
      </form>
    </Modal>
  );
};
