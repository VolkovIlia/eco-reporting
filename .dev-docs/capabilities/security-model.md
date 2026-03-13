# Capability / Security Model

## Authentication

**Provider:** NextAuth.js v5 with Credentials provider
**Session strategy:** JWT (stored in HttpOnly cookie)
**Token TTL:** 24 hours (access), 7 days (refresh via NextAuth rotation)
**Password hashing:** bcrypt, work factor 12

### Session Token Structure

```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "orgId": 1,
  "role": "owner",
  "iat": 1710000000,
  "exp": 1710086400
}
```

### Cookie Settings

| Property | Value |
|----------|-------|
| HttpOnly | true |
| Secure | true (production) |
| SameSite | Lax |
| Path | / |
| Name | `next-auth.session-token` |

## Authorization Model

Single-tenant per organization. Role-based within org.

### Roles

| Role | Permissions |
|------|------------|
| owner | Full CRUD on org, facilities, reports. Manage users. |
| editor | CRUD on facilities, reports. Read org settings. |
| viewer | Read-only access to all data. |

### Scope Checks (per endpoint)

| Endpoint | Required Role | Additional Check |
|----------|--------------|------------------|
| `POST /auth/register` | none (public) | Rate limit: 3/hour/IP |
| `GET /organization` | any authenticated | user.orgId matches |
| `PUT /organization` | owner | user.orgId matches |
| `GET /facilities` | any authenticated | filter by user.orgId |
| `POST /facilities` | owner, editor | create under user.orgId |
| `PUT /facilities/{id}` | owner, editor | facility.orgId = user.orgId |
| `DELETE /facilities/{id}` | owner | facility.orgId = user.orgId |
| `GET /reports` | any authenticated | filter by user.orgId via facility |
| `POST /reports` | owner, editor | facility.orgId = user.orgId |
| `PUT /reports/{id}` | owner, editor | report.facility.orgId = user.orgId |
| `DELETE /reports/{id}` | owner | report.facility.orgId = user.orgId |
| `POST /reports/{id}/validate` | owner, editor | ownership check |
| `POST /reports/{id}/pdf` | any authenticated | ownership check |
| `POST /reports/{id}/submit` | owner, editor | ownership check + must be validated |
| `GET /reference/*` | any authenticated | no ownership check (public data) |
| `GET /dashboard` | any authenticated | filter by user.orgId |

### Authorization Implementation

Every API route and Server Action checks:

1. **Session exists** (NextAuth `getServerSession()`) -- 401 if not
2. **Role sufficient** (check `session.user.role`) -- 403 if not
3. **Resource ownership** (query includes `WHERE org_id = session.user.orgId`) -- 404 if not owned

```typescript
// Pattern for every route handler
async function handler(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ code: "UNAUTHORIZED" }, { status: 401 });

  const facility = await db.query.facilities.findFirst({
    where: and(eq(facilities.id, id), eq(facilities.orgId, session.user.orgId)),
  });
  if (!facility) return Response.json({ code: "NOT_FOUND" }, { status: 404 });

  // proceed with authorized operation
}
```

## Rate Limiting

Implemented via middleware (in-memory counter for MVP, upgrade to Redis later).

| Endpoint Group | Limit | Window |
|---------------|-------|--------|
| `/api/auth/*` | 5 requests | 5 minutes per IP |
| `/api/register` | 3 requests | 1 hour per IP |
| `/api/reference/*` | 100 requests | 1 minute per user |
| `/api/reports/*/pdf` | 10 requests | 1 minute per user |
| All other API | 60 requests | 1 minute per user |

## Input Validation

**Library:** Zod (shared schemas between client and server)
**Location:** Server-side (Server Actions + API routes). Client-side for UX only.
**Approach:** Whitelist validation, strong typing via Zod.

### Validation Rules

- INN: regex `^\d{10,12}$` + checksum validation
- Email: format + max 255 chars
- Password: min 8 chars, max 128 chars
- FKKO codes: must exist in waste_classifiers table
- Pollutant codes: must exist in pollutant_codes table
- Numeric fields: positive, max precision 12.6
- Year: 2020-2100 range
- All text: max length enforced, trimmed

## Audit Logging

All state-changing operations logged to `audit_logs` table:

| Action | Logged Fields |
|--------|--------------|
| user.register | email, orgName, IP |
| user.login | email, success/fail, IP |
| facility.create | facilityId, name |
| facility.update | facilityId, changed fields |
| facility.delete | facilityId |
| report.create | reportId, type, facilityId |
| report.update | reportId, changed sections |
| report.validate | reportId, valid/invalid, error count |
| report.submit | reportId |
| report.pdf | reportId |

## Data Protection

- All DB connections via TLS (Neon enforces this)
- No PII in logs (email redacted in error logs)
- Password hashes: bcrypt work factor 12
- Session cookies: HttpOnly + Secure + SameSite
- CORS: same-origin only
- CSP headers: strict (script-src 'self')

## Threat Model Summary (STRIDE)

| Category | Primary Threat | Mitigation |
|----------|---------------|------------|
| Spoofing | Stolen session cookie | HttpOnly, short TTL, secure flag |
| Tampering | Modified report data | Server-side validation, Zod schemas |
| Repudiation | User denies submitting report | Audit log with timestamps |
| Info Disclosure | Report data of other orgs | orgId filter on every query |
| Denial of Service | Brute-force login | Rate limiting on auth endpoints |
| Elevation | Editor acts as owner | Role check on destructive operations |
