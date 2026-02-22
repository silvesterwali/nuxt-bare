import type { EventHandler, EventHandlerRequest, H3Event } from "h3";
import type { UserRole } from "~/types/db";

type MaybePromise<T> = T | Promise<T>;
type AbilityDef = string | [string, any];

interface ProtectedHandlerOptions {
  roles?: UserRole[];
  ability?: AbilityDef | ((event: H3Event) => MaybePromise<AbilityDef>);
}

export function defineProtectedHandler<T extends EventHandlerRequest, D>(
  handler: EventHandler<T, D>,
): EventHandler<T, D>;

export function defineProtectedHandler<T extends EventHandlerRequest, D>(
  options: ProtectedHandlerOptions,
  handler: EventHandler<T, D>,
): EventHandler<T, D>;

export function defineProtectedHandler<T extends EventHandlerRequest, D>(
  arg1: EventHandler<T, D> | ProtectedHandlerOptions,
  arg2?: EventHandler<T, D>,
): EventHandler<T, D> {
  const handler = (typeof arg1 === "function" ? arg1 : arg2) as EventHandler<
    T,
    D
  >;
  const options = (
    typeof arg1 === "object" && arg1 !== null ? arg1 : {}
  ) as ProtectedHandlerOptions;

  return defineEventHandler<T>(async (event) => {
    // Require authentication
    const session = await getUserSession(event);
    if (!session?.user?.id) {
      throw createError({
        statusCode: 401,
        statusMessage: "Authentication required",
      });
    }

    // Check roles
    if (options.roles?.length) {
      if (!options.roles.includes(session.user.role)) {
        throw createError({
          statusCode: 403,
          statusMessage: "Insufficient permissions",
        });
      }
    }
    return handler(event);
  });
}
