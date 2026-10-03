-- ============================================================
-- PORTWISE DEMO DATA SEEDER
-- V2: Demo seed data (clearly labelled as DEMO)
-- ============================================================

-- Roles
INSERT INTO roles (name) VALUES
    ('ADMIN'), ('PORT_AUTHORITY'), ('SHIPPING_AGENT'), ('CARGO_OWNER'), ('LOGISTICS_OPERATOR')
ON CONFLICT (name) DO NOTHING;

-- Demo Users (password = Demo@12345 BCrypt hashed)
INSERT INTO users (full_name, email, password, phone, active) VALUES
    ('Admin User',          'admin@portwise.demo',         '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh1m', '9000000001', true),
    ('Port Authority',      'portauthority@portwise.demo', '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh1m', '9000000002', true),
    ('Shipping Agent',      'agent@portwise.demo',         '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh1m', '9000000003', true),
    ('Cargo Owner',         'cargo@portwise.demo',         '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh1m', '9000000004', true),
    ('Logistics Operator',  'operator@portwise.demo',      '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh1m', '9000000005', true)
ON CONFLICT (email) DO NOTHING;

-- Assign Roles
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'admin@portwise.demo' AND r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'portauthority@portwise.demo' AND r.name = 'PORT_AUTHORITY'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'agent@portwise.demo' AND r.name = 'SHIPPING_AGENT'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'cargo@portwise.demo' AND r.name = 'CARGO_OWNER'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'operator@portwise.demo' AND r.name = 'LOGISTICS_OPERATOR'
ON CONFLICT DO NOTHING;

-- Demo Ports (Indian Major Ports)
INSERT INTO ports (name, code, location, state, country, latitude, longitude, number_of_berths, operational_status) VALUES
    ('Paradip Port', 'INPRD', 'Paradip, Odisha', 'Odisha', 'India', 20.3170, 86.6074, 20, 'OPERATIONAL'),
    ('Visakhapatnam Port', 'INVTZ', 'Visakhapatnam, Andhra Pradesh', 'Andhra Pradesh', 'India', 17.6868, 83.2185, 26, 'OPERATIONAL'),
    ('Chennai Port', 'INMAA', 'Chennai, Tamil Nadu', 'Tamil Nadu', 'India', 13.0827, 80.2827, 24, 'OPERATIONAL'),
    ('Ennore Port', 'INENN', 'Ennore, Tamil Nadu', 'Tamil Nadu', 'India', 13.2272, 80.3205, 12, 'OPERATIONAL'),
    ('Kolkata / Haldia Port', 'INKOL', 'Kolkata/Haldia, West Bengal', 'West Bengal', 'India', 22.5726, 88.3639, 30, 'OPERATIONAL')
ON CONFLICT (code) DO NOTHING;

-- Demo Berths (for first 3 ports)
INSERT INTO berths (port_id, berth_name, berth_type, max_draft, max_loa, cargo_type, status) VALUES
    ((SELECT id FROM ports WHERE code='INPRD'), 'INPRD-B1', 'Bulk', 14.50, 220.00, 'COAL', 'AVAILABLE'),
    ((SELECT id FROM ports WHERE code='INPRD'), 'INPRD-B2', 'Bulk', 13.00, 190.00, 'IRON_ORE', 'AVAILABLE'),
    ((SELECT id FROM ports WHERE code='INPRD'), 'INPRD-B3', 'General', 10.00, 160.00, 'GENERAL_CARGO', 'AVAILABLE'),
    ((SELECT id FROM ports WHERE code='INVTZ'), 'INVTZ-B1', 'Bulk', 15.00, 240.00, 'COAL', 'AVAILABLE'),
    ((SELECT id FROM ports WHERE code='INVTZ'), 'INVTZ-B2', 'Container', 12.00, 300.00, 'CONTAINERIZED', 'AVAILABLE'),
    ((SELECT id FROM ports WHERE code='INVTZ'), 'INVTZ-B3', 'Tanker', 14.00, 200.00, 'GRAIN', 'MAINTENANCE'),
    ((SELECT id FROM ports WHERE code='INMAA'), 'INMAA-B1', 'Container', 13.00, 300.00, 'CONTAINERIZED', 'AVAILABLE'),
    ((SELECT id FROM ports WHERE code='INMAA'), 'INMAA-B2', 'Bulk', 12.00, 200.00, 'IRON_ORE', 'AVAILABLE'),
    ((SELECT id FROM ports WHERE code='INMAA'), 'INMAA-B3', 'General', 9.00, 150.00, 'GENERAL_CARGO', 'AVAILABLE')
