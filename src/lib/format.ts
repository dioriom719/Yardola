import type {
  BudgetRange,
  PropertyType,
  VerificationStatus,
} from "@/types/enums";

const BUDGET_RANGE_LABELS: Record<BudgetRange, string> = {
  under_10k: "Under $10K",
  "10k_25k": "$10K–$25K",
  "25k_50k": "$25K–$50K",
  "50k_100k": "$50K–$100K",
  "100k_250k": "$100K–$250K",
  over_250k: "$250K+",
};

export function formatBudgetRange(value: BudgetRange | null | undefined) {
  return value ? BUDGET_RANGE_LABELS[value] : null;
}

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  single_family: "Single Family Home",
  townhome: "Townhome",
  condo: "Condo",
  multi_family: "Multi-Family",
  commercial: "Commercial",
  other: "Other",
};

export function formatPropertyType(value: PropertyType | null | undefined) {
  return value ? PROPERTY_TYPE_LABELS[value] : null;
}

const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  verified: "Verified",
  pending: "Verification Pending",
  unverified: "Unverified",
};

export function formatVerificationStatus(value: VerificationStatus) {
  return VERIFICATION_LABELS[value];
}

export function formatProjectYear(value: number | null | undefined) {
  return value ? String(value) : null;
}
