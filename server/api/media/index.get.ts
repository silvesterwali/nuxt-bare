import { useValidatedQuery } from "h3-zod";

export default defineEventHandler(async (event) => {
  // Require authentication
  const session = await getUserSession(event);
  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }
  const { type, privacy, page, limit } = await useValidatedQuery(
    event,
    MediaQuerySchema,
  );

  const { page: validPage, limit: validLimit } = validatePaginationParams({
    page,
    limit,
  });

  // Get user media
  const media = await getUserMedia(
    session.user.id,
    type,
    privacy,
    validPage,
    validLimit,
  );

  // In a real implementation we'd also compute totalCount; for now assume returned length
  const totalCount = media.length;

  // Standard pagination response (message can be customized if needed)
  return createPaginationResponse(media, totalCount, validPage, validLimit);
});
