export default defineAuthHandler(
  async (event) => {
    try {
      const query = getQuery(event);
      const { page, limit } = validatePaginationParams(query);

      const [users, total] = await Promise.all([
        userRepository.findAll(page, limit),
        userRepository.count(),
      ]);

      return listResponse(users, total || 0, page, limit);
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to fetch users",
      });
    }
  },
  ["admin"],
);
