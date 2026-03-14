export default defineAuthHandler(
  () => {
    const all = AllPermissions();
    const data = Object.entries(all).map(([feature, permissions]) => ({
      feature,
      permissions,
    }));
    return jsonResponse(data, "Available permissions retrieved");
  },
  {
    role: ["admin"],
  },
);
