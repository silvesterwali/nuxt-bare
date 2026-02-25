export default defineAuthHandler(
  async (_event) => {
    const stats = await getUserStats();

    return stats;
  },
  ["admin"],
);
