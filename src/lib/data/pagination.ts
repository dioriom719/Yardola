export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export function toPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * Sanitizes free-text search input for use inside a PostgREST `ilike`/`or`
 * filter expression. `%` and `_` are ilike wildcards we don't want a user
 * to control; `,` and `()` are structural characters in PostgREST's filter
 * syntax. Stripping (rather than escaping) keeps the resulting filter
 * expression well-formed without relying on PostgREST-specific quoting.
 */
export function sanitizeSearchTerm(value: string): string {
  return value
    .replace(/[%_,()]/g, " ")
    .trim()
    .slice(0, 100);
}
