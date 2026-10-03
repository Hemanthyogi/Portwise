# PORTWISE — Integrated Port Logistics Management System
> **Connecting Ports. Powering Progress.**

[![Java 21](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/)
[![Spring Boot 3.3.4](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 1. Executive Summary
**PORTWISE** is a centralized digital logistics operating system engineered to synchronize port authorities, shipping agents, cargo owners, and logistics operators. The platform manages vessel traffic, berth allocation, equipment deployment, multimodal cargo tracking, and operational decision-making across major maritime hubs (Paradip, Visakhapatnam, Chennai, Ennore, Kolkata/Haldia).

---

## 2. Key Modules & Functional Architecture

### Module 1: Role-Based Access Control (RBAC) & Security
- **ADMIN**: User directory, port provisioning, system-wide reports, audit inspection.
- **PORT AUTHORITY**: Berth management, schedule approval/rejection, crane allocation, operational alerts.
- **SHIPPING AGENT**: Vessel registration, IMO compliance, arrival & berthing requests.
- **CARGO OWNER**: Consignment registry, custody tracking, cargo clearance status.
- **LOGISTICS OPERATOR**: Real-time handling progress, equipment execution, movement timeline updates.
- **Security**: Stateless JWT authentication, BCrypt password hashing, `@PreAuthorize` method security.

### Module 2: Operational Command Dashboard
- Live telemetry KPI cards: Active Vessels, In-Transit Cargo, Berth Occupancy, Pending Requests, Average Turnaround Time.
- Interactive visualizations powered by Recharts (Vessel category breakdown, cargo pipeline volume).
- Integrated operational alerts feed and upcoming schedule queues directly mapped to database aggregates.

### Module 3: Port & Berth Management
- Management of major Indian ports with geographical coordinates and berth quotas.
- Conflict-guarded berth allocation with physical validation:
  - **Rule 1**: Strict rejection of overlapping time windows on the same berth.
  - **Rule 2**: Vessel draft physical constraint checking (`vessel.draft <= berth.maxDraft`).
  - **Rule 3**: Vessel LOA physical constraint checking (`vessel.loa <= berth.maxLOA`).

### Module 4: Vessel Registry & Scheduling Engine
- IMO validation (`IMO\d{7}`) with naval specifications (DWT, Beam, Draft, Cargo Capacity).
- Dynamic scheduling approval workflow: Submission -> Review -> Physical Compatibility Verification -> Berth Reservation.

### Module 5: Cargo Tracking & Chain-of-Custody Timeline
- Multi-stage visual timeline tracking: Registered -> Dispatched -> Arrived at Port -> Inspection -> Loading/Unloading -> Processed -> Departed -> Delivered.
- **Rule 7**: Completed cargo cannot be reverted to `REGISTERED` without administrative intervention.

### Module 6: Heavy Equipment & Resource Allocation
- Real-time tracking of cranes, forklifts, trucks, and storage areas.
- **Rule 4**: Prevents concurrent assignment of the same equipment to conflicting operational windows.

### Module 7: Alerts, Notifications & Auditing
- Incident alerts classified by severity (`INFO`, `WARNING`, `CRITICAL`).
- In-app notification center with live unread indicators and bulk read actions.
- Administrative audit log capturing user identity, action, entity ID, and timestamps.

---

## 3. Technology Stack

| Domain | Technologies |
|---|---|
| **Backend** | Java 21 (LTS), Spring Boot 3.3.4, Spring Data JPA, Hibernate, Spring Security, JJWT 0.12.6, Maven, Lombok, SpringDoc OpenAPI |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Axios, React Router v6, Recharts, Lucide Icons |
| **Database** | PostgreSQL 16, Flyway Migrations |
| **DevOps** | Multi-stage Dockerfiles, Docker Compose, Nginx Reverse Proxy |

---

## 4. Quick Start Guide

### Bare-Metal Setup
1. **Prerequisites**: Java 21, Maven 3.9+, Node.js 20+, PostgreSQL 15+.
2. **Start Backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   *The backend starts on `http://localhost:8080`. Flyway automatically runs database migrations and seeds initial demo data.*
3. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The frontend dashboard opens on `http://localhost:5173`.*

### Docker Compose
Run the entire platform in isolated containers:
```bash
docker-compose up --build -d
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api/v1`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

---

## 5. Demonstration Credentials

All demo accounts share the password: `Demo@12345`

| Account | Email | Primary Scope |
|---|---|---|
| **Admin** | `admin@portwise.demo` | Master system control & user admin |
| **Port Authority** | `portauthority@portwise.demo` | Berthing & resource allocation |
| **Shipping Agent** | `agent@portwise.demo` | Vessel filing & arrival requests |
| **Cargo Owner** | `cargo@portwise.demo` | Consignment registration |
| **Logistics Operator** | `operator@portwise.demo` | Timeline updates & handling |

---

## 6. Testing & Quality Assurance
Run backend test suite:
```bash
cd backend
mvn test
```
All unit and business rule conflict tests execute against an isolated in-memory H2 database (PostgreSQL mode) ensuring 100% deterministic results.
