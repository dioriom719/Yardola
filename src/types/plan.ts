import type {
  BudgetRange,
  ProjectPlanStatus,
  ProjectTimeline,
} from "@/types/enums";
import type { ProjectCardData } from "@/types/project";

export interface PlanTaxonomyTag {
  id: string;
  name: string;
  slug: string;
}

/** Lean shape for list views (dashboard, /account/plans). */
export interface ProjectPlanSummary {
  id: string;
  title: string | null;
  status: ProjectPlanStatus;
  categories: PlanTaxonomyTag[];
  cityName: string | null;
  budgetRange: BudgetRange | null;
  timeline: ProjectTimeline | null;
  inspirationCount: number;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlanPhoto {
  id: string;
  url: string;
  sortOrder: number;
}

/** Full shape for the planner and the plan detail page. */
export interface ProjectPlanDetail {
  id: string;
  title: string | null;
  status: ProjectPlanStatus;
  categories: PlanTaxonomyTag[];
  city: {
    id: string;
    name: string;
    slug: string;
    stateAbbreviation: string;
  } | null;
  zipCodeId: string | null;
  zipCode: string | null;
  styles: PlanTaxonomyTag[];
  features: PlanTaxonomyTag[];
  budgetRange: BudgetRange | null;
  timeline: ProjectTimeline | null;
  description: string | null;
  inspiration: ProjectCardData[];
  photos: PlanPhoto[];
  createdAt: string;
  updatedAt: string;
}

export interface SavedProjectEntry {
  savedAt: string;
  project: ProjectCardData;
}
