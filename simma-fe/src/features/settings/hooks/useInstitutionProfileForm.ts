import { useState, useEffect } from "react";
import { DEFAULT_INSTITUTION_PUBLIC_PROFILE } from "@simma/shared";
import { useInstitution, useUpdateInstitution } from "../api/settings.api";
import type { IdentityFormData } from "../components/profile/InstitutionIdentityForm";
import type { ContactFormData } from "../components/profile/InstitutionContactForm";
import type { LeadershipFormData } from "../components/profile/InstitutionLeadershipForm";
import type { PesantrenProfileFormData } from "../components/profile/InstitutionPesantrenProfileForm";

const def = DEFAULT_INSTITUTION_PUBLIC_PROFILE;

export function useInstitutionProfileForm() {
  const { data: institution, isLoading, refetch, isRefetching } = useInstitution();
  const updateMutation = useUpdateInstitution();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [identity, setIdentity] = useState<IdentityFormData>({
    nsm: "",
    npsn: "",
    name: "",
    status: "swasta",
    akreditasi: "A",
    kurikulum: def.kurikulum,
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

  const [pesantren, setPesantren] = useState<PesantrenProfileFormData>({
    foundedYear: def.foundedYear,
    pengasuh: def.pengasuh,
    about: def.about,
    vision: def.vision,
    missionsText: def.missions.join("\n"),
    whatsappKonsultasi: def.whatsapp.konsultasi,
    whatsappPutra: def.whatsapp.pengurusPutra,
    whatsappPutri: def.whatsapp.pengurusPutri,
    whatsappBendahara: def.whatsapp.bendahara,
    facebook: def.social.facebook,
    instagram: def.social.instagram,
    youtube: def.social.youtube,
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
      kurikulum: emis.kurikulum || def.kurikulum,
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
    setPesantren({
      foundedYear: emis.foundedYear || def.foundedYear,
      pengasuh: emis.pengasuh || def.pengasuh,
      about: emis.about || def.about,
      vision: emis.vision || def.vision,
      missionsText: Array.isArray(emis.missions) ? emis.missions.join("\n") : def.missions.join("\n"),
      whatsappKonsultasi: emis.whatsappKonsultasi || def.whatsapp.konsultasi,
      whatsappPutra: emis.whatsappPutra || def.whatsapp.pengurusPutra,
      whatsappPutri: emis.whatsappPutri || def.whatsapp.pengurusPutri,
      whatsappBendahara: emis.whatsappBendahara || def.whatsapp.bendahara,
      facebook: emis.facebook || def.social.facebook,
      instagram: emis.instagram || def.social.instagram,
      youtube: emis.youtube || def.social.youtube,
    });
  }, [institution]);

  const applyManbaulTemplate = () => {
    setIdentity((p) => ({ ...p, name: def.name, status: def.status, akreditasi: def.akreditasi, kurikulum: def.kurikulum }));
    setContact((p) => ({
      ...p,
      address: def.address,
      village: def.village,
      district: def.district,
      city: def.city,
      province: def.province,
      postalCode: def.postalCode,
      phone: def.phone,
      email: def.email,
      website: def.website,
    }));
    setPesantren({
      foundedYear: def.foundedYear,
      pengasuh: def.pengasuh,
      about: def.about,
      vision: def.vision,
      missionsText: def.missions.join("\n"),
      whatsappKonsultasi: def.whatsapp.konsultasi,
      whatsappPutra: def.whatsapp.pengurusPutra,
      whatsappPutri: def.whatsapp.pengurusPutri,
      whatsappBendahara: def.whatsapp.bendahara,
      facebook: def.social.facebook,
      instagram: def.social.instagram,
      youtube: def.social.youtube,
    });
    setMessage({
      type: "success",
      text: "Template data PIPP Manba'ul Hikmah dimuat. Klik Simpan Perubahan Profil untuk menyimpan.",
    });
  };

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

    const missions = pesantren.missionsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

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
            foundedYear: pesantren.foundedYear,
            pengasuh: pesantren.pengasuh,
            about: pesantren.about,
            vision: pesantren.vision,
            missions,
            whatsappKonsultasi: pesantren.whatsappKonsultasi,
            whatsappPutra: pesantren.whatsappPutra,
            whatsappPutri: pesantren.whatsappPutri,
            whatsappBendahara: pesantren.whatsappBendahara,
            facebook: pesantren.facebook,
            instagram: pesantren.instagram,
            youtube: pesantren.youtube,
          },
        },
      });
      setMessage({ type: "success", text: "Profil madrasah berhasil diperbarui." });
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Gagal memperbarui profil madrasah." });
    }
  };

  return {
    institution,
    isLoading,
    isRefetching,
    refetch,
    isSaving: updateMutation.isPending,
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
  };
}
