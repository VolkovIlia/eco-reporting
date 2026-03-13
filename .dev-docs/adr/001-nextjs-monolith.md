# ADR-001: Next.js Monolith

**Decision:** Deploy as a single Next.js 15 App Router application (no microservices).

**Rationale:** MVP targets ~100 customers with straightforward CRUD + PDF generation. A monolith eliminates network overhead, simplifies deployment (single Vercel project), and keeps the dependency count under 10. Server Actions handle mutations with automatic CSRF protection. If scale demands it later, split PDF generation into a separate serverless function -- the adapter interface (`generateReportPdf(data): Buffer`) makes this a one-file swap.
