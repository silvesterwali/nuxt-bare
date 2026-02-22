import { z } from "zod";
import { useValidatedBody } from "h3-zod";
import { jsonResponse } from "../../utils/common/response";
import { userRepository } from "../../utils/user/repository";

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  dateOfBirth: z.string().datetime().optional(),
  phoneNumber: z.string().max(20).optional(),
  address: z.string().max(200).optional(),
});

export default defineEventHandler(async (event) => {
  // Require authentication
  const session = await getUserSession(event);
  if (!session?.user?.id) {
    throw createError({ statusCode: 401, statusMessage: "Authentication required" });
  }

  const body = await useValidatedBody(event, updateProfileSchema);

  // Update profile via repository
  const updatedProfile = await userRepository.updateProfile(session.user.id, {
    ...body,
    dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
  });

  if (!updatedProfile) {
    throw createError({ statusCode: 404, statusMessage: "Profile not found" });
  }

  return jsonResponse(updatedProfile, "Profile updated successfully");
});
