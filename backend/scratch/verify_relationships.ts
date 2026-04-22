import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const employees = await prisma.employee.findMany({
    include: {
      user: true,
      department: true,
      manager: true
    }
  });
  
  console.log('--- Lista de Empleados en DB ---');
  employees.forEach(e => {
    console.log(`ID: ${e.id} | Nombre: ${e.firstName} ${e.lastName} | Dept: ${e.department?.name || 'NINGUNO'} | Manager: ${e.manager?.firstName || 'NINGUNO'}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
