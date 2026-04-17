import { Sale, AuditLog } from "@prisma/client";
import { LucideIcon } from "lucide-react";
import React from "react";

export interface DashboardMetrics {
  totalSales: number;
  salesGrowth: number;
  activeInventory: number;
  stockAlerts: number;
  totalEmployees: number;
  netCashflow: number;
}

export type SerializedSale = Omit<Sale, "createdAt" | "updatedAt" | "deletedAt"> & {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type SerializedAuditLog = Omit<AuditLog, "createdAt"> & {
  createdAt: string;
};

export interface DashboardMetricItem {
  label: string;
  value: string;
  subValue: string;
  icon: LucideIcon | React.ElementType;
  color: string;
  trend: string;
}

export interface DashboardClientProps {
  metrics: DashboardMetrics;
  recentSales: SerializedSale[];
}
