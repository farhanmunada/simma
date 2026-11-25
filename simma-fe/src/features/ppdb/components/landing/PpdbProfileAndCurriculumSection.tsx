import React from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { BookOpen, Building2, Compass, CheckCircle2, Quote } from "lucide-react";
import type { InstitutionPublicProfile } from "../../types";

interface Props {
  institution: InstitutionPublicProfile;
}

export const PpdbProfileAndCurriculumSection: React.FC<Props> = ({ institution }) => {
  return (
    <section className="space-y-6" aria-labelledby="profil-madrasah-heading">
      {/* Visi & Misi + Profil Singkat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
              Sekilas Profil
            </span>
            <h2 id="profil-madrasah-heading" className="text-lg font-bold text-slate-900">
              {institution.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{institution.about}</p>
          </div>

          <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/70 p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <Quote className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>Visi Lembaga</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed italic">
              &ldquo;{institution.vision}&rdquo;
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Misi Pendidikan</h3>
            <span className="text-xs text-slate-500">{institution.missions.length} Pilar Utama</span>
          </div>

          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {institution.missions.map((mission, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed"
              >
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{mission}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Interactive Tabs: Kurikulum, Fasilitas, Ekstrakurikuler */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <TabGroup>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Kurikulum, Fasilitas &amp; Ekstrakurikuler
              </h3>
              <p className="text-xs text-slate-500">
                Ekosistem belajar formal madrasah dan pesantren salafiyah di {institution.name}.
              </p>
            </div>

            <TabList className="flex flex-wrap gap-1.5 bg-slate-100 p-1 rounded-xl">
              {[
                { label: "Kurikulum Diniyah", icon: BookOpen },
                { label: `Fasilitas (${institution.facilities.length})`, icon: Building2 },
                { label: `Ekstrakurikuler (${institution.extracurriculars.length})`, icon: Compass },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <Tab
                    key={tab.label}
                    className={({ selected }) =>
                      `cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                        selected
                          ? "bg-white text-emerald-800 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{tab.label}</span>
                  </Tab>
                );
              })}
            </TabList>
          </div>

          <TabPanels className="pt-5">
            <TabPanel className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-2.5">
                <h4 className="text-sm font-bold text-emerald-900">
                  Program Diniyah Tingkat Aliyah
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {institution.diniyahCurriculum.aliyah.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
                <h4 className="text-sm font-bold text-slate-900">
                  Program Diniyah Tingkat Tsanawiyah &amp; ISMA
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {institution.diniyahCurriculum.tsanawiyah.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabPanel>

            <TabPanel>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {institution.facilities.map((facility) => (
                  <div
                    key={facility}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-medium text-slate-800"
                  >
                    <Building2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>{facility}</span>
                  </div>
                ))}
              </div>
            </TabPanel>

            <TabPanel>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {institution.extracurriculars.map((ekskul) => (
                  <div
                    key={ekskul}
                    className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/30 px-3.5 py-2.5 text-xs font-medium text-slate-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>{ekskul}</span>
                  </div>
                ))}
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </section>
  );
};
