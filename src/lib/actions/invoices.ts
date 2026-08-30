"use server";

export async function getInvoices(filters?: any) {
  return { invoices: [], metrics: { totalOutstanding: 0, totalBilled: 0, recoveryRate: 0, invoiceCount: 0 } };
}
