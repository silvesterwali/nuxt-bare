/**
 * Vitest setup — registers the same globals that Nitro auto-imports in the
 * Nuxt server runtime (useDb, schema) so that server modules relying
 * on those auto-imports can be loaded by Vitest without "is not defined" errors.
 */
import { useDb, schema } from "../server/utils/db";

// Make the Nitro auto-imports available as globals in every test file.
// Use simple assignment (not Object.defineProperty) so vitest's vi.stubGlobal
// can still override them in tests that mock the database layer.
globalThis.useDb = useDb;
globalThis.schema = schema;
