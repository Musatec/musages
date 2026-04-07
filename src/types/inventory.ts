export interface Product {
  id: string;
  name: string;
  price: number;
  costPrice?: number | null;
  category?: string | null;
  image?: string | null;
  stock: number;
  minStock?: number | null;
  sku?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryMetrics {
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface InventoryManagerProps {
  initialProducts: Product[];
}

export interface ProductFormData {
  name: string;
  price: string;
  costPrice: string;
  stock: string;
  minStock: string;
  category: string;
  sku: string;
  image: string;
}
