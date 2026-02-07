export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function parsePagination(url: string, defaultLimit = 25, maxLimit = 100): PaginationParams {
  const { searchParams } = new URL(url);
  let page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  let limit = parseInt(searchParams.get('limit') || String(defaultLimit), 10) || defaultLimit;
  limit = Math.min(Math.max(1, limit), maxLimit);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export function paginatedResponse<T>(data: T[], total: number, page: number, limit: number) {
  return {
    data,
    total,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
  };
}
