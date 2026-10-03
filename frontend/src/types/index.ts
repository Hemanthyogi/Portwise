export type Role = 'ADMIN' | 'PORT_AUTHORITY' | 'SHIPPING_AGENT' | 'CARGO_OWNER' | 'LOGISTICS_OPERATOR';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  roles: Role[];
  active: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  email: string;
  fullName: string;
  roles: Role[];
}

export type PortStatus = 'OPERATIONAL' | 'PARTIAL' | 'CLOSED';

export interface Port {
  id: number;
  name: string;
  code: string;
  location: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  numberOfBerths?: number;
  operationalStatus: PortStatus;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BerthStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
export type CargoType = 'COAL' | 'IRON_ORE' | 'FERTILIZER' | 'GRAIN' | 'CONTAINERIZED' | 'GENERAL_CARGO' | 'OTHER';

export interface Berth {
  id: number;
  portId: number;
  portName?: string;
  berthName: string;
  berthType?: string;
  maxDraft?: number;
  maxLOA?: number;
  cargoType?: CargoType;
  status: BerthStatus;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type VesselType = 'BULK_CARRIER' | 'CONTAINER' | 'TANKER' | 'GENERAL_CARGO' | 'OTHER';
export type VesselStatus = 'SCHEDULED' | 'ARRIVING' | 'AT_ANCHORAGE' | 'AT_BERTH' | 'LOADING' | 'UNLOADING' | 'DEPARTED' | 'DELAYED';

export interface Vessel {
  id: number;
  imoNumber: string;
  name: string;
  vesselType: VesselType;
  flag?: string;
  deadweightTonnage?: number;
  lengthOverall?: number;
  beam?: number;
  draft?: number;
  cargoCapacity?: number;
  currentLocation?: string;
  status: VesselStatus;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ScheduleStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface VesselSchedule {
  id: number;
  vesselId: number;
  vesselName: string;
  vesselImo: string;
  portId: number;
  portName: string;
  berthId?: number;
  berthName?: string;
  eta: string;
  etd: string;
  status: ScheduleStatus;
  remarks?: string;
  submittedById?: number;
  submittedByName?: string;
  approvedById?: number;
  approvedByName?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type CargoStatus = 'REGISTERED' | 'IN_TRANSIT' | 'AT_PORT' | 'LOADING' | 'UNLOADING' | 'COMPLETED' | 'DELAYED';

export interface Cargo {
  id: number;
  cargoType: CargoType;
  description: string;
  quantity: number;
  unit: string;
  origin?: string;
  destination?: string;
  consignee?: string;
  shipmentId?: number;
  shipmentNumber?: string;
  ownerId?: number;
  ownerName?: string;
  status: CargoStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CargoMovement {
  id: number;
  cargoId: number;
  status: string;
  location?: string;
  operatorId?: number;
  operatorName?: string;
  remarks?: string;
  timestamp: string;
  createdAt: string;
}

export type ResourceType = 'CRANE' | 'FORKLIFT' | 'TRUCK' | 'STORAGE_AREA' | 'HANDLING_EQUIPMENT' | 'OTHER';
export type ResourceStatus = 'AVAILABLE' | 'ALLOCATED' | 'MAINTENANCE' | 'OUT_OF_SERVICE';

export interface Resource {
  id: number;
  name: string;
  resourceType: ResourceType;
  portId: number;
  portName?: string;
  description?: string;
  status: ResourceStatus;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AllocationStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface ResourceAllocation {
  id: number;
  resourceId: number;
  resourceName: string;
  operatorId?: number;
  operatorName?: string;
  operationDescription?: string;
  startTime: string;
  expectedCompletion?: string;
  actualCompletion?: string;
  status: AllocationStatus;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface Alert {
  id: number;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  relatedEntityType?: string;
  relatedEntityId?: number;
  portId?: number;
  portName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  read: boolean;
  relatedEntityType?: string;
  relatedEntityId?: number;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  userId?: number;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId?: number;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface DashboardData {
  totalVessels: number;
  activeVessels: number;
  arrivingVessels: number;
  atBerthVessels: number;
  cargoInTransit: number;
  cargoCompleted: number;
  berthsOccupied: number;
  berthsAvailable: number;
  pendingSchedules: number;
  activeAlerts: number;
  recentSchedules: VesselSchedule[];
  recentAlerts: Alert[];
  vesselStatusDistribution: Record<string, number>;
  cargoStatusDistribution: Record<string, number>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
