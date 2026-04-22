import { prisma } from '../src/lib/prisma'

async function main() {
  try {
    console.log('Adding column hasSeenOnboarding to User table...')
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "hasSeenOnboarding" BOOLEAN DEFAULT false;`)
    console.log('Column added successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error adding column:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
