import { describe, it, expect } from 'vitest'
import { calculateGrossPerformance, calculateNetProfit, calculateInventoryValue } from '../finance'

describe('Finance Business Logic', () => {
  
  describe('calculateGrossPerformance', () => {
    it('should calculate revenue and gross profit correctly for multiple sales', () => {
      const sales = [
        {
          totalAmount: 1000,
          items: [
            { quantity: 2, price: 500, costPrice: 300 } // Cost: 600
          ]
        },
        {
          totalAmount: 2000,
          items: [
            { quantity: 1, price: 2000, costPrice: 1500 } // Cost: 1500
          ]
        }
      ]

      const result = calculateGrossPerformance(sales)
      
      expect(result.totalRevenue).toBe(3000)
      expect(result.totalCostOfGoodsSold).toBe(2100)
      expect(result.grossProfit).toBe(900)
      expect(result.marginPercentage).toBe(30) // (900/3000) * 100
    })

    it('should handle items with missing cost price (treat as 0 cost)', () => {
      const sales = [
        {
          totalAmount: 1000,
          items: [
            { quantity: 2, price: 500, costPrice: null }
          ]
        }
      ]

      const result = calculateGrossPerformance(sales)
      expect(result.grossProfit).toBe(1000)
      expect(result.marginPercentage).toBe(100)
    })

    it('should handle zero sales gracefully', () => {
      const result = calculateGrossPerformance([])
      expect(result.totalRevenue).toBe(0)
      expect(result.grossProfit).toBe(0)
      expect(result.marginPercentage).toBe(0)
    })

    it('should handle partial quantities and complex margins', () => {
        const sales = [
            {
              totalAmount: 157.5,
              items: [
                { quantity: 3, price: 52.5, costPrice: 40.2 } // Cost: 120.6
              ]
            }
          ]
    
          const result = calculateGrossPerformance(sales)
          expect(result.totalRevenue).toBe(157.5)
          expect(result.grossProfit).toBeCloseTo(36.9)
          expect(result.marginPercentage).toBeCloseTo(23.43)
    })
  })

  describe('calculateNetProfit', () => {
    it('should deduct expenses from gross profit', () => {
      expect(calculateNetProfit(1000, 400)).toBe(600)
      expect(calculateNetProfit(500, 600)).toBe(-100) // Negative profit (loss)
    })
  })

  describe('calculateInventoryValue', () => {
    it('should sum up value of all stock items', () => {
      const stocks = [
        { quantity: 10, costPrice: 100 },
        { quantity: 5, costPrice: 200 },
        { quantity: 0, costPrice: 500 }
      ]
      expect(calculateInventoryValue(stocks)).toBe(2000)
    })

    it('should handle missing cost prices', () => {
      const stocks = [
        { quantity: 10, costPrice: null }
      ]
      expect(calculateInventoryValue(stocks)).toBe(0)
    })
  })
})
