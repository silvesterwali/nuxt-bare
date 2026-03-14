export default defineTask({
  meta: {
    name: "permissions:grant",
    description:
      "Grant all permissions for a feature to a user. Payload: { email, feature }",
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

    await grantPermissionByEmail(email, feature as FeatureName);

    console.log(
      `[permissions:grant] Granted all '${feature}' permissions to ${email}`,
    );
    return {
      result: "success",
      message: `All '${feature}' permissions granted to ${email}`,
    };
  },
});
