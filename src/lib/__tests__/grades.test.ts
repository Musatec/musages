import { describe, it, expect, beforeEach } from "vitest";
import { 
  getStoredStudentGrades, 
  saveStoredStudentGrades, 
  deleteStoredStudentGrades, 
  bulkUpdateClassSubjectGrades,
  getClassConfig,
  saveClassConfig,
  saveTrimesterSheetData,
  clearTrimesterGradesForClass
} from "../grades-storage";

describe("Grades Storage & GEC System", () => {
  const testStudentId = "test-student-123";
  const testClassId = "test-class-cm2";

  beforeEach(() => {
    deleteStoredStudentGrades(testStudentId);
  });

  it("should save and retrieve custom student grades and presence", () => {
    const mockRows = [
      { notesFr: { c1: 9, c2: 8, c3: 10 }, notesAr: { c1: 8, c2: 9, c3: 9 } },
      { notesFr: { c1: 35, c2: 36, c3: 38 }, notesAr: { c1: 9, c2: 9, c3: 10 } },
    ];

    const ok = saveStoredStudentGrades(testStudentId, {
      rows: mockRows,
      presence: { c1: "P", c2: "A", c3: "P" },
      customAppreciation: "Excellent trimestre",
      customDecision: "Passe",
    });

    expect(ok).toBe(true);

    const stored = getStoredStudentGrades(testStudentId);
    expect(stored).not.toBeNull();
    expect(stored?.rows[0].notesFr.c1).toBe(9);
    expect(stored?.rows[0].notesFr.c3).toBe(10);
    expect(stored?.presence?.c2).toBe("A");
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

  it("should save and retrieve GEC class personalization and ponderations", () => {
    const updated = saveClassConfig(testClassId, {
      schoolYear: "2025-2026",
      ia: "SANGALKAM",
      ief: "SANGALKAM",
      schoolName: "PATHE POGNE",
      directorName: "OUMAR POGNE",
      teacherFrName: "SANE/KONE",
      passingThreshold: 5.5,
    });

    expect(updated.ia).toBe("SANGALKAM");
    expect(updated.passingThreshold).toBe(5.5);

    const loaded = getClassConfig(testClassId);
    expect(loaded.directorName).toBe("OUMAR POGNE");
    expect(loaded.teacherFrName).toBe("SANE/KONE");
    expect(loaded.ponderations.length).toBe(11);
  });

  it("should save trimester sheet data with presence P/A and clear notes", () => {
    const ok = saveTrimesterSheetData("c1", [
      {
        studentId: testStudentId,
        presence: "A",
        notesFr: [8, 32, 16, 30, 15, 20, 12, 18, 14, 7, 8],
        notesAr: [9, 8, 8, 9, 0, 9, 8, 9, 8, 0, 0],
      }
    ]);
    expect(ok).toBe(true);

    const stored = getStoredStudentGrades(testStudentId);
    expect(stored?.presence?.c1).toBe("A");
    expect(stored?.rows[1].notesFr.c1).toBe(32);

    clearTrimesterGradesForClass([testStudentId], "c1");
    const afterClear = getStoredStudentGrades(testStudentId);
    expect(afterClear?.rows[1].notesFr.c1).toBe(0);
    expect(afterClear?.rows[0].notesAr.c1).toBe(0);
  });
});
