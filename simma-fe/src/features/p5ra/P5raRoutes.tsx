import React from "react";
import { Routes, Route } from "react-router";
import { ProjectsListPage } from "./components/ProjectsListPage";
import { ProjectDetailPage } from "./components/ProjectDetailPage";
import { AssessmentGridPage } from "./components/AssessmentGridPage";
import { RecapOverviewPage } from "./components/RecapOverviewPage";

export const P5raRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ProjectsListPage />} />
      <Route path=":projectId" element={<ProjectDetailPage />} />
      <Route path=":projectId/assess" element={<AssessmentGridPage />} />
      <Route path=":projectId/recap" element={<RecapOverviewPage />} />
    </Routes>
  );
};
