import fs from "fs";
import path from "path";

const GRADES_FILE = path.join(process.cwd(), "prisma", "grades_store.json");

export interface StoredStudentData {
  rows: Array<{
    notesFr: { c1: number; c2: number; c3: number };
    notesAr: { c1: number; c2: number; c3: number };
  }>;
  presence?: {
    c1: "P" | "A";
    c2: "P" | "A";
    c3: "P" | "A";
  };
  customAppreciation?: string;
  customAppreciationAr?: string;
  customDecision?: "Passe" | "Redouble";
  updatedAt: string;
}

export interface ClassPonderationRow {
  maxFr: { c1: number; c2: number; c3: number };
  maxAr: { c1: number; c2: number; c3: number };
}

export interface ClassConfigData {
  schoolYear: string;
  ia: string;
  ief: string;
  schoolName: string;
  directorName: string;
  directorCivility: "Monsieur" | "Madame";
  teacherFrName: string;
  teacherFrCivility: "Monsieur" | "Madame";
  teacherArName: string;
  passingThreshold: number;
  ponderations: ClassPonderationRow[];
  updatedAt: string;
}

interface FullStoreSchema {
  students?: Record<string, StoredStudentData>;
  classConfigs?: Record<string, ClassConfigData>;
  // Legacy top-level studentId keys remain supported
  [key: string]: any;
}

export const DEFAULT_PONDERATIONS: ClassPonderationRow[] = [
  { maxFr: { c1: 10, c2: 10, c3: 10 }, maxAr: { c1: 10, c2: 10, c3: 10 } }, // 0: Lecture | Ar LC Ressources 1
  { maxFr: { c1: 40, c2: 40, c3: 40 }, maxAr: { c1: 10, c2: 10, c3: 10 } }, // 1: LC Ressources | Ar LC Ressources 2
  { maxFr: { c1: 20, c2: 20, c3: 20 }, maxAr: { c1: 10, c2: 10, c3: 10 } }, // 2: LC Compétence | Ar LC Compétence 1
  { maxFr: { c1: 40, c2: 40, c3: 40 }, maxAr: { c1: 10, c2: 10, c3: 10 } }, // 3: Math Ressources | Ar LC Compétence 2
  { maxFr: { c1: 20, c2: 20, c3: 20 }, maxAr: { c1: 0, c2: 0, c3: 0 } },    // 4: Math Compétence | -
  { maxFr: { c1: 24, c2: 24, c3: 24 }, maxAr: { c1: 10, c2: 10, c3: 10 } }, // 5: DM Ressources | Ar Ed.Rel Ressources 1
  { maxFr: { c1: 16, c2: 16, c3: 16 }, maxAr: { c1: 10, c2: 10, c3: 10 } }, // 6: DM Compétence | Ar Ed.Rel Ressources 2
  { maxFr: { c1: 24, c2: 24, c3: 24 }, maxAr: { c1: 10, c2: 10, c3: 10 } }, // 7: DD Ressources | Ar Ed.Rel Compétence 1
  { maxFr: { c1: 16, c2: 16, c3: 16 }, maxAr: { c1: 10, c2: 10, c3: 10 } }, // 8: DD Compétence | Ar Ed.Rel Compétence 2
  { maxFr: { c1: 10, c2: 10, c3: 10 }, maxAr: { c1: 0, c2: 0, c3: 0 } },    // 9: Arts Plastiques | -
  { maxFr: { c1: 10, c2: 10, c3: 10 }, maxAr: { c1: 0, c2: 0, c3: 0 } },    // 10: Edu. Musicale | -
];

export function getDefaultClassConfig(): ClassConfigData {
  return {
    schoolYear: "2025-2026",
    ia: "SANGALKAM",
    ief: "SANGALKAM",
    schoolName: "PATHE POGNE",
    directorName: "OUMAR POGNE",
    directorCivility: "Monsieur",
    teacherFrName: "SANE/KONE",
    teacherFrCivility: "Monsieur",
    teacherArName: "الأستاذ جوب",
    passingThreshold: 5.0,
    ponderations: DEFAULT_PONDERATIONS.map(p => ({
      maxFr: { ...p.maxFr },
      maxAr: { ...p.maxAr },
    })),
    updatedAt: new Date().toISOString(),
  };
}

