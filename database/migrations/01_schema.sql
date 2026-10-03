-- ============================================================
-- PORTWISE DATABASE MIGRATIONS
-- V1: Initial Schema
-- ============================================================

-- Roles
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- User Roles (join table)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Ports
CREATE TABLE IF NOT EXISTS ports (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    location VARCHAR(200),
    state VARCHAR(100),
    country VARCHAR(100),
    latitude NUMERIC(10,6),
    longitude NUMERIC(10,6),
    number_of_berths INTEGER,
    operational_status VARCHAR(20) NOT NULL DEFAULT 'OPERATIONAL',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Berths
CREATE TABLE IF NOT EXISTS berths (
    id BIGSERIAL PRIMARY KEY,
    port_id BIGINT NOT NULL REFERENCES ports(id),
    berth_name VARCHAR(50) NOT NULL,
    berth_type VARCHAR(50),
    max_draft NUMERIC(5,2),
    max_loa NUMERIC(7,2),
    cargo_type VARCHAR(30),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Vessels
CREATE TABLE IF NOT EXISTS vessels (
    id BIGSERIAL PRIMARY KEY,
    imo_number VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    vessel_type VARCHAR(30) NOT NULL,
    flag VARCHAR(50),
    deadweight_tonnage NUMERIC(10,2),
    length_overall NUMERIC(7,2),
    beam NUMERIC(5,2),
    draft NUMERIC(5,2),
    cargo_capacity NUMERIC(10,2),
    current_location VARCHAR(200),
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Shipments
CREATE TABLE IF NOT EXISTS shipments (
    id BIGSERIAL PRIMARY KEY,
    shipment_number VARCHAR(30) NOT NULL UNIQUE,
    vessel_id BIGINT REFERENCES vessels(id),
    origin_port_id BIGINT REFERENCES ports(id),
    destination_port_id BIGINT REFERENCES ports(id),
    consignee VARCHAR(100),
    description VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Cargo
CREATE TABLE IF NOT EXISTS cargo (
    id BIGSERIAL PRIMARY KEY,
    cargo_type VARCHAR(30) NOT NULL,
    description VARCHAR(300),
    quantity NUMERIC(12,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    origin VARCHAR(100),
    destination VARCHAR(100),
    consignee VARCHAR(100),
    shipment_id BIGINT REFERENCES shipments(id),
    owner_id BIGINT REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'REGISTERED',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Vessel Schedules
CREATE TABLE IF NOT EXISTS vessel_schedules (
    id BIGSERIAL PRIMARY KEY,
    vessel_id BIGINT NOT NULL REFERENCES vessels(id),
    port_id BIGINT NOT NULL REFERENCES ports(id),
    berth_id BIGINT REFERENCES berths(id),
    eta TIMESTAMP NOT NULL,
    etd TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    remarks VARCHAR(500),
    submitted_by BIGINT REFERENCES users(id),
    approved_by BIGINT REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Cargo Movements
CREATE TABLE IF NOT EXISTS cargo_movements (
    id BIGSERIAL PRIMARY KEY,
    cargo_id BIGINT NOT NULL REFERENCES cargo(id),
    status VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    operator_id BIGINT REFERENCES users(id),
    remarks VARCHAR(500),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Resources
CREATE TABLE IF NOT EXISTS resources (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    resource_type VARCHAR(30) NOT NULL,
    port_id BIGINT NOT NULL REFERENCES ports(id),
    description VARCHAR(200),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Resource Allocations
CREATE TABLE IF NOT EXISTS resource_allocations (
    id BIGSERIAL PRIMARY KEY,
    resource_id BIGINT NOT NULL REFERENCES resources(id),
    operator_id BIGINT REFERENCES users(id),
    operation_description VARCHAR(200),
    start_time TIMESTAMP NOT NULL,
    expected_completion TIMESTAMP,
    actual_completion TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    remarks VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    related_entity_type VARCHAR(50),
    related_entity_id BIGINT,
    port_id BIGINT REFERENCES ports(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    related_entity_type VARCHAR(50),
    related_entity_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    details VARCHAR(2000),
    ip_address VARCHAR(45),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_berths_port_id ON berths(port_id);
CREATE INDEX IF NOT EXISTS idx_vessel_schedules_vessel_id ON vessel_schedules(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_schedules_port_id ON vessel_schedules(port_id);
CREATE INDEX IF NOT EXISTS idx_vessel_schedules_berth_id ON vessel_schedules(berth_id);
CREATE INDEX IF NOT EXISTS idx_vessel_schedules_eta ON vessel_schedules(eta);
CREATE INDEX IF NOT EXISTS idx_cargo_status ON cargo(status);
CREATE INDEX IF NOT EXISTS idx_cargo_movements_cargo_id ON cargo_movements(cargo_id);
CREATE INDEX IF NOT EXISTS idx_resources_port_id ON resources(port_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
