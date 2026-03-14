export default defineAuthHandler(
  async (event) => {
    const { id } = await getValidatedRouterParams(event, paramsIdSchema.parse);
    const permissions = await permissionRepository.findByUserId(id);
    return jsonResponse(permissions, "User permissions retrieved");
  },
  {
    role: ["admin"],
    permissions: ["users"],
  },
);
