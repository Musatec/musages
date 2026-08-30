"use server";

export async function getProducts(data?: any): Promise<any[]> { return []; }
export async function createProduct(data?: any): Promise<{ success: boolean; error?: string }> { return { success: true }; }
export async function updateStock(data?: any): Promise<{ success: boolean; error?: string }> { return { success: true }; }
export async function deleteProduct(id?: string): Promise<{ success: boolean; error?: string }> { return { success: true }; }
export async function bulkCreateProducts(products?: any[]): Promise<{ success: boolean; count?: number; error?: string }> { return { success: true, count: 0 }; }
