# Drizzle ORM Integration

This project uses Drizzle ORM with SQLite for type-safe database operations,
following the patterns from [atidone](https://github.com/atinux/atidone).

## Quick Start

```bash
# Push schema to database (development)
pnpm db:push

# Seed with sample data
pnpm db:seed

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

## Automatic Migrations (Dev)

A Nitro plugin (`server/plugins/01.database.ts`) automatically syncs the
schema on dev server startup — just like atidone gets from NuxtHub. No
manual `db:push` needed during development.

## Available Scripts

| Script        | Description                                    |
| ------------- | ---------------------------------------------- |
| `db:generate` | Generate migration files from schema changes   |
| `db:migrate`  | Run pending migration files                    |
| `db:push`     | Push schema directly to database (development) |
| `db:studio`   | Open Drizzle Studio web interface              |
| `db:drop`     | Drop database tables                           |
| `db:check`    | Check for schema drift                         |
| `db:up`       | Apply pending migrations                       |
| `db:seed`     | Seed database with sample data                 |
| `db:reset`    | Reset database (delete + push + seed)          |

## File Structure

```
server/
├── db/
│   ├── schema.ts         # Table definitions + relations (single source of truth)
│   ├── seed.ts           # Seed data script
│   └── migrations/       # Generated migration SQL files
├── utils/
│   └── db.ts             # DB connection, Drizzle instance — AUTO-IMPORTED!
├── plugins/
│   └── 01.database.ts    # Auto-migration plugin (dev only)
└── api/                  # API routes — db/schema are auto-imported here

app/types/
└── db.ts                 # TypeScript types inferred from schema

drizzle.config.ts         # Drizzle Kit configuration
```

## Configuration

The database path is defined in two places that must stay in sync:

- `drizzle.config.ts` — used by Drizzle Kit CLI commands
- `server/db/index.ts` — used at runtime

> **Note:** When `NODE_ENV=test` both point at `database.test.db` so the
> test suite never touches the primary database.

## Type Inference

Types are inferred directly from the schema — no manual duplication:

```typescript
// app/types/db.ts
import type { schema } from "../../server/db/schema";

export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;
```

## Usage Examples

### In Server API Routes

```typescript
// server/api/users/index.get.ts — no import needed!
// `db` and `schema` are auto-imported from server/utils/db.ts

export default defineEventHandler(async () => {
  return db.select().from(schema.users);
});
```

### With Relations (Query API)

```typescript
const posts = await db.query.posts.findMany({
  with: { author: true, categories: true },
});
```

### With Validation

```typescript
import { z } from "zod";
// `db` and `schema` are auto-imported — no explicit import needed

const BodySchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, email } = BodySchema.parse(body);

  return db
    .insert(schema.users)
    .values({ name, email, createdAt: new Date() })
    .returning();
});
```

## Key Patterns (from atidone)

- **Single source of truth** — schema.ts defines tables, types are inferred
- **Auto-imports** — `db` and `schema` available everywhere in server/ without imports
- **Auto-migrations in dev** — Nitro plugin runs `db:push` on startup
- **Clean schema** — no mixed validation logic in table definitions

## Production Notes

- Always use migrations (`db:generate` + `db:migrate`) instead of `db:push`
- For production, consider PostgreSQL or MySQL
- Use proper environment variables for database credentials
