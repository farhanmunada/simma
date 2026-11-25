import React from "react";
import { DEFAULT_INSTITUTION_PUBLIC_PROFILE } from "@simma/shared";
import type { PpdbPublicInfo } from "../types";
import { PpdbHeroSection } from "./landing/PpdbHeroSection";
import { PpdbProfileAndCurriculumSection } from "./landing/PpdbProfileAndCurriculumSection";
import { PpdbFlowAndRequirementsSection } from "./landing/PpdbFlowAndRequirementsSection";
import { PpdbContactHelpSection } from "./landing/PpdbContactHelpSection";

interface PpdbLandingProps {
  publicInfo?: PpdbPublicInfo;
  onGoToRegister: () => void;
  onGoToLogin: () => void;
  onGoToCheckStatus: () => void;
}

const DEFAULT_TRACKS = [
  { id: "reguler", name: "Jalur Reguler" },
  { id: "prestasi", name: "Jalur Prestasi & Tahfidz" },
  { id: "afirmasi", name: "Jalur Afirmasi (KIP/PKH)" },
  { id: "perpindahan_ortu", name: "Jalur Perpindahan Orang Tua / Anak GTK" },
];

export const PpdbPublicLandingSection: React.FC<PpdbLandingProps> = ({
  publicInfo,
  onGoToRegister,
  onGoToLogin,
  onGoToCheckStatus,
}) => {
  const institution = publicInfo?.institution ?? DEFAULT_INSTITUTION_PUBLIC_PROFILE;
  const academicYear = publicInfo?.academicYear ?? "2026/2027";
  const tracks = publicInfo?.tracks?.length ? publicInfo.tracks : DEFAULT_TRACKS;

  return (
    <div className="space-y-8">
      <PpdbHeroSection
        institution={institution}
        academicYear={academicYear}
        isOpen={publicInfo?.isOpen ?? true}
        onGoToRegister={onGoToRegister}
        onGoToLogin={onGoToLogin}
        onGoToCheckStatus={onGoToCheckStatus}
      />

      <PpdbProfileAndCurriculumSection institution={institution} />

      <PpdbFlowAndRequirementsSection tracks={tracks} />

      <PpdbContactHelpSection institution={institution} />
    </div>
  );
};
