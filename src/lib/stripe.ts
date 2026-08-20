import Stripe from "stripe";
import { env } from "@/lib/env";

/**
 * Server-only Stripe client. Import only from Server Actions, Route
 * Handlers, and other server-side code -- never from a Client Component.
 * The secret key never reaches the browser because `env.stripe.secretKey`
 * reads an unprefixed (non-`NEXT_PUBLIC_`) environment variable, which
 * Next.js does not inline into client bundles.
 */
export function getStripeClient(): Stripe {
  return new Stripe(env.stripe.secretKey);
}
