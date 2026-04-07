import { Employee } from "@prisma/client";

export interface HRMetrics {
  totalPayroll: number;
  totalAdvances: number;
  netToPay: number;
  count: number;
}

export interface HRData {
  employees: Employee[];
  metrics: HRMetrics;
}

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  salary: string;
}
