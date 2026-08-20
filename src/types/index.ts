/**
 * Shared domain types for Yardola, matching the schema established in
 * supabase/migrations/. These are hand-written to match the exact columns
 * each data-access function selects (see src/lib/data/) -- not a full
 * generated Database type.
 */

export * from "@/types/enums";
export * from "@/types/category";
export * from "@/types/location";
export * from "@/types/project";
export * from "@/types/business";
export * from "@/types/guide";
export * from "@/types/plan";
export * from "@/types/billing";
