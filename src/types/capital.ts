export interface Transaction {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  description: string;
  createdAt: string | Date;
}
