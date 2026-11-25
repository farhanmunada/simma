import React from "react";
import { MessageCircle, MapPin, Mail, Globe, ExternalLink } from "lucide-react";
import type { InstitutionPublicProfile } from "../../types";

interface Props {
  institution: InstitutionPublicProfile;
}

export const PpdbContactHelpSection: React.FC<Props> = ({ institution }) => {
  const waContacts = [
    { label: "Konsultasi PPDB", number: institution.whatsapp.konsultasi },
    { label: "Pengurus Putra", number: institution.whatsapp.pengurusPutra },
    { label: "Pengurus Putri", number: institution.whatsapp.pengurusPutri },
    { label: "Bendahara", number: institution.whatsapp.bendahara },
  ].filter((c) => c.number);

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
      aria-labelledby="kontak-ppdb-heading"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-3">
          <h2 id="kontak-ppdb-heading" className="text-base font-bold text-slate-900">
            Pusat Informasi &amp; Bantuan Wali Santri
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Butuh bantuan pendaftaran atau ingin berkonsultasi mengenai program pesantren dan madrasah? Hubungi tim resmi kami melalui WhatsApp atau kunjungi lokasi pondok.
          </p>

          <div className="space-y-2 pt-1 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{institution.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <a
                href={`mailto:${institution.email}`}
                className="text-emerald-700 hover:underline font-medium"
              >
                {institution.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
              <a
                href={institution.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:underline font-medium inline-flex items-center gap-1"
              >
                <span>{institution.website.replace(/^https?:\/\//, "")}</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-3">
          <p className="text-xs font-semibold text-slate-700">Layanan WhatsApp Resmi</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {waContacts.map((wa) => (
              <a
                key={wa.label}
                href={`https://wa.me/${wa.number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 px-4 py-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{wa.label}</span>
                    <span className="text-[11px] text-slate-600">+{wa.number}</span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
              </a>
            ))}
          </div>

          <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
            <span>Facebook: <strong className="text-slate-700">{institution.social.facebook}</strong></span>
            <span>Instagram: <strong className="text-slate-700">@{institution.social.instagram}</strong></span>
            <span>YouTube: <strong className="text-slate-700">{institution.social.youtube}</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
};
