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
import { LettersRoutes } from "./features/letters";

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

function DashboardPlaceholder() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Status Akademik</p>
          <p className="text-xl font-bold text-slate-800 mt-1">2026/2027 Ganjil</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Sistem Madrasah</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">Online (Lokal/VPS)</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Modul Aktif</p>
          <p className="text-xl font-bold text-slate-800 mt-1">Phase 1 MVP</p>
        </div>
      </div>
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/ppdb" element={<PpdbPublicPortalPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPlaceholder />} />
            <Route path="ppdb-admin/*" element={<PpdbRoutes />} />
            <Route path="settings/*" element={<SettingsRoutes />} />
            <Route path="students/*" element={<StudentsRoutes />} />
            <Route path="tahfidz/*" element={<TahfidzRoutes />} />
            <Route path="attendance/*" element={<AttendanceRoutes />} />
            <Route path="grades/*" element={<GradesRoutes />} />
            <Route path="reports/*" element={<ReportsRoutes />} />
            <Route path="letters/*" element={<LettersRoutes />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
