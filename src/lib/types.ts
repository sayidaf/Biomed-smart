
export type UserRole = 'ADMIN' | 'ENGINEER' | 'TECHNICIAN';

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  equipmentCount: number;
}

export type EquipmentStatus = 'OPERATIONAL' | 'FAULTY' | 'DOWNTIME' | 'MAINTENANCE' | 'DISPOSED';

export interface Equipment {
  id: string;
  name: string;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  assetNumber: string;
  departmentId: string;
  purchaseDate: string;
  installationDate: string;
  warrantyExpiry: string;
  status: EquipmentStatus;
  manualUrl?: string;
  imageUrl?: string;
  lastServiceDate?: string;
  nextServiceDate: string;
}

export interface MaintenanceLog {
  id: string;
  equipmentId: string;
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'CALIBRATION';
  date: string;
  engineerId: string;
  description: string;
  partsReplaced?: string[];
  cost?: number;
  downtimeHours?: number;
}

export interface FaultReport {
  id: string;
  equipmentId: string;
  reportedBy: string;
  date: string;
  description: string;
  errorCode?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  resolution?: string;
}

export interface TroubleshootingSession {
  id: string;
  equipmentId: string;
  engineerId: string;
  date: string;
  problem: string;
  diagnosis: string;
  steps: string[];
}
