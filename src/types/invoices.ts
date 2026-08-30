import { Transaction } from "@prisma/client";

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
}

export interface Invoice {
  id: string;
  number: string;
  total: number;
  status: string;
  items: InvoiceItem[];
  seller?: { name: string | null };
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface InvoicesMetrics {
  totalOutstanding: number;
  totalBilled: number;
  recoveryRate: number;
  invoiceCount: number;
}

export interface InvoicesData {
  invoices: Invoice[];
  metrics: InvoicesMetrics | null;
}

export interface InvoiceFilters {
  search?: string;
  status?: string;
  limit?: number;
}
