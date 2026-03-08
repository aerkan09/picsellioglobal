const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  await prisma.plan.upsert({
    where: { slug: '10_DAY' },
    create: { name: '10 Günlük İlan', slug: '10_DAY', days: 10, priceCents: 10000 },
    update: { name: '10 Günlük İlan', days: 10, priceCents: 10000 },
  })
  await prisma.plan.upsert({
    where: { slug: '30_DAY' },
    create: { name: '30 Günlük İlan', slug: '30_DAY', days: 30, priceCents: 25000 },
    update: { name: '30 Günlük İlan', days: 30, priceCents: 25000 },
  })
  console.log('Plans seeded.')

  const adminEmail = process.env.ADMIN_EMAIL || process.env.ADMIN_USERNAME
  const adminPassword = process.env.ADMIN_PASSWORD
  if (adminEmail && adminPassword) {
    const hash = await bcrypt.hash(adminPassword, 12)
    await prisma.user.upsert({
      where: { email: adminEmail },
      create: { email: adminEmail, passwordHash: hash, name: 'Admin', role: 'ADMIN' },
      update: { passwordHash: hash, role: 'ADMIN' },
    })
    console.log('Admin user created/updated:', adminEmail)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
