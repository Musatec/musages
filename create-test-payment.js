
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function create() {
    const prisma = new PrismaClient();
    const user = await prisma.user.findFirst();
    if (!user) {
        console.log("No user found");
        return;
    }
    const payment = await prisma.payment.create({
        data: {
            userId: user.id,
            amount: 7000,
            plan: 'BUSINESS',
            status: 'PENDING',
            provider: 'PAYTECH'
        }
    });
    console.log('Created pending payment: ' + payment.id + ' for ' + user.email);
    await prisma.$disconnect();
}
create();
