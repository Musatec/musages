
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

async function test() {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        console.log("Testing Prisma connection with Adapter...");
        const store = await prisma.store.findFirst();
        console.log("Store found:", store?.id);
        
        if (store) {
            console.log("Testing employee count...");
            const employees = await prisma.employee.count({ where: { storeId: store.id, deletedAt: null } });
            console.log("Employees count:", employees);
        }
    } catch (e) {
        console.error("PRISMA TEST ERROR:", e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

test();
