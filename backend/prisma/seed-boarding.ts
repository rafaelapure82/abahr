import { PrismaClient, TaskCategory, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Onboarding/Offboarding templates...');

  // ─── Onboarding Template ──────────────────────────────────────────────────
  const onboardingName = 'Onboarding Estándar';
  const existingOnboarding = await prisma.onboardingTemplate.findFirst({ where: { name: onboardingName } });
  
  if (!existingOnboarding) {
    await prisma.onboardingTemplate.create({
      data: {
        name: onboardingName,
        description: 'Proceso de bienvenida para todos los nuevos empleados.',
        isDefault: true,
        tasks: {
          create: [
            { title: 'Firma de Contrato', description: 'Completar documentación legal y firma de contrato.', category: TaskCategory.DOCUMENTATION, order: 1, dueDays: 1, isRequired: true },
            { title: 'Configuración de Laptop', description: 'Entrega y configuración de equipo de computo.', category: TaskCategory.IT_SETUP, order: 2, dueDays: 1, isRequired: true },
            { title: 'Accesos a Sistemas', description: 'Creación de correo, Slack, Jira y ERP.', category: TaskCategory.ACCESS, order: 3, dueDays: 2, isRequired: true },
            { title: 'Presentación con el Equipo', description: 'Reunión de 15 min con el equipo de trabajo.', category: TaskCategory.MEETING, order: 4, dueDays: 3, isRequired: false },
            { title: 'Capacitación de Seguridad', description: 'Completar el curso básico de seguridad informática.', category: TaskCategory.TRAINING, order: 5, dueDays: 7, isRequired: true },
          ]
        }
      }
    });
  }

  // ─── Offboarding Template ──────────────────────────────────────────────────
  const offboardingName = 'Offboarding Estándar';
  const existingOffboarding = await prisma.offboardingTemplate.findFirst({ where: { name: offboardingName } });

  if (!existingOffboarding) {
    await prisma.offboardingTemplate.create({
      data: {
        name: offboardingName,
        description: 'Proceso de salida estándar para desvinculaciones.',
        isDefault: true,
        tasks: {
          create: [
            { title: 'Devolución de Equipo', description: 'Entrega de laptop, monitor y periféricos.', category: TaskCategory.RETURN_EQUIPMENT, order: 1, dueDays: 0, isRequired: true },
            { title: 'Desactivación de Cuentas', description: 'Baja en sistemas, correo y accesos físicos.', category: TaskCategory.ACCESS, order: 2, dueDays: 0, isRequired: true },
            { title: 'Entrevista de Salida', description: 'Reunión con HR para retroalimentación.', category: TaskCategory.EXIT_INTERVIEW, order: 3, dueDays: 0, isRequired: true },
            { title: 'Liquidación de Beneficios', description: 'Cálculo y pago de prestaciones finales.', category: TaskCategory.DOCUMENTATION, order: 4, dueDays: 5, isRequired: true },
          ]
        }
      }
    });
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
