import React from "react";
import { Link } from "react-router";
import {
  Building2,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useInstitutionProfileForm } from "../hooks/useInstitutionProfileForm";
import { InstitutionIdentityForm } from "./profile/InstitutionIdentityForm";
import { InstitutionContactForm } from "./profile/InstitutionContactForm";
import { InstitutionLeadershipForm } from "./profile/InstitutionLeadershipForm";
import { InstitutionPesantrenProfileForm } from "./profile/InstitutionPesantrenProfileForm";

export const InstitutionProfilePage: React.FC = () => {
  const {
    institution,
    isLoading,
    isRefetching,
    refetch,
    isSaving,
    message,
    identity,
    setIdentity,
    contact,
    setContact,
    leadership,
    setLeadership,
    pesantren,
    setPesantren,
    applyManbaulTemplate,
    handleSubmit,
  } = useInstitutionProfileForm();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        <span className="text-sm">Memuat profil madrasah...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
            <img
              src={institution?.logoPath || "/images/logo-manbaul-hikmah.png"}
              alt="Logo Madrasah"
              className="w-9 h-9 object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Profil Madrasah
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Data pokok madrasah untuk kop surat, rapor RDM Kemenag, validasi EMIS 4.0, dan Portal PPDB Publik.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start">
          <button
            type="button"
            onClick={applyManbaulTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Muat Data PIPP Manba'ul Hikmah
          </button>

          <Link
            to="/ppdb"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Portal PPDB
          </Link>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            Segarkan
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <InstitutionIdentityForm
          data={identity}
          onChange={(k, v) => setIdentity((prev) => ({ ...prev, [k]: v }))}
          disabled={isSaving}
        />

        <InstitutionContactForm
          data={contact}
          onChange={(k, v) => setContact((prev) => ({ ...prev, [k]: v }))}
          disabled={isSaving}
        />

        <InstitutionLeadershipForm
          data={leadership}
          onChange={(k, v) => setLeadership((prev) => ({ ...prev, [k]: v }))}
          disabled={isSaving}
        />

        <InstitutionPesantrenProfileForm
          data={pesantren}
          onChange={(k, v) => setPesantren((prev) => ({ ...prev, [k]: v }))}
          disabled={isSaving}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 transition-colors"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan Profil
          </button>
        </div>
      </form>
    </div>
  );
};
