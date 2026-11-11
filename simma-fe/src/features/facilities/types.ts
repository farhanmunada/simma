import type {
  FacilityCategory,
  FacilityCondition,
  FacilityAssetStatus,
  FacilityBorrowerType,
  FacilityLoanStatus,
  FacilityMaintenancePriority,
  FacilityMaintenanceStatus,
  CreateFacilityAssetInput,
  UpdateFacilityAssetInput,
  CreateFacilityLoanInput,
  ReturnFacilityLoanInput,
  CreateFacilityMaintenanceTicketInput,
  UpdateFacilityMaintenanceTicketInput,
  QueryFacilityAssetsInput,
} from "@simma/shared";

export type {
  FacilityCategory,
  FacilityCondition,
  FacilityAssetStatus,
  FacilityBorrowerType,
  FacilityLoanStatus,
  FacilityMaintenancePriority,
  FacilityMaintenanceStatus,
  CreateFacilityAssetInput,
  UpdateFacilityAssetInput,
  CreateFacilityLoanInput,
  ReturnFacilityLoanInput,
  CreateFacilityMaintenanceTicketInput,
  UpdateFacilityMaintenanceTicketInput,
  QueryFacilityAssetsInput,
};

export interface FacilityAsset {
  id: string;
  code: string;
  name: string;
  category: FacilityCategory;
  condition: FacilityCondition;
  location: string | null;
  purchaseDate: string | null;
  sourceOfFund: string | null;
  status: FacilityAssetStatus;
  qrCodeToken: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FacilityLoan {
  id: string;
  assetId: string;
  borrowerName: string;
  borrowerType: FacilityBorrowerType;
  loanDate: string;
  dueDate: string;
  returnDate: string | null;
  status: FacilityLoanStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FacilityMaintenanceTicket {
  id: string;
  assetId: string;
  reporterId: string | null;
  reporterName: string | null;
  title: string;
  description: string;
  priority: FacilityMaintenancePriority;
  status: FacilityMaintenanceStatus;
  cost: number;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FacilityStats {
  totalAssets: number;
  availableAssets: number;
  borrowedAssets: number;
  underRepairAssets: number;
  damagedAssets: number;
  activeLoansCount: number;
  pendingTicketsCount: number;
}

export type FacilityTab = "assets" | "loans" | "maintenance" | "scan";
