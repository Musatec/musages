
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

async function checkUser() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const email = "musatech0000@gmail.com";
  try {
    console.log(`Checking user: ${email}`);
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      console.log("✅ User found!");
      console.log("ID:", user.id);
      console.log("Role:", user.role);
      console.log("StoreId:", user.storeId);
      console.log("Has password:", !!user.password);
    } else {
      console.log("❌ User NOT found in database.");
    }
  } catch (err) {
    console.error("❌ DB Error:", err.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkUser();
