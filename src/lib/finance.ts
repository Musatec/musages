/**
 * Calculs financiers centraux pour l'ERP MINDOS.
 * Isolé pour faciliter les tests unitaires et la maintenance des marges.
 */

export interface FinancialItem {
  quantity: number;
  price: number;
  costPrice?: number | null;
}

export interface FinancialSale {
  totalAmount: number;
  items: FinancialItem[];
}

/**
 * Calcule la performance brute d'un ensemble de ventes.
 */
export function calculateGrossPerformance(sales: FinancialSale[]) {
  let totalRevenue = 0;
  let totalCostOfGoodsSold = 0;

  sales.forEach(sale => {
    totalRevenue += sale.totalAmount;
    sale.items.forEach(item => {
      const cost = item.costPrice || 0;
      totalCostOfGoodsSold += (cost * item.quantity);
    });
  });

  const grossProfit = totalRevenue - totalCostOfGoodsSold;
  const marginPercentage = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalCostOfGoodsSold,
    grossProfit,
    marginPercentage: Math.round(marginPercentage * 100) / 100
  };
}

/**
 * Calcule le bénéfice net final après déduction des dépenses.
 */
export function calculateNetProfit(grossProfit: number, expenses: number) {
  return grossProfit - expenses;
}

/**
 * Calcule la valeur d'un stock basé sur le coût d'achat.
 */
export function calculateInventoryValue(stocks: { quantity: number; costPrice?: number | null }[]) {
  return stocks.reduce((acc, s) => {
    return acc + (s.quantity * (s.costPrice || 0));
  }, 0);
}
