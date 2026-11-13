import React, { useState } from "react";
import { Plus, Search, Inbox, FileText, CheckCircle2, ExternalLink } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";
import {
  useIncomingLetters,
  useCreateIncomingLetter,
  useClassifications,
} from "../api/letters.api";
import type { IncomingLetter, CreateIncomingLetterInput } from "../types";

export const IncomingLettersPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailLetter, setDetailLetter] = useState<IncomingLetter | null>(null);

  const { data, isLoading } = useIncomingLetters({
    search: search || undefined,
    status: status || undefined,
  });

  const { data: classifications } = useClassifications();
  const createMutation = useCreateIncomingLetter();

  const [form, setForm] = useState<CreateIncomingLetterInput>({
    mailNumber: "",
    sender: "",
    mailDate: new Date().toISOString().split("T")[0],
    receivedDate: new Date().toISOString().split("T")[0],
    subject: "",
    summary: "",
    classificationCode: "PP.00.6",
    attachmentPath: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form, {
      onSuccess: () => {
        setIsModalOpen(false);
        setForm({
          mailNumber: "",
          sender: "",
          mailDate: new Date().toISOString().split("T")[0],
          receivedDate: new Date().toISOString().split("T")[0],
          subject: "",
          summary: "",
          classificationCode: "PP.00.6",
          attachmentPath: "",
        });
      },
    });
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "disposed":
        return <Badge variant="info">Disposisi</Badge>;
      case "processed":
        return <Badge variant="success">Diproses</Badge>;
      case "archived":
        return <Badge variant="neutral">Diarsipkan</Badge>;
      default:
        return <Badge variant="warning">Diterima</Badge>;
    }
  };

  const letters: IncomingLetter[] = data?.data ?? [];

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari perihal / nomor surat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Semua Status</option>
            <option value="received">Diterima</option>
            <option value="disposed">Didisposisi</option>
            <option value="processed">Diproses</option>
            <option value="archived">Diarsipkan</option>
          </select>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Catat Surat Masuk
        </button>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">No. Agenda</th>
                <th className="px-4 py-3">Surat & Asal Pengirim</th>
                <th className="px-4 py-3">Perihal & Ringkasan</th>
                <th className="px-4 py-3">Klasifikasi</th>
                <th className="px-4 py-3">Tanggal Diterima</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    Memuat data agenda surat masuk...
                  </td>
                </tr>
              ) : letters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    <Inbox className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-500 font-medium">Belum ada agenda surat masuk tercatat</p>
                  </td>
                </tr>
              ) : (
                letters.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setDetailLetter(row)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-medium text-emerald-700">
                      {row.agendaNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{row.mailNumber || row.senderLetterNumber || "-"}</p>
                      <p className="text-[11px] text-slate-500">{row.sender || row.senderName || "-"}</p>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium text-slate-800 line-clamp-1">{row.subject}</p>
                      {row.summary && (
                        <p className="text-[11px] text-slate-500 line-clamp-1">{row.summary}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] text-slate-700">
                        {row.classificationCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{row.receivedDate}</td>
                    <td className="px-4 py-3 text-right">{getStatusBadge(row.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Catat Surat Masuk */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Catat Surat Masuk Baru"
        description="PMA No. 12/2024: Surat dinas masuk diagendakan dengan nomor urut otomatis."
      >
        <form onSubmit={handleSubmit} className="space-y-3 mt-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Nomor Surat Pengirim</label>
              <input
                type="text"
                required
                value={form.mailNumber}
                onChange={(e) => setForm({ ...form, mailNumber: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                placeholder="Contoh: B-120/Kk.13.04/2026"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Instansi / Asal Pengirim</label>
              <input
                type="text"
                required
                value={form.sender}
                onChange={(e) => setForm({ ...form, sender: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                placeholder="Kantor Kemenag Kab/Kota"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Tanggal Surat</label>
              <input
                type="date"
                required
                value={form.mailDate}
                onChange={(e) => setForm({ ...form, mailDate: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Tanggal Diterima</label>
              <input
                type="date"
                required
                value={form.receivedDate}
                onChange={(e) => setForm({ ...form, receivedDate: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Perihal</label>
            <input
              type="text"
              required
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              placeholder="Undangan Koordinasi Asesmen Madrasah"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Kode Klasifikasi (KMA 44/2010)</label>
              <select
                value={form.classificationCode}
                onChange={(e) => setForm({ ...form, classificationCode: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                {(classifications || []).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Upload Berkas Scan / Foto Surat</label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const fakeUrl = URL.createObjectURL(file);
                    setForm({ ...form, attachmentPath: fakeUrl });
                  }
                }}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              {form.attachmentPath && (
                <p className="text-[10px] text-emerald-600 mt-1">Berkas terpilih siap diunggah</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">Ringkasan Isi (Opsional)</label>
            <textarea
              rows={2}
              value={form.summary || ""}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              placeholder="Ringkasan atau poin penting naskah dinas..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
            >
              {createMutation.isPending ? "Menyimpan..." : "Simpan Agenda"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Detail Surat Masuk & Preview File Scan */}
      {detailLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Detail Agenda Surat Masuk</h3>
                <p className="text-xs text-emerald-700 font-mono">
                  Agenda #{detailLetter.agendaNumber} — {detailLetter.mailNumber || detailLetter.senderLetterNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailLetter(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400">Instansi / Asal Pengirim:</span>
                  <p className="font-semibold text-slate-800">{detailLetter.sender || detailLetter.senderName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Klasifikasi KMA 44:</span>
                  <p className="font-semibold text-slate-800">{detailLetter.classificationCode}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400">Tanggal Surat:</span>
                  <p className="font-semibold">{detailLetter.mailDate}</p>
                </div>
                <div>
                  <span className="text-slate-400">Tanggal Diterima TU:</span>
                  <p className="font-semibold">{detailLetter.receivedDate}</p>
                </div>
              </div>
              <div>
                <span className="text-slate-400">Perihal:</span>
                <p className="font-semibold text-slate-900">{detailLetter.subject}</p>
              </div>
              {detailLetter.summary && (
                <div>
                  <span className="text-slate-400">Ringkasan Isi Surat:</span>
                  <p className="bg-white p-2.5 rounded border border-slate-200 text-slate-600 leading-relaxed">
                    {detailLetter.summary}
                  </p>
                </div>
              )}
            </div>

            {/* Area Preview File Scan / Berkas Lampiran */}
            <div className="border border-slate-200 rounded-lg p-3 bg-white">
              <span className="text-xs font-semibold text-slate-700 block mb-2">Berkas Scan / Lampiran Fisik:</span>
              {detailLetter.attachmentPath || detailLetter.fileUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-2.5 rounded-md">
                    <span className="text-xs text-emerald-800 font-mono truncate max-w-sm">
                      {detailLetter.attachmentPath || detailLetter.fileUrl}
                    </span>
                    <a
                      href={detailLetter.attachmentPath || detailLetter.fileUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Buka Layar Penuh
                    </a>
                  </div>
                  <div className="h-64 border border-slate-200 rounded bg-slate-100 flex items-center justify-center overflow-hidden">
                    {(detailLetter.attachmentPath || "").endsWith(".pdf") ? (
                      <iframe
                        src={detailLetter.attachmentPath || detailLetter.fileUrl || ""}
                        title="Scan Preview"
                        className="w-full h-full"
                      />
                    ) : (
                      <img
                        src={detailLetter.attachmentPath || detailLetter.fileUrl || ""}
                        alt="Scan Surat"
                        className="max-h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-4 text-center bg-slate-50 rounded border border-dashed border-slate-200">
                  Tidak ada berkas scan fisik yang dilampirkan pada agenda surat ini.
                </p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setDetailLetter(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
