import fs from "fs";
import path from "path";

const SALARIES_FILE = path.join(process.cwd(), "prisma", "salaries_store.json");

export interface MonthlySalaryRow {
  teacherId: string;
  teacherName: string;
  classe: string;
  th: number; // Total Heures
  ch: number; // Coût Horaire
  status: "payé" | "non payé";
  transactionId?: string | null;
  updatedAt: string;
}

type SalariesStore = Record<string, MonthlySalaryRow[]>; // key: `${daaraId}:${space}:${monthKey}`

function readStore(): SalariesStore {
  try {
    if (!fs.existsSync(SALARIES_FILE)) {
      fs.writeFileSync(SALARIES_FILE, JSON.stringify({}, null, 2), "utf8");
      return {};
    }
    const raw = fs.readFileSync(SALARIES_FILE, "utf8");
    return JSON.parse(raw || "{}");
  } catch (err) {
    console.error("[SALARIES_STORAGE_READ_ERROR]", err);
    return {};
  }
}

function writeStore(data: SalariesStore): boolean {
  try {
    const dir = path.dirname(SALARIES_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SALARIES_FILE, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("[SALARIES_STORAGE_WRITE_ERROR]", err);
    return false;
  }
}

export function getMonthlySalarySheet(
  daaraId: string,
  space: string,
  monthKey: string
): MonthlySalaryRow[] {
  const store = readStore();
  return store[`${daaraId}:${space}:${monthKey}`] || [];
}

export function saveMonthlySalarySheet(
  daaraId: string,
  space: string,
  monthKey: string,
  rows: MonthlySalaryRow[]
): boolean {
  const store = readStore();
  store[`${daaraId}:${space}:${monthKey}`] = rows.map((r) => ({
    ...r,
    th: Math.max(0, Number(r.th) || 0),
    ch: Math.max(0, Number(r.ch) || 0),
    status: r.status === "payé" ? "payé" : "non payé",
    updatedAt: new Date().toISOString(),
  }));
  return writeStore(store);
}
