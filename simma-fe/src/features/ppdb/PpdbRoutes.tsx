import React from "react";
import { Routes, Route } from "react-router";
import { PpdbDashboardPage } from "./components/PpdbDashboardPage";

export const PpdbRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<PpdbDashboardPage />} />
    </Routes>
  );
};
