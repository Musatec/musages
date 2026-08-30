"use server";

export async function getDailyMetrics(date?: any): Promise<any> { return []; }
export async function getSalePublicData(id: string): Promise<{ success: boolean; sale?: any; error?: string }> { return { success: true, sale: null }; }
export async function getDebts(): Promise<{ debts: any[] }> { return { debts: [] }; }
export async function registerDebtPayment(id: string, amount: number): Promise<{ success: boolean; error?: string }> { return { success: true }; }
