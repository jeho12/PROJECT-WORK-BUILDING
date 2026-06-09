export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export function getPaginationParams(query: { page?: unknown; limit?: unknown }) {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit as string) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
