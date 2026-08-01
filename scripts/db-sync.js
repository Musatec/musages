const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

async function sync() {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("🚀 Exécution de la migration SQL automatique pour TaleemApp...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "School" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "address" TEXT,
        "phone" TEXT,
        "email" TEXT,
        "logo" TEXT,
        "ninea" TEXT,
        "plan" TEXT DEFAULT 'STARTER',
        "config" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" TIMESTAMP(3),
        "ownerId" TEXT
      );

      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "schoolId" TEXT;
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'DIRECTEUR';

      CREATE TABLE IF NOT EXISTS "Class" (
        "id" TEXT PRIMARY KEY,
        "schoolId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "level" TEXT,
        "monthlyFee" DOUBLE PRECISION DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Subject" (
        "id" TEXT PRIMARY KEY,
        "schoolId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "coefficient" INT DEFAULT 1,
        "code" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Student" (
        "id" TEXT PRIMARY KEY,
        "schoolId" TEXT NOT NULL,
        "classId" TEXT NOT NULL,
        "matricule" TEXT NOT NULL,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        "gender" TEXT,
        "dateOfBirth" TIMESTAMP(3),
        "photo" TEXT,
        "parentName" TEXT NOT NULL,
        "parentPhone" TEXT NOT NULL,
        "parentEmail" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" TIMESTAMP(3)
      );

      CREATE TABLE IF NOT EXISTS "TuitionFee" (
        "id" TEXT PRIMARY KEY,
        "schoolId" TEXT NOT NULL,
        "studentId" TEXT NOT NULL,
        "month" INT NOT NULL,
        "year" INT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "amountPaid" DOUBLE PRECISION DEFAULT 0,
        "status" TEXT DEFAULT 'PENDING',
        "dueDate" TIMESTAMP(3) NOT NULL,
        "paidAt" TIMESTAMP(3),
        "paymentMethod" TEXT,
        "receiptNumber" TEXT,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Grade" (
        "id" TEXT PRIMARY KEY,
        "schoolId" TEXT NOT NULL,
        "studentId" TEXT NOT NULL,
        "subjectId" TEXT NOT NULL,
        "term" TEXT DEFAULT 'TRIMESTRE_1',
        "title" TEXT NOT NULL,
        "gradeValue" DOUBLE PRECISION NOT NULL,
        "maxGrade" DOUBLE PRECISION DEFAULT 20,
        "coefficient" INT DEFAULT 1,
        "comments" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Attendance" (
        "id" TEXT PRIMARY KEY,
        "schoolId" TEXT NOT NULL,
        "studentId" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "status" TEXT DEFAULT 'PRESENT',
        "arrivalTime" TEXT,
        "reason" TEXT,
        "parentNotified" BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Teacher" (
        "id" TEXT PRIMARY KEY,
        "schoolId" TEXT NOT NULL,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        "email" TEXT,
        "phone" TEXT NOT NULL,
        "mainSubject" TEXT,
        "hourlyRate" DOUBLE PRECISION DEFAULT 0,
        "contractType" TEXT DEFAULT 'VACATAIRE',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deletedAt" TIMESTAMP(3)
      );
    `);

    console.log("✅ Tables TaleemApp créées et vérifiées avec succès !");
  } catch (err) {
    console.error("❌ Erreur SQL:", err.message);
  } finally {
    await pool.end();
  }
}

sync();
