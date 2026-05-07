
import { Department, Equipment, MaintenanceLog, FaultReport } from './types';

export const departments: Department[] = [
  { id: '1', name: 'Intensive Care Unit', code: 'ICU', description: 'Critical care and life support', equipmentCount: 45 },
  { id: '2', name: 'Radiology', code: 'RAD', description: 'Diagnostic imaging services', equipmentCount: 22 },
  { id: '3', name: 'Laboratory', code: 'LAB', description: 'Clinical testing and analysis', equipmentCount: 38 },
  { id: '4', name: 'Operating Theatre', code: 'OT', description: 'Surgical procedures and monitoring', equipmentCount: 56 },
  { id: '5', name: 'Maternity', code: 'MAT', description: 'Neonatal and maternal care', equipmentCount: 15 },
];

export const equipment: Equipment[] = [
  {
    id: 'eq-101',
    name: 'MRI Scanner Magnetom Lumina',
    manufacturer: 'Siemens Healthineers',
    modelNumber: 'MAG-LUM-2023',
    serialNumber: 'SN-99882233',
    assetNumber: 'AS-RAD-001',
    departmentId: '2',
    purchaseDate: '2023-01-15',
    installationDate: '2023-02-10',
    warrantyExpiry: '2025-02-10',
    status: 'OPERATIONAL',
    imageUrl: 'https://picsum.photos/seed/mri/600/400',
    lastServiceDate: '2024-02-15',
    nextServiceDate: '2024-08-15',
  },
  {
    id: 'eq-102',
    name: 'Ventilator PB980',
    manufacturer: 'Medtronic',
    modelNumber: 'PB980-PLUS',
    serialNumber: 'SN-V12345',
    assetNumber: 'AS-ICU-042',
    departmentId: '1',
    purchaseDate: '2022-06-20',
    installationDate: '2022-06-25',
    warrantyExpiry: '2024-06-25',
    status: 'FAULTY',
    imageUrl: 'https://picsum.photos/seed/ventilator/600/400',
    lastServiceDate: '2023-12-10',
    nextServiceDate: '2024-06-10',
  },
  {
    id: 'eq-103',
    name: 'Patient Monitor IntelliVue MX800',
    manufacturer: 'Philips',
    modelNumber: 'MX800-REV2',
    serialNumber: 'SN-PM-77665',
    assetNumber: 'AS-OT-088',
    departmentId: '4',
    purchaseDate: '2023-11-01',
    installationDate: '2023-11-05',
    warrantyExpiry: '2025-11-05',
    status: 'MAINTENANCE',
    imageUrl: 'https://picsum.photos/seed/monitor/600/400',
    lastServiceDate: '2024-05-01',
    nextServiceDate: '2024-11-01',
  }
];

export const maintenanceLogs: MaintenanceLog[] = [
  {
    id: 'm1',
    equipmentId: 'eq-101',
    type: 'PREVENTIVE',
    date: '2024-02-15',
    engineerId: 'eng-1',
    description: 'Helium level check and software calibration.',
    cost: 1500,
    downtimeHours: 4,
  }
];

export const faultReports: FaultReport[] = [
  {
    id: 'f1',
    equipmentId: 'eq-102',
    reportedBy: 'Nurse Alice',
    date: '2024-05-20',
    description: 'Ventilator display flashing error code E-203 periodically.',
    errorCode: 'E-203',
    status: 'OPEN',
  }
];
