import React, { useState } from "react";
import { Plus, QrCode, HandHelping, Wrench } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { FacilityStatsCards } from "../components/FacilityStatsCards";
import { FacilityAssetTable } from "../components/FacilityAssetTable";
import { FacilityAssetModal } from "../components/FacilityAssetModal";
import { FacilityLoanTable } from "../components/FacilityLoanTable";
import { FacilityLoanModal } from "../components/FacilityLoanModal";
import { FacilityMaintenanceTable } from "../components/FacilityMaintenanceTable";
import { FacilityMaintenanceModal } from "../components/FacilityMaintenanceModal";
import { FacilityQrModal } from "../components/FacilityQrModal";
import { FacilityQrScannerModal } from "../components/FacilityQrScannerModal";
import {
  useFacilityStats,
  useFacilityAssets,
  useFacilityLoans,
  useFacilityMaintenanceTickets,
  useDeleteFacilityAsset,
  useUpdateFacilityMaintenanceTicket,
} from "../api/facilities.api";
import type {
  FacilityAsset,
  FacilityLoan,
  FacilityMaintenanceTicket,
  FacilityTab,
} from "../types";

export const FacilitiesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FacilityTab>("assets");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals state
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<FacilityAsset | null>(null);

  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [selectedAssetForLoan, setSelectedAssetForLoan] =
    useState<FacilityAsset | null>(null);
  const [loanToReturn, setLoanToReturn] = useState<FacilityLoan | null>(null);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [selectedAssetForMaintenance, setSelectedAssetForMaintenance] =
    useState<FacilityAsset | null>(null);

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedAssetForQr, setSelectedAssetForQr] =
    useState<FacilityAsset | null>(null);

  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const [assetToDelete, setAssetToDelete] = useState<FacilityAsset | null>(null);

  // Queries
  const { data: stats, isLoading: statsLoading } = useFacilityStats();
  const { data: assets = [], isLoading: assetsLoading } = useFacilityAssets({
    search: search || undefined,
    category: (categoryFilter as FacilityAsset["category"]) || undefined,
    status: (statusFilter as FacilityAsset["status"]) || undefined,
  });
  const { data: loans = [], isLoading: loansLoading } = useFacilityLoans();
  const { data: tickets = [], isLoading: ticketsLoading } =
    useFacilityMaintenanceTickets();

  // Mutations
  const deleteMutation = useDeleteFacilityAsset();
  const updateTicketMutation = useUpdateFacilityMaintenanceTicket();

  const availableAssets = assets.filter(
    (a) => a.status === "TERSEDIA" && a.condition !== "RUSAK_BERAT",
  );

  const handleEditAsset = (asset: FacilityAsset) => {
    setAssetToEdit(asset);
    setIsAssetModalOpen(true);
  };

  const handleBorrowAsset = (asset: FacilityAsset) => {
    setSelectedAssetForLoan(asset);
    setLoanToReturn(null);
    setIsLoanModalOpen(true);
  };

  const handleReturnLoan = (loan: FacilityLoan) => {
    setLoanToReturn(loan);
    setSelectedAssetForLoan(null);
    setIsLoanModalOpen(true);
  };

  const handleReportIssue = (asset: FacilityAsset) => {
    setSelectedAssetForMaintenance(asset);
    setIsMaintenanceModalOpen(true);
  };

  const handleViewQr = (asset: FacilityAsset) => {
    setSelectedAssetForQr(asset);
    setIsQrModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (assetToDelete) {
      await deleteMutation.mutateAsync(assetToDelete.id);
      setAssetToDelete(null);
    }
  };

  const handleTicketStatusChange = async (
    ticket: FacilityMaintenanceTicket,
    status: string,
  ) => {
    await updateTicketMutation.mutateAsync({
      id: ticket.id,
      data: { status: status as any },
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sarana & Prasarana Madrasah
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manajemen inventaris, sirkulasi peminjaman aset, pelabelan QR Code, dan tiket pemeliharaan.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsScannerOpen(true)}
          >
            <QrCode className="w-4 h-4 mr-1.5" />
            Audit QR
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedAssetForLoan(null);
              setLoanToReturn(null);
              setIsLoanModalOpen(true);
            }}
          >
            <HandHelping className="w-4 h-4 mr-1.5" />
            Pinjam Aset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedAssetForMaintenance(null);
              setIsMaintenanceModalOpen(true);
            }}
          >
            <Wrench className="w-4 h-4 mr-1.5" />
            Lapor Servis
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setAssetToEdit(null);
              setIsAssetModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Aset
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <FacilityStatsCards stats={stats} isLoading={statsLoading} />

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab("assets")}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === "assets"
              ? "border-emerald-600 text-emerald-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Daftar Aset ({assets.length})
        </button>
        <button
          onClick={() => setActiveTab("loans")}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === "loans"
              ? "border-emerald-600 text-emerald-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Peminjaman & Pengembalian ({loans.length})
        </button>
        <button
          onClick={() => setActiveTab("maintenance")}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === "maintenance"
              ? "border-emerald-600 text-emerald-600 font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Pemeliharaan & Servis ({tickets.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "assets" && (
        <FacilityAssetTable
          assets={assets}
          isLoading={assetsLoading}
          search={search}
          onSearchChange={setSearch}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onEdit={handleEditAsset}
          onDelete={setAssetToDelete}
          onViewQr={handleViewQr}
          onBorrow={handleBorrowAsset}
          onReportIssue={handleReportIssue}
        />
      )}

      {activeTab === "loans" && (
        <FacilityLoanTable
          loans={loans}
          assets={assets}
          isLoading={loansLoading}
          onReturn={handleReturnLoan}
        />
      )}

      {activeTab === "maintenance" && (
        <FacilityMaintenanceTable
          tickets={tickets}
          assets={assets}
          isLoading={ticketsLoading}
          onUpdateStatus={handleTicketStatusChange}
        />
      )}

      {/* Modals */}
      <FacilityAssetModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        assetToEdit={assetToEdit}
      />

      <FacilityLoanModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        selectedAsset={selectedAssetForLoan}
        loanToReturn={loanToReturn}
        availableAssets={availableAssets}
      />

      <FacilityMaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        selectedAsset={selectedAssetForMaintenance}
        assets={assets}
      />

      <FacilityQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        asset={selectedAssetForQr}
      />

      <FacilityQrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onReportIssue={handleReportIssue}
      />

      <ConfirmDialog
        isOpen={Boolean(assetToDelete)}
        onClose={() => setAssetToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Aset Inventaris"
        message={`Apakah Anda yakin ingin menghapus data aset '${assetToDelete?.name}' (${assetToDelete?.code})? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Aset"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
