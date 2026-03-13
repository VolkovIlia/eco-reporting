# Adapter Registry

External resources accessed via narrow adapters. Each adapter implements a standard interface and can be replaced without changing core business logic.

## Adapter Map

| Resource | Adapter | Interface | Mount Point |
|----------|---------|-----------|-------------|
| PostgreSQL (Neon) | `src/lib/db.ts` | Drizzle ORM client | `db` singleton |
| NextAuth.js | `src/lib/auth.ts` | `getServerSession()`, `authOptions` | `/api/auth/*` |
| PDF Rendering | `src/lib/pdf.ts` | `generateReportPdf(report): Buffer` | Server Action |
| Email (Resend) | `src/lib/email.ts` | `sendEmail(to, subject, body): void` | Server Action |
| FKKO Reference | `src/lib/reference.ts` | `searchWaste(query, limit): WasteClassifier[]` | API route |
| Pollutant Reference | `src/lib/reference.ts` | `searchPollutants(query, limit): PollutantCode[]` | API route |

## Adapter Details

### Database Adapter (`src/lib/db.ts`)

```typescript
// Narrow interface: one Drizzle client, configured from DATABASE_URL
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/db/schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

**Replaceable:** Swap `neon-http` driver for `pg` driver for self-hosted Postgres. Zero changes to business logic.

### Auth Adapter (`src/lib/auth.ts`)

NextAuth.js configuration with Credentials provider. Session stored as JWT cookie.

**Replaceable:** Swap for OAuth providers (Gosuslugi in v2) by adding provider config. Core auth check (`getServerSession()`) unchanged.

### PDF Adapter (`src/lib/pdf.ts`)

```typescript
export async function generateReportPdf(
  report: Report,
  facility: Facility,
  org: Organization,
): Promise<Buffer> { ... }
```

**Replaceable:** Swap `@react-pdf/renderer` for Puppeteer/Chrome PDF or server-side LaTeX. Interface stays `(data) => Buffer`.

### Email Adapter (`src/lib/email.ts`)

```typescript
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> { ... }
```

**Replaceable:** Swap Resend for Nodemailer, SES, or any SMTP. Interface stays `(to, subject, html) => void`.

### Reference Data Adapter (`src/lib/reference.ts`)

```typescript
export async function searchWaste(query: string, limit: number): Promise<WasteClassifier[]> { ... }
export async function searchPollutants(query: string, limit: number): Promise<PollutantCode[]> { ... }
```

**Replaceable:** Currently queries PostgreSQL full-text search. Could be swapped for Elasticsearch or Typesense if search performance needs improvement.

## Replacement Protocol

1. Create new adapter file implementing same interface
2. Update import in calling code (single import path)
3. No changes to business logic, validation, or API contracts
4. Test with existing tests (adapter is behind interface)
