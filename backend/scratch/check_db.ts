import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const departmentCount = await prisma.department.count();
  const employeeCount = await prisma.employee.count();
  
  console.log(`Departments: ${departmentCount}`);
  console.log(`Employees: ${employeeCount}`);
  
  if (departmentCount > 0) {
    const departments = await prisma.department.findMany({ take: 5 });
    console.log('Sample Departments:', departments.map(d => d.name));
  }
  
  if (employeeCount > 0) {
    const employees = await prisma.employee.findMany({ take: 5, include: { user: true } });
    console.log('Sample Employees:', employees.map(e => `${e.firstName} ${e.lastName} (${e.user.email})`));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
