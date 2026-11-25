import React from "react";
import { Routes, Route, Navigate } from "react-router";
import DisciplineDashboardPage from "./pages/DisciplineDashboardPage";
import InfractionsPage from "./pages/InfractionsPage";
import CounselingPage from "./pages/CounselingPage";
import SummonsPage from "./pages/SummonsPage";
import RulesPage from "./pages/RulesPage";
import { RouteRoleGuard } from "../auth";
import { MODULE_ROLES } from "../../config/roles";

export const DisciplineRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<DisciplineDashboardPage />} />
      <Route path="infractions" element={<InfractionsPage />} />
      <Route
        path="counseling"
        element={
          <RouteRoleGuard roles={MODULE_ROLES.DISCIPLINE_COUNSELING}>
            <CounselingPage />
          </RouteRoleGuard>
        }
      />
      <Route
        path="summons"
        element={
          <RouteRoleGuard roles={MODULE_ROLES.DISCIPLINE_SUMMONS}>
            <SummonsPage />
          </RouteRoleGuard>
        }
      />
      <Route path="rules" element={<RulesPage />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};
