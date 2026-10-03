# PORTWISE — Backend Service
Spring Boot 3.3.x + Java 21 + Spring Data JPA + Spring Security (Stateless JWT) + PostgreSQL

## Features
- **Stateless JWT Authentication**: Dual role-based guards with BCrypt password hashing.
- **Relational Domain**: Ports, Berths, Vessels, Schedules, Cargo, Shipments, Resources, Alerts, Notifications, and Audit Logs.
- **Conflict Validation Engine**: Prevents overlapping berth allocations and enforces physical draft/LOA limits.
- **Flyway Migrations**: Automated relational DDL and demonstration data seeding.
- **Swagger / OpenAPI**: Complete API exploration at `/swagger-ui.html`.

## Commands
```bash
# Compile and run tests
mvn test

# Package JAR
mvn package -DskipTests

# Run locally
mvn spring-boot:run
```
