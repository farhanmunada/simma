import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./features/auth";
import { useAuthStore } from "./stores/auth.store";
import { SettingsRoutes } from "./features/settings";
import { StudentsRoutes } from "./features/students";
import { TahfidzRoutes } from "./features/tahfidz";
import { AttendanceRoutes } from "./features/attendance";
import { GradesRoutes } from "./features/grades";
import { ReportsRoutes } from "./features/reports";
import { PpdbPublicPortalPage, PpdbRoutes } from "./features/ppdb";
import { LettersRoutes, VerifyLetterPublicPage } from "./features/letters";
import { P5raRoutes } from "./features/p5ra";
import { MutabaahRoutes } from "./features/mutabaah";
import { DashboardOverview } from "./features/dashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 menit data referensi
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/ppdb" element={<PpdbPublicPortalPage />} />
          <Route path="/verify-letter/:hash" element={<VerifyLetterPublicPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="ppdb-admin/*" element={<PpdbRoutes />} />
            <Route path="settings/*" element={<SettingsRoutes />} />
            <Route path="students/*" element={<StudentsRoutes />} />
            <Route path="tahfidz/*" element={<TahfidzRoutes />} />
            <Route path="attendance/*" element={<AttendanceRoutes />} />
            <Route path="mutabaah/*" element={<MutabaahRoutes />} />
            <Route path="grades/*" element={<GradesRoutes />} />
            <Route path="reports/*" element={<ReportsRoutes />} />
            <Route path="letters/*" element={<LettersRoutes />} />
            <Route path="p5ra/*" element={<P5raRoutes />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
