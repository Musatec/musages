import fs from "fs";
import path from "path";

const GRADES_FILE = path.join(process.cwd(), "prisma", "grades_store.json");

interface StoredStudentData {
  rows: Array<{
    notesFr: { c1: number; c2: number; c3: number };
    notesAr: { c1: number; c2: number; c3: number };
  }>;
  customAppreciation?: string;
  customAppreciationAr?: string;
  customDecision?: "Passe" | "Redouble";
  updatedAt: string;
}

type GradesStore = Record<string, StoredStudentData>;

function readStore(): GradesStore {
  try {
    if (!fs.existsSync(GRADES_FILE)) {
      fs.writeFileSync(GRADES_FILE, JSON.stringify({}, null, 2), "utf8");
      return {};
    }
    const raw = fs.readFileSync(GRADES_FILE, "utf8");
    return JSON.parse(raw || "{}");
  } catch (err) {
    console.error("[GRADES_STORAGE_READ_ERROR]", err);
    return {};
  }
}

function writeStore(data: GradesStore): boolean {
  try {
    const dir = path.dirname(GRADES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(GRADES_FILE, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("[GRADES_STORAGE_WRITE_ERROR]", err);
    return false;
  }
}

export function getStoredStudentGrades(studentId: string): StoredStudentData | null {
  const store = readStore();
  return store[studentId] || null;
}

export function saveStoredStudentGrades(
  studentId: string,
  data: {
    rows: Array<{
      notesFr: { c1: number; c2: number; c3: number };
      notesAr: { c1: number; c2: number; c3: number };
    }>;
    customAppreciation?: string;
    customAppreciationAr?: string;
    customDecision?: "Passe" | "Redouble";
  }
): boolean {
  const store = readStore();
  store[studentId] = {
    rows: data.rows.map(r => ({
      notesFr: {
        c1: Number(r.notesFr?.c1) || 0,
        c2: Number(r.notesFr?.c2) || 0,
        c3: Number(r.notesFr?.c3) || 0,
      },
      notesAr: {
        c1: Number(r.notesAr?.c1) || 0,
        c2: Number(r.notesAr?.c2) || 0,
        c3: Number(r.notesAr?.c3) || 0,
      },
    })),
    customAppreciation: data.customAppreciation,
    customAppreciationAr: data.customAppreciationAr,
    customDecision: data.customDecision,
    updatedAt: new Date().toISOString(),
  };
  return writeStore(store);
}

export function deleteStoredStudentGrades(studentId: string): boolean {
  const store = readStore();
  if (store[studentId]) {
    delete store[studentId];
    return writeStore(store);
  }
  return true;
}

export function bulkUpdateClassSubjectGrades(
  updates: Array<{
    studentId: string;
    rowIndex: number;
    compo: "c1" | "c2" | "c3";
    lang: "fr" | "ar";
    value: number;
    baseRows?: any[];
  }>
): boolean {
  const store = readStore();
  for (const item of updates) {
    let current = store[item.studentId];
    if (!current && item.baseRows) {
      current = {
        rows: item.baseRows.map(r => ({
          notesFr: { ...r.notesFr },
          notesAr: { ...r.notesAr },
        })),
        updatedAt: new Date().toISOString(),
      };
      store[item.studentId] = current;
    }
    if (current && current.rows[item.rowIndex]) {
      if (item.lang === "fr") {
        current.rows[item.rowIndex].notesFr[item.compo] = item.value;
      } else {
        current.rows[item.rowIndex].notesAr[item.compo] = item.value;
      }
      current.updatedAt = new Date().toISOString();
    }
  }
  return writeStore(store);
}