ON CONFLICT DO NOTHING;

-- Demo Vessels
INSERT INTO vessels (imo_number, name, vessel_type, flag, deadweight_tonnage, length_overall, beam, draft, cargo_capacity, current_location, status) VALUES
    ('IMO9876543', 'MV Eastern Glory',  'BULK_CARRIER',  'India',   75000.00, 225.00, 32.00, 13.50, 70000.00, 'At Sea - Bay of Bengal',  'ARRIVING'),
    ('IMO9876544', 'MV Ocean Star',     'CONTAINER',     'Panama',  45000.00, 295.00, 32.20, 11.00, 40000.00, 'Paradip Port',             'AT_BERTH'),
    ('IMO9876545', 'MV Blue Horizon',   'TANKER',        'Liberia', 60000.00, 198.00, 28.00, 13.80, 55000.00, 'At Sea - Indian Ocean',    'SCHEDULED'),
    ('IMO9876546', 'MV Sea Quest',      'GENERAL_CARGO', 'India',   25000.00, 158.00, 22.00, 9.50,  22000.00, 'Chennai Port',             'LOADING'),
    ('IMO9876547', 'MV Pacific Dawn',   'BULK_CARRIER',  'Greece',  80000.00, 230.00, 34.00, 14.20, 75000.00, 'At Anchorage - Vizag',     'AT_ANCHORAGE')
ON CONFLICT (imo_number) DO NOTHING;

-- Demo Resources
INSERT INTO resources (name, resource_type, port_id, description, status) VALUES
    ('Crane-1',       'CRANE',              (SELECT id FROM ports WHERE code='INPRD'), 'Bulk cargo crane capacity 40T',  'AVAILABLE'),
    ('Crane-2',       'CRANE',              (SELECT id FROM ports WHERE code='INPRD'), 'Bulk cargo crane capacity 40T',  'ALLOCATED'),
    ('Forklift-1',    'FORKLIFT',           (SELECT id FROM ports WHERE code='INPRD'), 'Heavy forklift 10T capacity',    'AVAILABLE'),
    ('Truck-1',       'TRUCK',              (SELECT id FROM ports WHERE code='INVTZ'), '20T flatbed truck',              'AVAILABLE'),
    ('Crane-VTZ-1',   'CRANE',              (SELECT id FROM ports WHERE code='INVTZ'), 'Container crane 60T',            'AVAILABLE'),
    ('Storage-MMA-1', 'STORAGE_AREA',       (SELECT id FROM ports WHERE code='INMAA'), 'Covered storage 5000 sqm',       'AVAILABLE'),
    ('Crane-MMA-1',   'CRANE',              (SELECT id FROM ports WHERE code='INMAA'), 'Ship-to-shore crane',            'MAINTENANCE')
ON CONFLICT DO NOTHING;

-- Demo Shipments
INSERT INTO shipments (shipment_number, vessel_id, origin_port_id, destination_port_id, consignee, description) VALUES
    ('SHP-2024-001', (SELECT id FROM vessels WHERE imo_number='IMO9876543'), (SELECT id FROM ports WHERE code='INKOL'), (SELECT id FROM ports WHERE code='INPRD'), 'Eastern Steel Pvt Ltd', 'Coal shipment'),
    ('SHP-2024-002', (SELECT id FROM vessels WHERE imo_number='IMO9876544'), (SELECT id FROM ports WHERE code='INMAA'), (SELECT id FROM ports WHERE code='INVTZ'), 'Vizag Containers Ltd', 'Containerized goods'),
    ('SHP-2024-003', (SELECT id FROM vessels WHERE imo_number='IMO9876546'), (SELECT id FROM ports WHERE code='INVTZ'), (SELECT id FROM ports WHERE code='INMAA'), 'Chennai Traders', 'General cargo')
