import { Sale, Product, SaleItem } from "@prisma/client";

export interface InvoiceItem extends Omit<SaleItem, "createdAt"> {
  product: Product;
}

export interface Invoice extends Omit<Sale, "createdAt" | "updatedAt" | "deletedAt"> {
  items: InvoiceItem[];
  seller: { name: string | null };
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt: Date | string | null;
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