function readStore(): FullStoreSchema {
  try {
    if (!fs.existsSync(GRADES_FILE)) {
      fs.writeFileSync(GRADES_FILE, JSON.stringify({ students: {}, classConfigs: {} }, null, 2), "utf8");
      return { students: {}, classConfigs: {} };
    }
    const raw = fs.readFileSync(GRADES_FILE, "utf8");
    const parsed = JSON.parse(raw || "{}");
    if (!parsed.students) parsed.students = {};
    if (!parsed.classConfigs) parsed.classConfigs = {};
    return parsed;
  } catch (err) {
    console.error("[GRADES_STORAGE_READ_ERROR]", err);
    return { students: {}, classConfigs: {} };
  }
}

function writeStore(data: FullStoreSchema): boolean {
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
  return store.students?.[studentId] || store[studentId] || null;
}

export function saveStoredStudentGrades(
  studentId: string,
  data: {
    rows: Array<{
      notesFr: { c1: number; c2: number; c3: number };
      notesAr: { c1: number; c2: number; c3: number };
    }>;
    presence?: {
      c1: "P" | "A";
      c2: "P" | "A";
      c3: "P" | "A";
    };
    customAppreciation?: string;
    customAppreciationAr?: string;
    customDecision?: "Passe" | "Redouble";
  }
): boolean {
  const store = readStore();
  if (!store.students) store.students = {};
  const existing = store.students[studentId] || store[studentId];

  const record: StoredStudentData = {
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
    presence: data.presence || existing?.presence || { c1: "P", c2: "P", c3: "P" },
    customAppreciation: data.customAppreciation ?? existing?.customAppreciation,
    customAppreciationAr: data.customAppreciationAr ?? existing?.customAppreciationAr,
    customDecision: data.customDecision ?? existing?.customDecision,
    updatedAt: new Date().toISOString(),
  };

  store.students[studentId] = record;
  // Also keep top-level compatibility if legacy key existed
  if (store[studentId]) {
    store[studentId] = record;
  }
  return writeStore(store);
}

export function deleteStoredStudentGrades(studentId: string): boolean {
  const store = readStore();
  let changed = false;
  if (store.students?.[studentId]) {
    delete store.students[studentId];
    changed = true;
  }
  if (store[studentId]) {
    delete store[studentId];
    changed = true;
  }
  return changed ? writeStore(store) : true;
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
  if (!store.students) store.students = {};

  for (const item of updates) {
    let current = store.students[item.studentId] || store[item.studentId];
    if (!current) {
      const defaultRows = item.baseRows
        ? item.baseRows.map(r => ({
            notesFr: { ...r.notesFr },
            notesAr: { ...r.notesAr },
          }))
        : Array.from({ length: 11 }, () => ({
            notesFr: { c1: 0, c2: 0, c3: 0 },
            notesAr: { c1: 0, c2: 0, c3: 0 },
          }));
      current = {
        rows: defaultRows,
        presence: { c1: "P", c2: "P", c3: "P" },
        updatedAt: new Date().toISOString(),
      };
      store.students[item.studentId] = current;
    }
    if (current && current.rows[item.rowIndex]) {
      if (item.lang === "fr") {
        current.rows[item.rowIndex].notesFr[item.compo] = item.value;
      } else {
        current.rows[item.rowIndex].notesAr[item.compo] = item.value;
      }
      current.updatedAt = new Date().toISOString();
      store.students[item.studentId] = current;
    }
  }
  return writeStore(store);
}

