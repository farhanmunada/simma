import React from "react";
import { Routes, Route, Navigate } from "react-router";
import { SchedulesPage } from "./pages/SchedulesPage";

export const SchedulesRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<SchedulesPage />} />
      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  );
};
