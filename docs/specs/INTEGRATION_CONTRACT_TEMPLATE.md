# <NAME>_CONTRACT

Copy to `docs/specs/<NAME>_CONTRACT.md`. A contract must be **locked** before parallel work on either side of the interface starts. Changes follow `AGENTS.md` change management: update this document first, bump the version, notify both owners.

## Metadata
- Version:
- Status: Draft / Approved — LOCKED
- Related spec / requirements:
- Related stories:
- Related ADRs:
- Consumer (owner):
- Provider (owner):

## 1. Conventions
- Field naming (e.g. `snake_case`):
- Language of identifiers and codes:
- Who localizes user-facing text (never the raw API message):
- Encoding:

## 2. Endpoint / Interface
| Item | Value |
|---|---|
| Method | |
| Path | |
| Request content type | |
| Response content type | |
| Max request size | |
| Authentication | |
| CORS / origin | |

## 3. Request
Example:

```json
{}
```

| Field | Type | Required | Validation rules (client AND server) | Normalization | Stored as |
|---|---|---|---|---|---|

Unknown fields: ignored / rejected.

## 4. Enumerations / codes
| Code | Meaning / labels per language |
|---|---|

## 5. Server-generated fields
| Field | Value, format, timezone |
|---|---|

## 6. Persistence mapping
Target (table, sheet, collection), columns in order, and allowed values for status-like fields.

## 7. Responses
Response body shape (always the same keys):

```json
{}
```

| HTTP status | When | Error code | Consumer behavior |
|---|---|---|---|

Only the success status means the operation succeeded.

## 8. Field error codes
| Code | Meaning |
|---|---|

## 9. Configuration
| Variable | Side | Purpose |
|---|---|---|

Local development: how the consumer reaches the provider locally (proxy, port).

## 10. Test obligations
- Every validation rule: at least one valid and one invalid case, on both sides.
- Every status code the provider can return.
- End-to-end happy path and at least one failure path.
