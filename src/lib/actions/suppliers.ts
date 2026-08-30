"use server";

export async function getSuppliers(data?: any): Promise<{ success: boolean; suppliers?: any[]; error?: string }> {
  return { success: true, suppliers: [] };
}

export async function createSupplier(data: any): Promise<{ success: boolean; error?: string }> {
  return { success: true };
}

export async function processPurchase(data: any): Promise<{ success: boolean; error?: string }> {
  return { success: true };
}
