import React from "react";
import { Routes, Route, Navigate } from "react-router";
import DisciplineDashboardPage from "./pages/DisciplineDashboardPage";
import InfractionsPage from "./pages/InfractionsPage";
import CounselingPage from "./pages/CounselingPage";
import SummonsPage from "./pages/SummonsPage";
import RulesPage from "./pages/RulesPage";

export const DisciplineRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<DisciplineDashboardPage />} />
      <Route path="infractions" element={<InfractionsPage />} />
      <Route path="counseling" element={<CounselingPage />} />
      <Route path="summons" element={<SummonsPage />} />
      <Route path="rules" element={<RulesPage />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};
