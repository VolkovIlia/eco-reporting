# ADR-003: @react-pdf/renderer for PDF Generation

**Decision:** Use `@react-pdf/renderer` to generate Rosprirodnadzor-format PDFs server-side.

**Rationale:** The library renders React components to PDF without a headless browser, keeping the bundle small and serverless-compatible. Forms 2-TP are table-heavy documents with fixed A4 layout -- a good fit for React-PDF's flexbox model. Alternative (Puppeteer) requires Chrome binary (~300MB), incompatible with Vercel's serverless limits. Trade-off: complex table layouts may need manual sizing, but the 2-TP forms have predictable structure that maps cleanly to React-PDF primitives.
