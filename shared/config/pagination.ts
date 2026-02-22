export const PAGINATION_CONFIG = {
  defaultPerPage: 25,
  maxPerPage: 100,
  allowedPerPage: [10, 25, 50, 100],
} as const;

export function validatePaginationParams(page?: number, perPage?: number) {
  const validatedPage = Math.max(1, page || 1);
  const validatedPerPage = (PAGINATION_CONFIG.allowedPerPage as readonly number[]).includes(
    perPage || PAGINATION_CONFIG.defaultPerPage,
  )
    ? perPage || PAGINATION_CONFIG.defaultPerPage
    : PAGINATION_CONFIG.defaultPerPage;

  return {
    page: validatedPage,
    perPage: validatedPerPage,
    offset: (validatedPage - 1) * validatedPerPage,
  };
}

export function createPaginationResponse<T>(
  data: T[],
  total: number,
  page: number,
  perPage: number,
) {
  const totalPages = Math.ceil(total / perPage);

  return {
    data,
    pagination: {
      page,
      perPage,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