ON CONFLICT (shipment_number) DO NOTHING;

-- Demo Cargo
INSERT INTO cargo (cargo_type, description, quantity, unit, origin, destination, consignee, shipment_id, owner_id, status) VALUES
    ('COAL', '[DEMO] Thermal Coal from Odisha', 65000.00, 'MT', 'Kolkata', 'Paradip', 'Eastern Steel Pvt Ltd',
     (SELECT id FROM shipments WHERE shipment_number='SHP-2024-001'),
     (SELECT id FROM users WHERE email='cargo@portwise.demo'), 'IN_TRANSIT'),
    ('IRON_ORE', '[DEMO] Iron Ore for Steel Plant', 38000.00, 'MT', 'Chennai', 'Visakhapatnam', 'Vizag Containers Ltd',
     (SELECT id FROM shipments WHERE shipment_number='SHP-2024-002'),
     (SELECT id FROM users WHERE email='cargo@portwise.demo'), 'AT_PORT'),
    ('GENERAL_CARGO', '[DEMO] Machinery and Equipment', 5000.00, 'MT', 'Visakhapatnam', 'Chennai', 'Chennai Traders',
     (SELECT id FROM shipments WHERE shipment_number='SHP-2024-003'),
     (SELECT id FROM users WHERE email='cargo@portwise.demo'), 'LOADING'),
    ('FERTILIZER', '[DEMO] Urea Fertilizer', 12000.00, 'MT', 'Vizag', 'Paradip', 'Agro Fertilizers Ltd',
     NULL, (SELECT id FROM users WHERE email='cargo@portwise.demo'), 'REGISTERED')
ON CONFLICT DO NOTHING;

-- Demo Vessel Schedules
INSERT INTO vessel_schedules (vessel_id, port_id, berth_id, eta, etd, status, remarks, submitted_by, approved_by, approved_at) VALUES
    ((SELECT id FROM vessels WHERE imo_number='IMO9876543'),
     (SELECT id FROM ports WHERE code='INPRD'),
     (SELECT id FROM berths WHERE berth_name='INPRD-B1'),
     NOW() + INTERVAL '6 hours', NOW() + INTERVAL '2 days',
     'APPROVED', '[DEMO] Coal unloading operation',
     (SELECT id FROM users WHERE email='agent@portwise.demo'),
     (SELECT id FROM users WHERE email='portauthority@portwise.demo'),
     NOW() - INTERVAL '1 day'),
    ((SELECT id FROM vessels WHERE imo_number='IMO9876545'),
     (SELECT id FROM ports WHERE code='INVTZ'),
     (SELECT id FROM berths WHERE berth_name='INVTZ-B1'),
     NOW() + INTERVAL '2 days', NOW() + INTERVAL '4 days',
     'PENDING', '[DEMO] Tanker docking request',
     (SELECT id FROM users WHERE email='agent@portwise.demo'),
     NULL, NULL),
    ((SELECT id FROM vessels WHERE imo_number='IMO9876547'),
     (SELECT id FROM ports WHERE code='INVTZ'),
     (SELECT id FROM berths WHERE berth_name='INVTZ-B2'),
     NOW() + INTERVAL '1 day', NOW() + INTERVAL '3 days',
     'PENDING', '[DEMO] Bulk carrier coal discharge',
     (SELECT id FROM users WHERE email='agent@portwise.demo'),
     NULL, NULL)
ON CONFLICT DO NOTHING;

