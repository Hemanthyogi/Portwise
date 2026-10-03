# PORTWISE — Setup & Installation Guide

## 1. System Requirements
- **Java**: OpenJDK 21 (LTS)
- **Build Tool**: Apache Maven 3.9+
- **Node.js**: v20+ & npm 10+
- **Database**: PostgreSQL 15+ (or Docker)
- **Docker & Docker Compose** (Optional for containerized execution)

---

## 2. Option A: Local Bare-Metal Setup

### Step 1: PostgreSQL Setup
Ensure PostgreSQL is running locally on port 5432:
```sql
CREATE DATABASE portwise_db;
CREATE USER portwise WITH ENCRYPTED PASSWORD 'portwise_secret';
GRANT ALL PRIVILEGES ON DATABASE portwise_db TO portwise;
```

### Step 2: Backend Execution
```bash
cd backend
# Run Flyway migrations and start the Spring Boot application
mvn spring-boot:run
```
The backend initializes database tables via Flyway migrations (`V1__initial_schema.sql`) and seeds demonstration data (`V2__demo_seed_data.sql`).
Verify backend health: `http://localhost:8080/swagger-ui.html`

### Step 3: Frontend Execution
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 3. Option B: Docker Compose Setup

Run the entire stack with a single command:
```bash
docker-compose up --build -d
```

This starts:
- `portwise-postgres` on port `5432`
- `portwise-backend` on port `8080`
- `portwise-frontend` on port `3000` (mapped to Nginx port 80)
