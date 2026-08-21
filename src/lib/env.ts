/**
 * Centralized, typed access to environment variables. Import from here
 * instead of reading `process.env` directly so missing configuration
 * fails fast with a clear error rather than surfacing as an obscure
 * runtime bug later.
 */

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  supabase: {
    get url() {
      return requireEnv(
        "NEXT_PUBLIC_SUPABASE_URL",
        process.env.NEXT_PUBLIC_SUPABASE_URL
      );
    },
    get anonKey() {
      return requireEnv(
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
    },
    /** Server-only. Bypasses RLS -- never import this from client code. */
    get serviceRoleKey() {
      return requireEnv(
        "SUPABASE_SERVICE_ROLE_KEY",
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
    },
  },
  stripe: {
    /** Server-only secret key. Never import this from client code. */
    get secretKey() {
      return requireEnv("STRIPE_SECRET_KEY", process.env.STRIPE_SECRET_KEY);
    },
    /** Server-only webhook signing secret. Never import this from client code. */
    get webhookSecret() {
      return requireEnv(
        "STRIPE_WEBHOOK_SECRET",
        process.env.STRIPE_WEBHOOK_SECRET
      );
    },
  },
  get siteUrl() {
    if (process.env.NEXT_PUBLIC_SITE_URL)
      return process.env.NEXT_PUBLIC_SITE_URL;
    // Vercel Preview deployments each get a unique, dynamically-assigned
    // URL, so there's no single value to hardcode as NEXT_PUBLIC_SITE_URL
    // for them. Vercel auto-injects NEXT_PUBLIC_VERCEL_URL (when "Automatically
    // expose System Environment Variables" is enabled on the project) with
    // that deployment's own host -- fall back to it before failing, so
    // Preview builds get correct auth-redirect/canonical/OG URLs without
    // manual per-deployment configuration. Production should still set
    // NEXT_PUBLIC_SITE_URL explicitly to the real domain.
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
      return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    }
    // In production this silently guessing a domain would misdirect auth
    // confirmation emails, Stripe checkout/portal return URLs, and SEO
    // canonical/OG URLs if the real domain ever differs (or the env var
    // is simply forgotten during deploy) -- fail loudly instead. Dev/test
    // keeps a convenient default since NEXT_PUBLIC_SITE_URL is optional
    // in .env.example for local work.
    if (process.env.NODE_ENV === "production") {
      return requireEnv("NEXT_PUBLIC_SITE_URL", undefined);
    }
    return "http://localhost:3000";
  },
};
