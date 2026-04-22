import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const employees = await prisma.employee.count();
  const payrolls = await prisma.payroll.count();
  
  console.log({ users, employees, payrolls });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
