"use server";

export async function getUserStores() { return { success: true, ownedStores: [], currentStore: null, plan: "STARTER" }; }
export async function createStore(name?: string) { return { success: true }; }
export async function createSubStoreManager(data?: any) { return { success: true }; }
export async function switchStore(id?: string) { return { success: true }; }
