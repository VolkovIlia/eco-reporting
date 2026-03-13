# Architecture Design: EcoReport MVP

## Summary

Single Next.js 15 monolith serving environmental compliance reporting (forms 2-TP) for Russian market. PostgreSQL via Neon + Drizzle ORM. Server-side PDF generation. NextAuth.js for authentication.

## Architecture Decisions

- **ADR-001**: Next.js monolith (no microservices)
- **ADR-002**: Drizzle ORM over Prisma (lightweight, serverless-compatible)
- **ADR-003**: @react-pdf/renderer for PDF (no headless browser)

## Tech Stack (MVP)

| Layer | Technology | Bundle Impact |
|-------|-----------|--------------|
| Framework | Next.js 15 (App Router) | Core |
| ORM | Drizzle + Neon driver | ~50KB |
| Auth | NextAuth.js v5 | ~30KB |
| Validation | Zod | ~15KB |
| Forms | React Hook Form | ~25KB |
| PDF | @react-pdf/renderer | Server-only |
| Email | Resend | Server-only |
| Styling | Tailwind CSS | JIT, ~10KB |

**Total runtime deps (production):** 8 (under 10 limit)

## Dependency List

1. next
2. react + react-dom
3. drizzle-orm + @neondatabase/serverless
4. next-auth
5. zod
6. react-hook-form
7. @react-pdf/renderer
8. resend

## Database Schema

See `src/db/schema.ts` -- 10 tables covering:
- Users + Organizations (auth, profiles)
- Facilities (production sites with NVOS category)
- Reports (JSONB data per form type)
- Reference data (FKKO waste codes, pollutant codes)
- Deadlines + Notifications
- Audit logs + Sessions

ER diagram: `.dev-docs/diagrams/data-model.md`

## API Contract

See `contracts/api.yaml` -- OpenAPI 3.1 spec with 18 endpoints across 6 tags:
- auth (register, NextAuth handler)
- organization (CRUD)
- facilities (CRUD)
- reports (CRUD + validate + PDF + submit)
- reference (FKKO search, pollutant search)
- dashboard (summary, deadlines)

Codegen: `npx openapi-typescript contracts/api.yaml -o src/lib/api-types.ts`

## Page Structure

See `.dev-docs/architecture/pages.md` -- App Router layout:
- Public: landing, auth
- Authenticated: dashboard, facilities, reports (wizard forms), calendar, settings
- API routes mirroring contract

## Message Flows

See `.dev-docs/diagrams/message-flows.md` -- all interactions are:
- Browser to Server: HTTP (API routes / Server Actions)
- Server to DB: Drizzle parameterized queries
- Server to PDF: In-process function call
- Server to Email: Resend API (async)

No hidden coupling. No message queues. No background workers.

## Security

See `.dev-docs/capabilities/security-model.md`:
- bcrypt (work factor 12) for passwords
- JWT sessions (HttpOnly, Secure, SameSite cookies)
- Role-based access (owner/editor/viewer)
- orgId filter on every query (tenant isolation)
- Rate limiting on auth endpoints
- Audit logging for all state changes
- Input validation via Zod (server-side, whitelist)

## Adapters

See `.dev-docs/adapters/registry.md`:
- Database (Drizzle/Neon) -- swappable to pg driver
- Auth (NextAuth) -- swappable providers
- PDF (@react-pdf) -- swappable to Puppeteer
- Email (Resend) -- swappable to SMTP
- Reference search (PostgreSQL) -- swappable to Elasticsearch

## Build Path

Single command: `npm run build`
Single run: `npm run dev` (dev) / `npm start` (prod)
DB setup: `npx drizzle-kit push && npx tsx src/db/seed.ts`

## UI/UX Required: yes

**Justification:** Product has complex multi-step wizard forms (2-TP reports), dashboard with timeline visualization, autocomplete components, and validation panels. These require careful UX design.

### UI Scope:
- **Components:** Report wizards (3 form types), dashboard timeline, facility cards, FKKO autocomplete, validation panel, deadline calendar
- **Complexity:** complex
  - Multi-step wizard forms with dynamic rows and balance validation
  - Interactive timeline with color-coded urgency
  - Autocomplete searching 4000+ reference items
- **Performance budgets:**
  - FCP < 1.5s, LCP < 2.5s, CLS < 0.1
  - Autocomplete response < 300ms
  - Animation library: CSS transitions only (0KB budget)
- **Accessibility:** WCAG 2.2 AA (touch targets 44px, contrast 4.5:1)
- **Design constraints:** Responsive (desktop-first, min 1024px), Russian language only, professional/business aesthetic

## i18n Architecture

| Decision | Value |
|----------|-------|
| Supported locales | ru (default, only) |
| String externalization | Not for MVP. Hardcoded Russian strings. |
| Locale routing | None (single locale) |
| RTL support required | No |
| Date/number/currency | `Intl.DateTimeFormat('ru-RU')`, `Intl.NumberFormat('ru-RU')` |
| Pluralization | Not needed (single locale, hardcoded) |
| Resource file format | N/A for MVP |
| Resource file location | N/A for MVP |

**Note:** When second locale is needed, extract strings to `src/locales/ru.json` and add next-intl.

## Suckless Compliance

- Functions <= 50 lines (enforced by review)
- Files <= 500 lines (schema.ts is ~200 lines)
- Dependencies < 10 (8 production deps)
- Single build command: `npm run build`
- ADRs: 1 paragraph each
- Deletion backlog maintained

## Handoff to Engineer

Ready for implementation. Engineer should:
1. Run `npx openapi-typescript contracts/api.yaml -o src/lib/api-types.ts`
2. Implement API routes matching `contracts/api.yaml`
3. Implement Server Actions for mutations
4. Build wizard components per page structure
5. Create seed script for FKKO + pollutant reference data
6. Follow security model for auth + authorization
