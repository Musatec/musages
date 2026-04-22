import { describe, it, expect } from 'vitest'
import { formatMoney, cn } from '../utils'

describe('Utils Functions', () => {
  describe('formatMoney', () => {
    it('should format numbers correctly in French style', () => {
      expect(formatMoney(1000)).toBe('1\u202f000') // Narrow non-breaking space
      expect(formatMoney(1234567.89)).toBe('1\u202f234\u202f567,89')
    })

    it('should handle zero and nullish values', () => {
      expect(formatMoney(0)).toBe('0')
      // @ts-ignore
      expect(formatMoney(null)).toBe('0')
    })
  })

  describe('cn', () => {
    it('should merge tailwind classes correctly', () => {
      expect(cn('p-4', 'bg-red-500')).toBe('p-4 bg-red-500')
      expect(cn('p-4 p-8')).toBe('p-8') // tailwind-merge in action
    })
  })
})
