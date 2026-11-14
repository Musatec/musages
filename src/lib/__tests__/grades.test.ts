import { describe, it, expect, beforeEach } from "vitest";
import { 
  getStoredStudentGrades, 
  saveStoredStudentGrades, 
  deleteStoredStudentGrades, 
  bulkUpdateClassSubjectGrades 
} from "../grades-storage";

describe("Grades Storage & Calculation", () => {
  const testStudentId = "test-student-123";

  beforeEach(() => {
    deleteStoredStudentGrades(testStudentId);
  });

  it("should save and retrieve custom student grades", () => {
    const mockRows = [
      { notesFr: { c1: 9, c2: 8, c3: 10 }, notesAr: { c1: 8, c2: 9, c3: 9 } },
      { notesFr: { c1: 35, c2: 36, c3: 38 }, notesAr: { c1: 9, c2: 9, c3: 10 } },
    ];

    const ok = saveStoredStudentGrades(testStudentId, {
      rows: mockRows,
      customAppreciation: "Excellent trimestre",
      customDecision: "Passe",
    });

    expect(ok).toBe(true);

    const stored = getStoredStudentGrades(testStudentId);
    expect(stored).not.toBeNull();
    expect(stored?.rows[0].notesFr.c1).toBe(9);
    expect(stored?.rows[0].notesFr.c3).toBe(10);
    expect(stored?.customAppreciation).toBe("Excellent trimestre");
    expect(stored?.customDecision).toBe("Passe");
  });

  it("should delete stored student grades", () => {
    saveStoredStudentGrades(testStudentId, {
      rows: [{ notesFr: { c1: 10, c2: 10, c3: 10 }, notesAr: { c1: 10, c2: 10, c3: 10 } }],
    });

    expect(getStoredStudentGrades(testStudentId)).not.toBeNull();
    deleteStoredStudentGrades(testStudentId);
    expect(getStoredStudentGrades(testStudentId)).toBeNull();
  });

  it("should update bulk grades for a class subject", () => {
    const baseRows = [
      { notesFr: { c1: 5, c2: 5, c3: 5 }, notesAr: { c1: 5, c2: 5, c3: 5 } },
    ];

    bulkUpdateClassSubjectGrades([
      {
        studentId: testStudentId,
        rowIndex: 0,
        compo: "c2",
        lang: "fr",
        value: 9.5,
        baseRows,
      },
    ]);

    const stored = getStoredStudentGrades(testStudentId);
    expect(stored).not.toBeNull();
    expect(stored?.rows[0].notesFr.c2).toBe(9.5);
  });
});
