import { useState } from "react";
import {
  useDisciplineLeaderboard,
  useStudentInfractions,
  useCreateStudentInfraction,
  useDisciplineRules,
} from "../api/discipline.api";
import { DisciplineStatsCards } from "../components/DisciplineStatsCards";
import { LeaderboardTable } from "../components/LeaderboardTable";
import { InfractionFormModal } from "../components/InfractionFormModal";
import { Button } from "../../../components/ui/Button";
import { PlusCircle } from "lucide-react";
import type { StudentDisciplineSummaryItem } from "../types";

export default function DisciplineDashboardPage() {
  const [activeType, setActiveType] = useState<"points_highest" | "merits_highest">("points_highest");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: leaderboardData, isLoading: isLeaderboardLoading } = useDisciplineLeaderboard({
    type: activeType,
  });
  const { data: infractionsData } = useStudentInfractions();
  const { data: rulesData } = useDisciplineRules();
  const createInfractionMutation = useCreateStudentInfraction();

  const leaderboardList: StudentDisciplineSummaryItem[] = leaderboardData ?? [];
  const infractions = infractionsData ?? [];

  const totalInfractions = infractions.filter((i) => i.type === "infraction").length;
  const totalRewards = infractions.filter((i) => i.type === "reward").length;
  const pendingApprovals = infractions.filter((i) => i.status === "pending_approval").length;
  const highRiskCount = leaderboardList.filter(
    (s) => s.sanctionLevel === "sp_1" || s.sanctionLevel === "sp_2" || s.sanctionLevel === "sp_3"
  ).length;

  // Mock / dummy students list for dropdown selection (in real app comes from students query)
  const studentsList = [
    { id: "11111111-1111-1111-1111-111111111111", fullName: "Ahmad Dahlan", className: "X-A" },
    { id: "22222222-2222-2222-2222-222222222222", fullName: "Muhammad Hasyim", className: "XI-IPA" },
    { id: "33333333-3333-3333-3333-333333333333", fullName: "Siti Fatimah", className: "X-B" },
    { id: "44444444-4444-4444-4444-444444444444", fullName: "Umar Faruq", className: "XII-IPS" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Dashboard Tata Tertib & BK</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoring kedisiplinan santri, eskalasi sanksi bertingkat, dan apresiasi keteladanan
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 text-xs">
          <PlusCircle className="w-4 h-4" />
          <span>Catat Pelanggaran / Prestasi</span>
        </Button>
      </div>

      <DisciplineStatsCards
        studentsAtRiskCount={highRiskCount}
        totalInfractionsCount={totalInfractions}
        totalRewardsCount={totalRewards}
        activeSummonsCount={pendingApprovals}
      />

      <LeaderboardTable
        data={leaderboardList}
        isLoading={isLeaderboardLoading}
        activeType={activeType}
        onTypeChange={setActiveType}
      />

      <InfractionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data) => {
          await createInfractionMutation.mutateAsync(data);
        }}
        rules={rulesData ?? []}
        studentsList={studentsList}
        isLoading={createInfractionMutation.isPending}
      />
    </div>
  );
}
