# Data Model — ER Diagram

```mermaid
erDiagram
    organizations ||--o{ users : "has"
    organizations ||--o{ facilities : "owns"
    facilities ||--o{ reports : "has"
    reports ||--o{ notifications : "triggers"
    users ||--o{ notifications : "receives"
    deadlines ||--o{ notifications : "triggers"
    users ||--o{ audit_logs : "creates"
    users ||--o{ sessions : "has"

    organizations {
        serial id PK
        varchar name
        varchar inn UK
        varchar kpp
        varchar ogrn
        text legal_address
        timestamp created_at
        timestamp updated_at
    }

    users {
        serial id PK
        varchar email UK
        varchar password_hash
        varchar name
        integer org_id FK
        user_role role
        boolean email_verified
        timestamp created_at
        timestamp updated_at
    }

    facilities {
        serial id PK
        integer org_id FK
        varchar name
        text address
        nvos_category nvos_category
        varchar nvos_reg_number
        varchar okved
        timestamp created_at
        timestamp updated_at
    }

    reports {
        serial id PK
        integer facility_id FK
        report_type type
        integer year
        report_status status
        jsonb data
        jsonb validation_errors
        varchar pdf_url
        timestamp created_at
        timestamp updated_at
    }

    waste_classifiers {
        serial id PK
        varchar code UK
        text name
        hazard_class hazard_class
        varchar parent_code
    }

    pollutant_codes {
        serial id PK
        varchar code UK
        text name
        varchar cas_number
        hazard_class hazard_class
        numeric pdk_mr
        numeric pdk_ss
        varchar unit
    }

    deadlines {
        serial id PK
        report_type report_type
        date deadline_date
        text description
        jsonb nvos_categories
        integer year
    }

    notifications {
        serial id PK
        integer user_id FK
        integer report_id FK
        integer deadline_id FK
        varchar type
        varchar title
        text message
        boolean read
        timestamp sent_at
        timestamp created_at
    }

    audit_logs {
        serial id PK
        integer user_id FK
        varchar action
        varchar resource
        integer resource_id
        jsonb details
        varchar ip_address
        timestamp created_at
    }

    sessions {
        serial id PK
        integer user_id FK
        varchar session_token UK
        timestamp expires_at
    }
```

## Table Purposes

| Table | Purpose | Row Estimate (MVP) |
|-------|---------|-------------------|
| organizations | Company profiles | ~100 |
| users | Auth accounts | ~200 |
| facilities | Production sites (NVOS objects) | ~300 |
| reports | 2-TP forms with JSONB data | ~1000 |
| waste_classifiers | FKKO reference (pre-seeded) | ~4500 |
| pollutant_codes | Pollutant reference (pre-seeded) | ~600 |
| deadlines | Annual deadlines (pre-seeded) | ~20/year |
| notifications | User notifications | ~5000 |
| audit_logs | Security audit trail | ~10000 |
| sessions | NextAuth sessions | ~200 |

## JSONB Structure: reports.data

Each report type has its own JSONB shape stored in `data` column.

### 2-TP Waste (2tp_waste)

```json
{
  "reportingPeriod": { "year": 2025 },
  "wasteRows": [
    {
      "fkkoCode": "1 71 101 01 52 1",
      "wasteName": "Ртутные лампы",
      "hazardClass": "I",
      "onStartYear": 0.5,
      "generated": 1.2,
      "receivedFromOthers": 0,
      "used": 0,
      "neutralized": 0,
      "transferred": 1.5,
      "placed": 0,
      "onEndYear": 0.2
    }
  ],
  "disposalFacilities": []
}
```

### 2-TP Air (2tp_air)

```json
{
  "reportingPeriod": { "year": 2025 },
  "emissionSources": [
    {
      "sourceId": "001",
      "sourceName": "Котельная",
      "pollutants": [
        {
          "pollutantCode": "0301",
          "pollutantName": "Азота диоксид",
          "permittedTonsPerYear": 5.0,
          "actualTonsPerYear": 3.2
        }
      ]
    }
  ],
  "reductionMeasures": []
}
```

### 2-TP Water (2tp_water)

```json
{
  "reportingPeriod": { "year": 2025 },
  "waterIntake": [
    {
      "sourceType": "surface",
      "sourceName": "р. Волга",
      "permitNumber": "12-34-56",
      "volumeByQuarter": [100, 120, 110, 90],
      "totalVolume": 420
    }
  ],
  "waterDischarge": [],
  "recyclingSystem": { "capacity": 50, "cyclesPerYear": 4 }
}
```
