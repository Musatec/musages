export type Transaction = {
    id: string;
    storeId: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    description: string | null;
    createdAt: string; // ISO date string from JSON serialization
    updatedAt: string;
};