-- Demo Alerts
INSERT INTO alerts (title, description, severity, status, related_entity_type, related_entity_id, port_id) VALUES
    ('[DEMO] Vessel Delay Alert', 'MV Blue Horizon has been delayed by 6 hours due to weather conditions.', 'WARNING', 'ACTIVE', 'Vessel', (SELECT id FROM vessels WHERE imo_number='IMO9876545'), (SELECT id FROM ports WHERE code='INVTZ')),
    ('[DEMO] Berth Maintenance', 'INVTZ-B3 is under scheduled maintenance until further notice.', 'INFO', 'ACKNOWLEDGED', 'Berth', (SELECT id FROM berths WHERE berth_name='INVTZ-B3'), (SELECT id FROM ports WHERE code='INVTZ')),
    ('[DEMO] Cargo Delay', 'Coal shipment SHP-2024-001 is delayed in transit.', 'WARNING', 'ACTIVE', 'Cargo', NULL, (SELECT id FROM ports WHERE code='INPRD'))
ON CONFLICT DO NOTHING;

-- Demo Notifications
INSERT INTO notifications (user_id, title, message, read) VALUES
    ((SELECT id FROM users WHERE email='portauthority@portwise.demo'), 'New Schedule Request', '[DEMO] MV Blue Horizon has submitted a berth request for Visakhapatnam Port.', false),
    ((SELECT id FROM users WHERE email='portauthority@portwise.demo'), 'Resource Alert', '[DEMO] Crane-MMA-1 at Chennai Port is under maintenance.', false),
    ((SELECT id FROM users WHERE email='agent@portwise.demo'), 'Schedule Approved', '[DEMO] Your vessel schedule for MV Eastern Glory at Paradip has been approved.', true),
    ((SELECT id FROM users WHERE email='cargo@portwise.demo'), 'Cargo Status Update', '[DEMO] Your coal shipment SHP-2024-001 is in transit.', false),
    ((SELECT id FROM users WHERE email='operator@portwise.demo'), 'Operation Assigned', '[DEMO] You have been assigned to cargo handling at Paradip Port.', false)
ON CONFLICT DO NOTHING;

-- Demo Cargo Movements
INSERT INTO cargo_movements (cargo_id, status, location, operator_id, remarks, timestamp) VALUES
    ((SELECT id FROM cargo WHERE description='[DEMO] Thermal Coal from Odisha'), 'REGISTERED', 'Kolkata Port Origin', NULL, '[DEMO] Cargo registered in system', NOW() - INTERVAL '5 days'),
    ((SELECT id FROM cargo WHERE description='[DEMO] Thermal Coal from Odisha'), 'IN_TRANSIT', 'Bay of Bengal', (SELECT id FROM users WHERE email='operator@portwise.demo'), '[DEMO] Vessel departed Kolkata', NOW() - INTERVAL '3 days'),
    ((SELECT id FROM cargo WHERE description='[DEMO] Iron Ore for Steel Plant'), 'REGISTERED', 'Chennai Origin', NULL, '[DEMO] Iron ore registered', NOW() - INTERVAL '4 days'),
    ((SELECT id FROM cargo WHERE description='[DEMO] Iron Ore for Steel Plant'), 'AT_PORT', 'Visakhapatnam Port', (SELECT id FROM users WHERE email='operator@portwise.demo'), '[DEMO] Arrived at destination port', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Demo Audit Logs
INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details) VALUES
    ((SELECT id FROM users WHERE email='admin@portwise.demo'), 'USER_CREATED', 'User', 1, '[DEMO] Demo users seeded'),
    ((SELECT id FROM users WHERE email='portauthority@portwise.demo'), 'VESSEL_SCHEDULE_APPROVED', 'VesselSchedule', 1, '[DEMO] Schedule for MV Eastern Glory approved'),
    ((SELECT id FROM users WHERE email='agent@portwise.demo'), 'VESSEL_SCHEDULE_SUBMITTED', 'VesselSchedule', 2, '[DEMO] Schedule submitted for MV Blue Horizon')
ON CONFLICT DO NOTHING;
