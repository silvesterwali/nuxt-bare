import { useValidatedQuery } from "h3-zod";

export default defineAuthHandler(async (event) => {
  const filters = await useValidatedQuery(event, adminUserQuerySchema);

  // Get users with filters and pagination
  return await getUsers(
    {
      search: filters.search,
      role: filters.role as any, // Enum
      isActive: filters.isActive,
      emailVerified: filters.emailVerified,
    },
    {
      page: filters.page,
      limit: filters.limit,
    },
  );
});
