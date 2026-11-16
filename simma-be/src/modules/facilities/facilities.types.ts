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
import type {
  FacilityAssetRow,
  NewFacilityAssetRow,
  FacilityLoanRow,
  NewFacilityLoanRow,
  FacilityMaintenanceTicketRow,
  NewFacilityMaintenanceTicketRow,
} from "../../db/schema/facilities.js";

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
  FacilityAssetRow,
  NewFacilityAssetRow,
  FacilityLoanRow,
  NewFacilityLoanRow,
  FacilityMaintenanceTicketRow,
  NewFacilityMaintenanceTicketRow,
};

export interface FacilityAssetWithDetails extends FacilityAssetRow {
  activeLoan?: FacilityLoanRow | null;
  activeTicket?: FacilityMaintenanceTicketRow | null;
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
