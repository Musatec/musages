import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const userCount = await prisma.user.count()
    console.log('User count:', userCount)
    process.exit(0)
  } catch (error) {
    console.error('Connection error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
