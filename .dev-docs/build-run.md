# Build and Run

## Single Service: eco-reporting

### Prerequisites

- Node.js >= 20
- PostgreSQL (or Neon account)

### Environment Variables

```
DATABASE_URL=postgresql://user:pass@host:5432/eco_reporting?sslmode=require
NEXTAUTH_SECRET=<random 32+ char string>
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=<resend api key>
```

### Build

```bash
npm run build
```

### Run (development)

```bash
npm run dev
```

### Run (production)

```bash
npm start
```

### Database Setup

```bash
npx drizzle-kit push
npx tsx src/db/seed.ts
```

### Contract Codegen

```bash
npx openapi-typescript contracts/api.yaml -o src/lib/api-types.ts
```

Generates TypeScript types from OpenAPI spec. Run after contract changes.
