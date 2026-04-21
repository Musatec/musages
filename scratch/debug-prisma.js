const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    const sales = await prisma.sale.findMany({
      take: 1
    })
    console.log('Success:', sales)
  } catch (e) {
    console.error('Error Code:', e.code)
    console.error('Error Message:', e.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
