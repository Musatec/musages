export type Transaction = {
    id: string;
    created_at: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    description: string;
    date: string;
    user_id?: string;
};
