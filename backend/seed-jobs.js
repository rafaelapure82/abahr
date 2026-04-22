const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const dept = await prisma.department.findFirst();
  if (!dept) {
    console.log('No departments found. Please seed departments first.');
    return;
  }

  const jobs = [
    {
      title: 'Desarrollador Full Stack Senior',
      description: 'Buscamos un desarrollador con experiencia en NestJS y Angular.',
      status: 'OPEN',
      departmentId: dept.id,
      employmentType: 'FULL_TIME',
      location: 'Remoto / Ciudad de México',
      isRemote: true,
      salaryMin: 45000,
      salaryMax: 65000,
      currency: 'MXN',
      code: 'JOB-SR-FS'
    },
    {
      title: 'Especialista en Recursos Humanos',
      description: 'Únete a nuestro equipo de gestión de talento.',
      status: 'OPEN',
      departmentId: dept.id,
      employmentType: 'FULL_TIME',
      location: 'Buenos Aires',
      isRemote: false,
      salaryMin: 1500,
      salaryMax: 2500,
      currency: 'USD',
      code: 'JOB-HR-SPEC'
    }
  ];

  for (const job of jobs) {
    await prisma.jobPosting.upsert({
      where: { code: job.code },
      update: job,
      create: job
    });
  }

  console.log('Seed completed: 2 jobs created.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
