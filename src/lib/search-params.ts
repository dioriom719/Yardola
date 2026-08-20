export type SearchParams = Record<string, string | string[] | undefined>;

/** Reads a single string value from Next.js's searchParams shape. */
export function paramString(
  params: SearchParams,
  key: string
): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export function paramInt(
  params: SearchParams,
  key: string,
  fallback: number
): number {
  const raw = paramString(params, key);
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
