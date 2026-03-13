# ADR-002: Drizzle ORM over Prisma

**Decision:** Use Drizzle ORM with Neon serverless driver for all database access.

**Rationale:** Drizzle generates no runtime client (unlike Prisma's heavy generated client), produces readable SQL, and supports Neon's HTTP driver for serverless environments. Schema is defined in TypeScript alongside application code, giving full type safety without code generation steps. Trade-off: less mature ecosystem than Prisma, but the query builder covers all MVP needs (joins, aggregates, JSONB) and keeps the bundle small (~50KB vs Prisma's ~2MB engine).
