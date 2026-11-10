import React from "react";
import { useParams, Link } from "react-router";
import { ShieldCheck, AlertCircle, FileText, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useVerifyLetter } from "../api/letters-generator.api";

export const VerifyLetterPublicPage: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const { data, isLoading, isError } = useVerifyLetter(hash || "");

  const letter = data?.data;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-700 text-white p-6 text-center">
          <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Verifikasi Keaslian Naskah Dinas</h1>
          <p className="text-xs text-emerald-100 mt-1">
            Kementerian Agama Republik Indonesia — Sistem Informasi Madrasah Aliyah (SIMMA)
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {isLoading ? (
            <div className="py-12 text-center text-slate-500">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium">Memverifikasi tanda tangan digital dan integritas naskah...</p>
            </div>
          ) : isError || !letter ? (
            <div className="py-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-slate-800">Dokumen Tidak Ditemukan / Tidak Valid</h2>
              <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
                Tanda tangan digital atau kode verifikasi surat dinas ini tidak terdaftar dalam pangkalan data resmi madrasah.
              </p>
              <div className="mt-6">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                <div className="text-xs">
                  <p className="font-semibold">Naskah Dinas Asli & Terverifikasi</p>
                  <p className="text-emerald-700">Diterbitkan secara sah oleh instansi madrasah.</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500">Nomor Surat</span>
                  <span className="font-mono font-bold text-slate-800">{letter.letterNumber}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500">Klasifikasi</span>
                  <span className="text-slate-800">{letter.classificationCode}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500">Perihal</span>
                  <span className="font-medium text-slate-800 text-right max-w-xs">{letter.subject}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500">Penerima</span>
                  <span className="text-slate-800">{letter.recipientName}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500">Penandatangan</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {letter.signerName || "Kepala Madrasah"}
                  </span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500">Kode Hash Integritas</span>
                  <span className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]" title={letter.verificationHash}>
                    {letter.verificationHash}
                  </span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  <FileText className="w-3.5 h-3.5" /> Menuju Portal SIMMA
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
