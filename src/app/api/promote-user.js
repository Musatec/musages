
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

async function promote() {
    const pool = new Pool({ 
        connectionString,
        connectionTimeoutMillis: 30000,
        idleTimeoutMillis: 30000
    });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        console.log("Attempting to promote user with longer timeout...");
        const user = await prisma.user.update({
            where: { email: 'musatech0000@gmail.com' },
            data: { role: 'SUPER_ADMIN' }
        });
        console.log("User promoted to SUPER_ADMIN:", user.email);
    } catch (e) {
        console.error("PROMOTION ERROR:", e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

promote();
