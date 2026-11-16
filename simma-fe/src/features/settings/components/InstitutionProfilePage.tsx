import React, { useState, useEffect } from "react";
import {
  Building2,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useInstitution, useUpdateInstitution } from "../api/settings.api";
import {
  InstitutionIdentityForm,
  type IdentityFormData,
} from "./profile/InstitutionIdentityForm";
import {
  InstitutionContactForm,
  type ContactFormData,
} from "./profile/InstitutionContactForm";
import {
  InstitutionLeadershipForm,
  type LeadershipFormData,
} from "./profile/InstitutionLeadershipForm";

export const InstitutionProfilePage: React.FC = () => {
  const { data: institution, isLoading, refetch, isRefetching } = useInstitution();
  const updateMutation = useUpdateInstitution();

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [identity, setIdentity] = useState<IdentityFormData>({
    nsm: "",
    npsn: "",
    name: "",
    status: "swasta",
    akreditasi: "A",
    kurikulum: "Kurikulum Merdeka Kemenag",
  });

  const [contact, setContact] = useState<ContactFormData>({
    address: "",
    village: "",
    district: "",
    city: "",
    province: "",
    postalCode: "",
    phone: "",
    email: "",
    website: "",
  });

  const [leadership, setLeadership] = useState<LeadershipFormData>({
    headmaster: "",
    headmasterNip: "",
    skPendirian: "",
    skIzinOperasional: "",
  });

  useEffect(() => {
    if (!institution) return;
    const emis = (institution.emisData || {}) as Record<string, any>;

    setIdentity({
      nsm: institution.nsm || "",
      npsn: institution.npsn || "",
      name: institution.name || "",
      status: (institution.status as any) || "swasta",
      akreditasi: emis.akreditasi || institution.accreditation || "A",
      kurikulum: emis.kurikulum || "Kurikulum Merdeka Kemenag",
    });

    setContact({
      address: institution.address || "",
      village: emis.village || institution.village || "",
      district: emis.district || institution.district || "",
      city: emis.city || institution.city || "",
      province: emis.province || institution.province || "",
      postalCode: emis.postalCode || "",
      phone: emis.phone || "",
      email: emis.email || "",
      website: emis.website || "",
    });

    setLeadership({
      headmaster: emis.headmaster || institution.headmasterName || "",
      headmasterNip: emis.headmasterNip || institution.headmasterNip || "",
      skPendirian: emis.skPendirian || "",
      skIzinOperasional: emis.skIzinOperasional || "",
    });
  }, [institution]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (identity.nsm.length !== 12) {
      setMessage({ type: "error", text: "NSM wajib 12 digit numerik." });
      return;
    }
    if (identity.npsn.length !== 8) {
      setMessage({ type: "error", text: "NPSN wajib 8 digit numerik." });
      return;
    }
    if (!identity.name.trim()) {
      setMessage({ type: "error", text: "Nama resmi madrasah wajib diisi." });
      return;
    }
    if (!contact.address.trim()) {
      setMessage({ type: "error", text: "Alamat madrasah wajib diisi." });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: institution?.id,
        data: {
          nsm: identity.nsm,
          npsn: identity.npsn,
          name: identity.name,
          status: identity.status.toLowerCase() as "negeri" | "swasta",
          address: contact.address,
          emisData: {
            akreditasi: identity.akreditasi,
            kurikulum: identity.kurikulum,
            village: contact.village,
            district: contact.district,
            city: contact.city,
            province: contact.province,
            postalCode: contact.postalCode,
            phone: contact.phone,
            email: contact.email,
            website: contact.website,
            headmaster: leadership.headmaster,
            headmasterNip: leadership.headmasterNip,
            skPendirian: leadership.skPendirian,
            skIzinOperasional: leadership.skIzinOperasional,
          },
        },
      });

      setMessage({ type: "success", text: "Profil madrasah berhasil diperbarui." });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.message || "Gagal memperbarui profil madrasah.",
      });
    }
  };

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-600" />
            Profil Madrasah
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data pokok madrasah untuk kop surat, rapor RDM Kemenag, dan validasi EMIS 4.0.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />
          Segarkan
        </button>
      </div>

      {/* Alert Messages */}
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

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <InstitutionIdentityForm
          data={identity}
          onChange={(k, v) => setIdentity((prev) => ({ ...prev, [k]: v }))}
          disabled={updateMutation.isPending}
        />

        <InstitutionContactForm
          data={contact}
          onChange={(k, v) => setContact((prev) => ({ ...prev, [k]: v }))}
          disabled={updateMutation.isPending}
        />

        <InstitutionLeadershipForm
          data={leadership}
          onChange={(k, v) => setLeadership((prev) => ({ ...prev, [k]: v }))}
          disabled={updateMutation.isPending}
        />

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50 transition-colors"
          >
            {updateMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Simpan Perubahan Profil
          </button>
        </div>
      </form>
    </div>
  );
};
