// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  await prisma.balance.upsert({
    where: { id: 'main-balance' },
    update: { /* nothing */ },
    create: { id: 'main-balance', amount: 0 },
  })
  console.log('✅ Seeded balance row')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
