export default defineAuthHandler(async (event) => {
  const { type, privacy, page, limit, folderName } = await getValidatedQuery(
    event,
    MediaQuerySchema.parse,
  );

  const { user } = await requireUserSession(event);

  const { page: validPage, limit: validLimit } = validatePaginationParams({
    page,
    limit,
  });

  // Get user media
  const { data, totalCount } = await getUserMedia(
    type,
    privacy,
    validPage,
    validLimit,
    user.id,
    folderName,
  );

  // Standard pagination response (message can be customized if needed)
  return createPaginationResponse(data, totalCount, validPage, validLimit);
});
