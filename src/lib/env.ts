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
  },
  get siteUrl() {
    if (process.env.NEXT_PUBLIC_SITE_URL)
      return process.env.NEXT_PUBLIC_SITE_URL;
    return process.env.NODE_ENV === "production"
      ? "https://yardola.com"
      : "http://localhost:3000";
  },
};
