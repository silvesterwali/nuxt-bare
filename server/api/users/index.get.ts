export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    // validatePaginationParams is auto-imported from server/utils/pagination.ts
    const { page, limit } = validatePaginationParams(query);

    const [users, total] = await Promise.all([
      userRepository.findAll(page, limit),
      userRepository.count(),
    ]);

    // listResponse is auto-imported from server/utils/response.ts
    // Provide default 0 for total if undefined
    return listResponse(users, total || 0, page, limit);
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch users",
    });
  }
});
