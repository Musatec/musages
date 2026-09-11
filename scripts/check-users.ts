import { prisma } from "../src/lib/prisma";

async function main() {
    try {
        const users = await prisma.user.findMany();
        console.log("USERS IN DATABASE:", users.map(u => ({ id: u.id, email: u.email, role: u.role, name: u.name, hasPassword: !!u.password })));
    } catch (err) {
        console.error("Error querying users:", err);
    }
}

main().finally(() => prisma.$disconnect());
