# Message Flows

## System Overview

Monolith Next.js application. All interactions are request/response over HTTP (browser to server) or function calls (Server Actions / API routes to database).

```mermaid
graph TD
    Browser["Browser (React)"]
    MW["Middleware (auth guard)"]
    SA["Server Actions"]
    API["API Routes"]
    Auth["NextAuth.js"]
    DB["PostgreSQL (Neon)"]
    PDF["PDF Generator (@react-pdf/renderer)"]
    Email["Resend (email)"]
    FKKO["FKKO Reference (DB table)"]
    Pollutants["Pollutant Reference (DB table)"]

    Browser -->|"HTTP GET/POST"| MW
    MW -->|"authenticated"| SA
    MW -->|"authenticated"| API
    MW -->|"unauthenticated"| Auth

    SA -->|"Drizzle queries"| DB
    API -->|"Drizzle queries"| DB

    SA -->|"validate()"| DB
    SA -->|"generatePdf()"| PDF

    API -->|"search FKKO"| FKKO
    API -->|"search pollutants"| Pollutants

    FKKO -.->|"stored in"| DB
    Pollutants -.->|"stored in"| DB

    SA -->|"send notification"| Email
```

## Request Flows

### 1. Authentication

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant NextAuth
    participant DB

    User->>Browser: Enter email + password
    Browser->>NextAuth: POST /api/auth/callback/credentials
    NextAuth->>DB: SELECT user WHERE email = ? (bcrypt verify)
    alt Valid credentials
        DB-->>NextAuth: user row
        NextAuth-->>Browser: Set session cookie (HttpOnly)
        Browser-->>User: Redirect to /dashboard
    else Invalid
        NextAuth-->>Browser: Error response
        Browser-->>User: Show error
    end
```

### 2. Report Creation + Validation

```mermaid
sequenceDiagram
    actor Ecologist
    participant Browser
    participant ServerAction
    participant Validator
    participant DB

    Ecologist->>Browser: Fill wizard step 1-3
    Browser->>ServerAction: createReport(facilityId, type, year)
    ServerAction->>DB: INSERT INTO reports
    DB-->>ServerAction: report.id
    ServerAction-->>Browser: report object

    loop Each wizard step save
        Ecologist->>Browser: Fill data, click Next
        Browser->>ServerAction: updateReport(id, data)
        ServerAction->>DB: UPDATE reports SET data = merge(data, newData)
    end

    Ecologist->>Browser: Click "Validate"
    Browser->>ServerAction: validateReport(id)
    ServerAction->>DB: SELECT report data
    ServerAction->>Validator: check balance, codes, required fields
    Validator->>DB: verify FKKO codes exist
    Validator-->>ServerAction: ValidationResult
    ServerAction->>DB: UPDATE validation_errors
    ServerAction-->>Browser: { valid: bool, errors: [] }
    Browser-->>Ecologist: Show validation panel (green/red)
```

### 3. PDF Generation

```mermaid
sequenceDiagram
    actor Ecologist
    participant Browser
    participant APIRoute
    participant PDFGenerator
    participant DB

    Ecologist->>Browser: Click "Download PDF"
    Browser->>APIRoute: POST /api/reports/{id}/pdf
    APIRoute->>DB: SELECT report with facility + org data
    APIRoute->>PDFGenerator: render(reportData, template)
    PDFGenerator-->>APIRoute: PDF buffer
    APIRoute-->>Browser: Content-Type: application/pdf
    Browser-->>Ecologist: File download
```

### 4. Reference Data Search

```mermaid
sequenceDiagram
    actor Ecologist
    participant Browser
    participant APIRoute
    participant DB

    Ecologist->>Browser: Type "ртут" in FKKO field
    Browser->>APIRoute: GET /api/reference/waste?q=ртут&limit=20
    APIRoute->>DB: SELECT FROM waste_classifiers WHERE name ILIKE '%ртут%' OR code LIKE 'ртут%' LIMIT 20
    DB-->>APIRoute: matching rows
    APIRoute-->>Browser: JSON array
    Browser-->>Ecologist: Autocomplete dropdown
```

### 5. Dashboard + Deadlines

```mermaid
sequenceDiagram
    actor Ecologist
    participant Browser
    participant APIRoute
    participant DB

    Ecologist->>Browser: Open /dashboard
    Browser->>APIRoute: GET /api/dashboard?year=2026
    APIRoute->>DB: SELECT deadlines WHERE year=2026
    APIRoute->>DB: SELECT facilities + report counts for org
    APIRoute-->>Browser: DashboardSummary
    Browser-->>Ecologist: Timeline + progress cards
```

## No Hidden Coupling

All data flows through explicit paths:
- Browser to Server: HTTP request/response (API routes or Server Actions)
- Server to Database: Drizzle ORM queries (parameterized, type-safe)
- Server to PDF: Function call to @react-pdf/renderer (synchronous, in-process)
- Server to Email: Resend API call (async, fire-and-forget with error logging)
- No shared mutable state between routes
- No message queues, no background workers in MVP
