import { EmptyState } from "@/components/ui/empty-state";
import { Wand2 } from "lucide-react";

/**
 * Placeholder for the interactive project planner (Phase 3+). This
 * establishes where the planner will live in the component tree without
 * implementing its step-by-step logic yet.
 */
export function ProjectPlanner() {
  return (
    <EmptyState
      icon={Wand2}
      title="Project Planner coming soon"
      description="Soon you'll be able to plan your backyard project step by step -- from inspiration to budget to matched professionals."
    />
  );
}
