import { describe, it, expect } from 'vitest';

/**
 * Fonctions utilitaires de calcul pour le domaine métier du Daara Ibnoul Khayim Al Diawziya
 */
export function calculateHifzProgress(hizbCount: number): { percentage: number; isKhatm: boolean; currentJuz: number } {
  if (hizbCount <= 0) return { percentage: 0, isKhatm: false, currentJuz: 1 };
  const safeHizb = Math.min(Math.max(hizbCount, 0), 60);
  const percentage = Number(((safeHizb / 60) * 100).toFixed(2));
  const isKhatm = safeHizb === 60;
  const currentJuz = Math.ceil(safeHizb / 2) || 1;
  return { percentage, isKhatm, currentJuz };
}

export function generateMatricule(sequence: number, year: number = 2026): string {
  const padded = String(sequence).padStart(4, '0');
  return `DAA-${year}-${padded}`;
}

export function calculateSponsorshipCoverage(monthlyFeeFCFA: number, totalDonationsFCFA: number): { percentCovered: number; remainingFCFA: number } {
  if (monthlyFeeFCFA <= 0) return { percentCovered: 100, remainingFCFA: 0 };
  const percentCovered = Math.min(Number(((totalDonationsFCFA / monthlyFeeFCFA) * 100).toFixed(1)), 100);
  const remainingFCFA = Math.max(monthlyFeeFCFA - totalDonationsFCFA, 0);
  return { percentCovered, remainingFCFA };
}

describe('Daara Ibnoul Khayim Al Diawziya - Business Rules', () => {

  describe('calculateHifzProgress', () => {
    it('should return 0% for 0 hizbs memorized', () => {
      const res = calculateHifzProgress(0);
      expect(res.percentage).toBe(0);
      expect(res.isKhatm).toBe(false);
      expect(res.currentJuz).toBe(1);
    });

    it('should calculate correct Juz and percentage for 30 hizbs (15 Juz)', () => {
      const res = calculateHifzProgress(30);
      expect(res.percentage).toBe(50);
      expect(res.isKhatm).toBe(false);
      expect(res.currentJuz).toBe(15);
    });

    it('should validate full Khatm for 60 hizbs (100%)', () => {
      const res = calculateHifzProgress(60);
      expect(res.percentage).toBe(100);
      expect(res.isKhatm).toBe(true);
      expect(res.currentJuz).toBe(30);
    });

    it('should clamp values above 60 hizbs', () => {
      const res = calculateHifzProgress(70);
      expect(res.percentage).toBe(100);
      expect(res.isKhatm).toBe(true);
    });
  });

  describe('generateMatricule', () => {
    it('should format student matricules according to Daara standards', () => {
      expect(generateMatricule(1, 2026)).toBe('DAA-2026-0001');
      expect(generateMatricule(42, 2026)).toBe('DAA-2026-0042');
      expect(generateMatricule(1250, 2026)).toBe('DAA-2026-1250');
    });
  });

  describe('calculateSponsorshipCoverage', () => {
    it('should calculate parrainage coverage in FCFA', () => {
      const res = calculateSponsorshipCoverage(25000, 15000);
      expect(res.percentCovered).toBe(60.0);
      expect(res.remainingFCFA).toBe(10000);
    });

    it('should return 100% when fully sponsored', () => {
      const res = calculateSponsorshipCoverage(25000, 30000);
      expect(res.percentCovered).toBe(100);
      expect(res.remainingFCFA).toBe(0);
    });
  });
});
