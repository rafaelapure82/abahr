import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ABA Talent Management database...');

  // ── Super Admin ──────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin@123!', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@abatalent.com' },
    update: {},
    create: {
      email: 'admin@abatalent.com',
      passwordHash,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  // ── Departments ──────────────────────────────────────────────────────────
  const hrDept = await prisma.department.upsert({
    where: { code: 'HR' },
    update: {},
    create: { name: 'Human Resources', code: 'HR', description: 'People & Culture' },
  });

  const techDept = await prisma.department.upsert({
    where: { code: 'TECH' },
    update: {},
    create: { name: 'Technology', code: 'TECH', description: 'Engineering & Product' },
  });

  const financeDept = await prisma.department.upsert({
    where: { code: 'FIN' },
    update: {},
    create: { name: 'Finance', code: 'FIN', description: 'Finance & Accounting' },
  });

  // ── Positions ────────────────────────────────────────────────────────────
  const hrManagerPos = await prisma.position.upsert({
    where: { code: 'HR-MGR' },
    update: {},
    create: {
      title: 'HR Manager',
      code: 'HR-MGR',
      departmentId: hrDept.id,
      minSalary: 60000,
      maxSalary: 90000,
    },
  });

  // ── Admin Employee ────────────────────────────────────────────────────────
  await prisma.employee.upsert({
    where: { employeeCode: 'EMP-0001' },
    update: {},
    create: {
      employeeCode: 'EMP-0001',
      userId: superAdmin.id,
      firstName: 'ABA',
      lastName: 'Admin',
      jobTitle: 'HR Director',
      departmentId: hrDept.id,
      positionId: hrManagerPos.id,
      employmentType: 'FULL_TIME',
      employmentStatus: 'ACTIVE',
      baseSalary: 95000,
    },
  });

  // ── Sample Benefits ──────────────────────────────────────────────────────
  const benefits = [
    { name: 'Health Insurance', type: 'health', description: 'Comprehensive medical coverage' },
    { name: 'Dental Plan', type: 'dental', description: 'Full dental coverage' },
    { name: '401(k) Match', type: '401k', description: '50% match up to 6% of salary' },
    { name: 'Life Insurance', type: 'life', description: '2x annual salary coverage' },
    { name: 'Remote Work Stipend', type: 'stipend', description: '$100/month for home office' },
  ];

  for (const b of benefits) {
    await prisma.benefit.upsert({
      where: { id: b.name },
      update: {},
      create: b,
    }).catch(() => prisma.benefit.create({ data: b }));
  }

  console.log('✅ Seed completed successfully!');
  console.log('📧 Admin login: admin@abatalent.com / Admin@123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
