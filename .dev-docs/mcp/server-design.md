# MCP Server Design

MCP endpoints for agent introspection and control of the EcoReport application.

## 1. Health and Logs

### `health.get`

Returns application health status.

```json
{
  "status": "healthy",
  "services": [
    { "name": "database", "status": "healthy", "latencyMs": 12 },
    { "name": "email", "status": "healthy" },
    { "name": "pdf", "status": "healthy" }
  ],
  "version": "0.1.0",
  "uptime": 3600
}
```

**Implementation:** `GET /api/health` -- checks DB connectivity (SELECT 1), responds with status.

### `logs.tail`

Returns recent structured logs.

```json
{
  "params": { "lines": 50, "level": "error", "redact": true },
  "response": [
    {
      "timestamp": "2026-03-13T10:00:00Z",
      "level": "error",
      "message": "PDF generation failed",
      "traceId": "abc123",
      "context": { "reportId": 42 }
    }
  ]
}
```

**Implementation:** Read from structured log output (stdout JSON lines). PII redacted when `redact: true`.

## 2. Contract Discovery

### `contracts.list`

```json
{
  "response": [
    {
      "service": "eco-reporting",
      "idlPath": "contracts/api.yaml",
      "format": "openapi-3.1"
    }
  ]
}
```

### `contracts.describe`

```json
{
  "params": { "service": "eco-reporting" },
  "response": {
    "title": "EcoReport API",
    "version": "0.1.0",
    "endpoints": 18,
    "tags": ["auth", "organization", "facilities", "reports", "reference", "dashboard"]
  }
}
```

**Implementation:** Parse `contracts/api.yaml` and return summary.

## 3. Control Operations

All control operations require session with `owner` role.

### `control.reload`

Reload reference data (FKKO, pollutant codes) from database or seed file.

```json
{
  "params": { "target": "reference-data" },
  "requiredScope": "control:reload:reference",
  "response": { "reloaded": true, "wasteCount": 4500, "pollutantCount": 600 }
}
```

### `control.seed`

Seed reference data tables (FKKO, pollutants, deadlines).

```json
{
  "params": { "target": "deadlines", "year": 2027 },
  "requiredScope": "control:seed:reference",
  "response": { "inserted": 6, "target": "deadlines" }
}
```

**Note:** No start/stop needed for monolith deployed on Vercel (managed by platform).

## 4. Testing and Metrics

### `test.run`

```json
{
  "params": { "suite": "smoke", "filter": "auth" },
  "response": {
    "total": 5,
    "passed": 5,
    "failed": 0,
    "duration": 1200
  }
}
```

**Implementation:** Execute `npm test -- --filter={filter}` via child process.

### `metrics.snapshot`

```json
{
  "response": {
    "counters": {
      "reports_created": 142,
      "pdfs_generated": 89,
      "validations_run": 210,
      "logins_success": 320,
      "logins_failed": 15
    },
    "gauges": {
      "active_users": 45,
      "draft_reports": 38,
      "validated_reports": 51,
      "submitted_reports": 53
    }
  }
}
```

**Implementation:** Aggregate from `audit_logs` and `reports` tables.

## Auth Model

| Endpoint Category | Default Permission | Escalated Permission |
|-------------------|-------------------|---------------------|
| health.get | any authenticated | - |
| logs.tail | owner | - |
| contracts.list | any authenticated | - |
| contracts.describe | any authenticated | - |
| control.reload | - | owner + explicit request |
| control.seed | - | owner + explicit request |
| test.run | - | owner (5 min TTL) |
| metrics.snapshot | owner | - |

## Implementation Path

For MVP, expose as standard API routes under `/api/mcp/`:
- `GET /api/mcp/health`
- `GET /api/mcp/logs?lines=50&level=error`
- `GET /api/mcp/contracts`
- `GET /api/mcp/contracts/:service`
- `POST /api/mcp/control/reload`
- `POST /api/mcp/control/seed`
- `POST /api/mcp/test/run`
- `GET /api/mcp/metrics`

Upgrade to stdio-based MCP server later if needed for Claude Code integration.
