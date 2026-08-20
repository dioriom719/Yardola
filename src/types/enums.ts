/**
 * TypeScript unions mirroring the Postgres enums defined in
 * supabase/migrations/*_enums.sql. Keep these in sync with the database.
 */

export type BudgetRange =
  "under_10k" | "10k_25k" | "25k_50k" | "50k_100k" | "100k_250k" | "over_250k";

export type PropertyType =
  | "single_family"
  | "townhome"
  | "condo"
  | "multi_family"
  | "commercial"
  | "other";

export type ProjectStatus = "draft" | "published" | "archived";

export type PhotoType = "hero" | "gallery" | "before" | "during" | "after";

export type VerificationStatus = "unverified" | "pending" | "verified";

export type BusinessStatus = "pending" | "active" | "inactive" | "suspended";

export type GuideStatus = "draft" | "published" | "archived";

export type ProjectTimeline =
  "planning_only" | "asap" | "1_3_months" | "3_6_months" | "6_12_months";

export type ProjectPlanStatus = "draft" | "submitted" | "matched" | "closed";
