export default defineAuthHandler(async (event) => {
  const { type, privacy, page, limit } = await getValidatedQuery(
    event,
    MediaQuerySchema.parse,
  );

  const { page: validPage, limit: validLimit } = validatePaginationParams({
    page,
    limit,
  });

  // Get user media
  const media = await getUserMedia(type, privacy, validPage, validLimit);

  // In a real implementation we'd also compute totalCount; for now assume returned length
  const totalCount = media.length;

  // Standard pagination response (message can be customized if needed)
  return createPaginationResponse(media, totalCount, validPage, validLimit);
});
