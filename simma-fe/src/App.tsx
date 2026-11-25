import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage, RouteRoleGuard } from "./features/auth";
import { useAuthStore } from "./stores/auth.store";
import { MODULE_ROLES } from "./config/roles";
import { SettingsRoutes } from "./features/settings";
import { StudentsRoutes } from "./features/students";
import { TahfidzRoutes } from "./features/tahfidz";
import { AttendanceRoutes } from "./features/attendance";
import { GradesRoutes } from "./features/grades";
import { ReportsRoutes } from "./features/reports";
import { PpdbPublicPortalPage, PpdbRoutes } from "./features/ppdb";
import { LettersRoutes } from "./features/letters";
import { P5raRoutes } from "./features/p5ra";
import { MutabaahRoutes } from "./features/mutabaah";
import { TeachersRoutes } from "./features/teachers";
import { FinanceRoutes } from "./features/finance";
import { SchedulesRoutes } from "./features/schedules";
import { DisciplineRoutes } from "./features/discipline";
import { TransfersPage } from "./features/transfers";
import { ExtracurricularPage } from "./features/extracurricular";
import { EmisDashboardPage } from "./features/emis";
import { FacilitiesPage, FacilityPublicScanPage } from "./features/facilities";
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
  const role = useAuthStore((s) => s.user?.role);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role === "calon_siswa") {
    return <Navigate to="/ppdb" replace />;
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
          <Route path="/facilities/scan/:token" element={<FacilityPublicScanPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route
              path="ppdb-admin/*"
              element={<RouteRoleGuard roles={MODULE_ROLES.PPDB_ADMIN}><PpdbRoutes /></RouteRoleGuard>}
            />
            <Route
              path="settings/*"
              element={<RouteRoleGuard roles={MODULE_ROLES.SETTINGS}><SettingsRoutes /></RouteRoleGuard>}
            />
            <Route
              path="students/*"
              element={<RouteRoleGuard roles={MODULE_ROLES.STUDENTS}><StudentsRoutes /></RouteRoleGuard>}
            />
            <Route
              path="tahfidz/*"
              element={<RouteRoleGuard roles={MODULE_ROLES.TAHFIDZ}><TahfidzRoutes /></RouteRoleGuard>}
            />
            <Route
              path="attendance/*"
              element={<RouteRoleGuard roles={MODULE_ROLES.ATTENDANCE}><AttendanceRoutes /></RouteRoleGuard>}
            />
            <Route
              path="mutabaah/*"
              element={<RouteRoleGuard roles={MODULE_ROLES.MUTABAAH}><MutabaahRoutes /></RouteRoleGuard>}
            />
            <Route
              path="grades/*"
              element={<RouteRoleGuard roles={MODULE_ROLES.GRADES}><GradesRoutes /></RouteRoleGuard>}
            />
            <Route
              path="reports/*"
              element={<RouteRoleGuard roles={MODULE_ROLES.REPORTS}><ReportsRoutes /></RouteRoleGuard>}
            />
            <Route
              path="letters/*"
              element={<RouteRoleGuard roles={MODULE_ROLES.LETTERS}><LettersRoutes /></RouteRoleGuard>}
            />
            <Route
              path="p5ra/*"
              element={<RouteRoleGuard roles={MODULE_ROLES.P5RA}><P5raRoutes /></RouteRoleGuard>}
            />
            <Route
              path="teachers/*"
              element={<RouteRoleGuard roles={MODULE_ROLES.TEACHERS}><TeachersRoutes /></RouteRoleGuard>}
            />
            <Route
              path="finance/*"
              element={<RouteRoleGuard roles={MODULE_ROLES.FINANCE}><FinanceRoutes /></RouteRoleGuard>}
            />
            <Route
              path="schedules/*"
              element={<RouteRoleGuard roles={MODULE_ROLES.SCHEDULES}><SchedulesRoutes /></RouteRoleGuard>}
            />
            <Route
              path="discipline/*"
              element={<RouteRoleGuard roles={MODULE_ROLES.DISCIPLINE}><DisciplineRoutes /></RouteRoleGuard>}
            />
            <Route
              path="transfers"
              element={<RouteRoleGuard roles={MODULE_ROLES.TRANSFERS}><TransfersPage /></RouteRoleGuard>}
            />
            <Route
              path="extracurricular"
              element={<RouteRoleGuard roles={MODULE_ROLES.EXTRACURRICULAR}><ExtracurricularPage /></RouteRoleGuard>}
            />
            <Route
              path="emis"
              element={<RouteRoleGuard roles={MODULE_ROLES.EMIS}><EmisDashboardPage /></RouteRoleGuard>}
            />
            <Route
              path="facilities"
              element={<RouteRoleGuard roles={MODULE_ROLES.FACILITIES}><FacilitiesPage /></RouteRoleGuard>}
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