export function saveTrimesterSheetData(
  compo: "c1" | "c2" | "c3",
  entries: Array<{
    studentId: string;
    presence: "P" | "A";
    notesFr: number[]; // length 11
    notesAr: number[]; // length 11
    baseRows?: any[];
  }>
): boolean {
  const store = readStore();
  if (!store.students) store.students = {};

  for (const entry of entries) {
    let current = store.students[entry.studentId] || store[entry.studentId];
    if (!current) {
      const defaultRows = entry.baseRows
        ? entry.baseRows.map(r => ({
            notesFr: { ...r.notesFr },
            notesAr: { ...r.notesAr },
          }))
        : Array.from({ length: 11 }, () => ({
            notesFr: { c1: 0, c2: 0, c3: 0 },
            notesAr: { c1: 0, c2: 0, c3: 0 },
          }));
      current = {
        rows: defaultRows,
        presence: { c1: "P", c2: "P", c3: "P" },
        updatedAt: new Date().toISOString(),
      };
    }

    if (!current.presence) {
      current.presence = { c1: "P", c2: "P", c3: "P" };
    }
    current.presence[compo] = entry.presence;

    for (let rIdx = 0; rIdx < 11; rIdx++) {
      if (!current.rows[rIdx]) {
        current.rows[rIdx] = { notesFr: { c1: 0, c2: 0, c3: 0 }, notesAr: { c1: 0, c2: 0, c3: 0 } };
      }
      if (entry.notesFr[rIdx] !== undefined) {
        current.rows[rIdx].notesFr[compo] = Number(entry.notesFr[rIdx]) || 0;
      }
      if (entry.notesAr[rIdx] !== undefined) {
        current.rows[rIdx].notesAr[compo] = Number(entry.notesAr[rIdx]) || 0;
      }
    }

    current.updatedAt = new Date().toISOString();
    store.students[entry.studentId] = current;
  }

  return writeStore(store);
}

export function clearTrimesterGradesForClass(
  studentIds: string[],
  compo: "c1" | "c2" | "c3",
  baseRowsMap?: Record<string, any[]>
): boolean {
  const store = readStore();
  if (!store.students) store.students = {};

  for (const sid of studentIds) {
    let current = store.students[sid] || store[sid];
    if (!current) {
      const base = baseRowsMap?.[sid];
      current = {
        rows: base
          ? base.map(r => ({ notesFr: { ...r.notesFr }, notesAr: { ...r.notesAr } }))
          : Array.from({ length: 11 }, () => ({
              notesFr: { c1: 0, c2: 0, c3: 0 },
              notesAr: { c1: 0, c2: 0, c3: 0 },
            })),
        presence: { c1: "P", c2: "P", c3: "P" },
        updatedAt: new Date().toISOString(),
      };
    }
    for (let rIdx = 0; rIdx < current.rows.length; rIdx++) {
      current.rows[rIdx].notesFr[compo] = 0;
      current.rows[rIdx].notesAr[compo] = 0;
    }
    current.updatedAt = new Date().toISOString();
    store.students[sid] = current;
  }

  return writeStore(store);
}

export function getClassConfig(classId: string): ClassConfigData {
  const store = readStore();
  const saved = store.classConfigs?.[classId];
  if (!saved) return getDefaultClassConfig();
  return {
    ...getDefaultClassConfig(),
    ...saved,
    ponderations:
      saved.ponderations && saved.ponderations.length === 11
        ? saved.ponderations
        : DEFAULT_PONDERATIONS.map(p => ({ maxFr: { ...p.maxFr }, maxAr: { ...p.maxAr } })),
  };
}

export function saveClassConfig(classId: string, config: Partial<ClassConfigData>): ClassConfigData {
  const store = readStore();
  if (!store.classConfigs) store.classConfigs = {};
  const existing = getClassConfig(classId);
  const updated: ClassConfigData = {
    ...existing,
    ...config,
    updatedAt: new Date().toISOString(),
  };
  store.classConfigs[classId] = updated;
  writeStore(store);
  return updated;
}
