import { z } from "zod";
import { AllPermissions, type FeatureName } from "../permissions";

const features = Object.keys(AllPermissions()) as [
  FeatureName,
  ...FeatureName[],
];

export const permissionsArraySchema = z.array(
  z.object({
    feature: z.enum(features),
    permissions: z.array(z.enum(["create", "read", "update", "delete"])),
  }),
);

export type PermissionsArrayInput = z.infer<typeof permissionsArraySchema>;
