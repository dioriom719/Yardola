import type {
  BillingInterval,
  SubscriptionStatus,
  TransactionStatus,
} from "@/types/enums";

export interface PricingPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceCents: number;
  billingInterval: BillingInterval;
  features: string[];
  maxActiveLeads: number | null;
  stripePriceId: string | null;
}

export interface BusinessSubscription {
  id: string;
  businessId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  plan: PricingPlan;
}

export interface BusinessTransaction {
  id: string;
  amountCents: number;
  currency: string;
  status: TransactionStatus;
  description: string | null;
  createdAt: string;
}

/** Server-trusted lead-visibility entitlement for a business. */
export interface LeadEntitlement {
  planName: string;
  maxActiveLeads: number | null;
}
