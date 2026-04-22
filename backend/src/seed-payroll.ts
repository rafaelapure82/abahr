import { PrismaClient, PayrollStatus, BonusType, DeductionType } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Generating sample payroll data...');
  
  const employee = await prisma.employee.findFirst({
    where: { firstName: 'Aisha' }
  });

  if (!employee) {
    console.log('Employee Aisha not found. Run seed first.');
    return;
  }

  const payroll = await prisma.payroll.create({
    data: {
      periodStart: new Date('2026-04-01'),
      periodEnd: new Date('2026-04-30'),
      payDate: new Date('2026-04-30'),
      status: PayrollStatus.PAID,
      currency: 'USD',
      totalGross: 9333.33,
      totalNet: 7500.00,
      totalDeductions: 1833.33,
      totalBonuses: 500,
      items: {
        create: {
          employeeId: employee.id,
          grossPay: 9333.33,
          netPay: 7500.00,
          baseSalary: 9333.33,
          bonuses: {
            create: {
              name: 'Performance Bonus',
              amount: 500,
              type: BonusType.PERFORMANCE
            }
          },
          deductions: {
            create: {
              name: 'Income Tax',
              amount: 1833.33,
              type: DeductionType.TAX_INCOME
            }
          }
        }
      }
    }
  });

  console.log(`✅ Sample payroll created: ${payroll.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
