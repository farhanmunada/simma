import React from "react";
import { Routes, Route, Navigate } from "react-router";
import { SetupWizardPage } from "./components/SetupWizardPage";
import { InstitutionProfilePage } from "./components/InstitutionProfilePage";

export const SettingsRoutes: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Child Routes */}
      <Routes>
        <Route path="profile" element={<InstitutionProfilePage />} />
        <Route path="wizard" element={<SetupWizardPage />} />

        {/* Redirect master data lama ke Kesiswaan */}
        <Route path="academic-years" element={<Navigate to="/students/academic-years" replace />} />
        <Route path="semesters" element={<Navigate to="/students/semesters" replace />} />
        <Route path="classrooms" element={<Navigate to="/students/classrooms" replace />} />
        <Route path="subjects" element={<Navigate to="/students/subjects" replace />} />

        {/* Redirect guru ke modul Kepegawaian */}
        <Route path="teachers" element={<Navigate to="/teachers" replace />} />

        <Route index element={<Navigate to="/settings/profile" replace />} />
        <Route path="*" element={<Navigate to="/settings/profile" replace />} />
      </Routes>
    </div>
  );
};

export default SettingsRoutes;
