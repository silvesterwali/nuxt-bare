export default defineTask({
  meta: {
    name: "permissions:revoke",
    description:
      "Revoke all permissions for a feature from a user. Payload: { email, feature }",
  },
  async run({ payload }) {
    const { email, feature } = payload as { email: string; feature: string };

    if (!email || !feature) {
      return {
        result: "error",
        message: "Both 'email' and 'feature' are required",
      };
    }

    const validFeatures = Object.keys(AllPermissions());
    if (!validFeatures.includes(feature)) {
      return {
        result: "error",
        message: `Invalid feature '${feature}'. Valid values: ${validFeatures.join(", ")}`,
      };
    }

    await revokePermissionByEmail(email, feature as FeatureName);

    console.log(
      `[permissions:revoke] Revoked '${feature}' permissions from ${email}`,
    );
    return {
      result: "success",
      message: `All '${feature}' permissions revoked from ${email}`,
    };
  },
});
