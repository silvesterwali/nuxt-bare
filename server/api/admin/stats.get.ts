export default defineProtectedHandler({ roles: ["admin"] }, async (event) => {
  const stats = await getUserStats();

  return stats;
});
