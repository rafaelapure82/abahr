import { PrismaClient, Gender, EmploymentType, EmploymentStatus, PayrollFrequency } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Creando departamento y empleado de prueba...');

  // 1. Crear Departamento de Pruebas
  const testDept = await prisma.department.upsert({
    where: { code: 'PRUEBAS' },
    update: {},
    create: {
      name: 'Departamento de Pruebas',
      code: 'PRUEBAS',
      description: 'Departamento para pruebas del sistema',
      color: '#FF5733',
    },
  });
  console.log(`✅ Departamento creado: ${testDept.name}`);

  // 2. Crear Usuario
  const email = 'juan.perez@abatalent.com';
  const passwordHash = await bcrypt.hash('Abatalent@123', 12);
  
  // Buscar rol de empleado
  const role = await prisma.role.findUnique({ where: { name: 'EMPLOYEE' } });
  if (!role) throw new Error('Rol EMPLOYEE no encontrado');

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      isActive: true,
      isEmailVerified: true,
      roles: {
        create: {
          roleId: role.id,
        },
      },
    },
  });

  // 3. Crear Empleado
  const employee = await prisma.employee.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      employeeCode: 'EMP-9999',
      userId: user.id,
      firstName: 'Juan',
      lastName: 'Pérez',
      jobTitle: 'Analista de Pruebas',
      departmentId: testDept.id,
      baseSalary: 2500,
      currency: 'USD',
      salaryFrequency: PayrollFrequency.MONTHLY,
      employmentType: EmploymentType.FULL_TIME,
      employmentStatus: EmploymentStatus.ACTIVE,
      gender: Gender.MALE,
      hireDate: new Date(),
    },
  });

  console.log(`✅ Empleado creado: ${employee.firstName} ${employee.lastName} (${email})`);
  console.log('🔑 Credenciales:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: Abatalent@123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
