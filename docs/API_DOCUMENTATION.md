# PORTWISE — REST API Documentation
Base URL: `/api/v1`
Interactive Swagger UI: `http://localhost:8080/swagger-ui.html`
OpenAPI JSON: `http://localhost:8080/api-docs`

## Standard Envelope Format
All endpoints return consistent JSON envelopes:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

## Key API Endpoints

### 1. Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/login` — Authenticate and retrieve JWT token.
- `POST /api/v1/auth/register` — Register a new operator/agent account.
- `GET  /api/v1/auth/me` — Retrieve the currently authenticated identity.

### 2. Dashboard (`/api/v1/dashboard`)
- `GET  /api/v1/dashboard` — Live aggregated KPIs, vessel distributions, active alerts, and recent arrivals.

### 3. Vessel Registry (`/api/v1/vessels`)
- `GET  /api/v1/vessels` — Paginated list with `search` and `status` filters.
- `GET  /api/v1/vessels/{id}` — Single vessel specifications.
- `POST /api/v1/vessels` — Register vessel (requires `IMO\d{7}` regex validation).
- `PATCH /api/v1/vessels/{id}/status` — Update vessel navigation state (`SCHEDULED`, `ARRIVING`, `AT_BERTH`, etc.).

### 4. Vessel Scheduling & Berthing (`/api/v1/schedules`)
- `GET  /api/v1/schedules` — List schedules with status filter.
- `POST /api/v1/schedules` — Submit vessel arrival request with ETA/ETD window.
- `PATCH /api/v1/schedules/{id}/status` — Review and approve docking request. Enforces berth availability, vessel draft compatibility, and vessel LOA compatibility.

### 5. Cargo & Movements (`/api/v1/cargo`)
- `GET  /api/v1/cargo` — Paginated cargo inventory.
- `GET  /api/v1/cargo/{id}` — Cargo consignment details.
- `POST /api/v1/cargo` — Register new cargo consignment.
- `PATCH /api/v1/cargo/{id}/status` — Update pipeline state.
- `GET  /api/v1/cargo/{id}/movements` — Visual chain of custody timeline events.
- `POST /api/v1/cargo/movements` — Log a new movement step (inspection, loading, customs, etc.).

### 6. Ports & Berths
- `GET  /api/v1/ports` & `POST /api/v1/ports` — Major port facilities management.
- `GET  /api/v1/berths` & `POST /api/v1/berths` — Berth capacity and physical limits.
- `PATCH /api/v1/berths/{id}/status` — Toggle berth status (`AVAILABLE`, `OCCUPIED`, `MAINTENANCE`).

### 7. Resources & Allocations
- `GET  /api/v1/resources` & `POST /api/v1/resources` — Port handling equipment.
- `GET  /api/v1/resource-allocations` — List active allocations.
- `POST /api/v1/resource-allocations` — Deploy equipment with overlap conflict prevention.
- `PATCH /api/v1/resource-allocations/{id}/complete` — Mark equipment job complete.

### 8. Alerts & Notifications
- `GET  /api/v1/alerts` & `POST /api/v1/alerts` — Incident reporting and resolution.
- `GET  /api/v1/notifications` — User notifications inbox.
- `PATCH /api/v1/notifications/{id}/read` & `PATCH /api/v1/notifications/read-all` — Mark read.

### 9. Reports & Audits
- `GET  /api/v1/reports/operational` — Port efficiency and throughput analytics.
- `GET  /api/v1/audit-logs` — Immutable administrative audit trail.
