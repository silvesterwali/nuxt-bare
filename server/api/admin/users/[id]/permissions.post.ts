export default defineAuthHandler(
  async (event) => {
    const { id } = await getValidatedRouterParams(event, paramsIdSchema.parse);
    const body = await readValidatedBody(event, permissionsArraySchema.parse);

    await Promise.all(
      body.map(({ feature, permissions }) =>
        permissions.length === 0
          ? permissionRepository.deleteByUserIdAndFeature(id, feature)
          : permissionRepository.upsert(id, feature, permissions),
      ),
    );

    const updated = await permissionRepository.findByUserId(id);
    return jsonResponse(updated, "Permissions updated");
  },
  ["admin"],
);
