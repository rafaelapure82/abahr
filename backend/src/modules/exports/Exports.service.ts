import * as ExcelJS from 'exceljs';
const PdfPrinter = require('pdfmake');
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { prisma } from '../../config/prisma';
import { NotFound } from '../../common/utils/apiError';
import { logger } from '../../config/logger';

export class ExportsService {
  
  // ── Excel Export ──────────────────────────────────────────────────────────

  async exportEmployeesToExcel() {
    const employees = await prisma.employee.findMany({
      where: { deletedAt: null },
      include: { department: true, position: true }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Employees');

    worksheet.columns = [
      { header: 'ID', key: 'employeeId', width: 15 },
      { header: 'First Name', key: 'firstName', width: 20 },
      { header: 'Last Name', key: 'lastName', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Position', key: 'position', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Hire Date', key: 'hireDate', width: 15 },
    ];

    employees.forEach(emp => {
      worksheet.addRow({
        employeeId: emp.employeeCode,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.workEmail || 'N/A',
        department: emp.department?.name || 'N/A',
        position: emp.position?.title || 'N/A',
        status: emp.employmentStatus,
        hireDate: emp.hireDate.toISOString().split('T')[0],
      });
    });

    // Formatting
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' }
    };

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  // ── PDF Export ────────────────────────────────────────────────────────────

  async exportPayrollToPdf(payrollId: string) {
    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      include: { 
        department: true,
        items: { include: { employee: true } }
      }
    });

    if (!payroll) throw NotFound('Payroll');

    const fonts = {
      Roboto: {
        normal: 'Helvetica', 
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
      }
    };

    const printer = new PdfPrinter(fonts);

    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'Payroll Report', style: 'header' },
        { text: `Department: ${payroll.department?.name || 'All'}`, margin: [0, 5, 0, 15] },
        { text: `Period: ${payroll.periodStart.toDateString()} - ${payroll.periodEnd.toDateString()}`, margin: [0, 0, 0, 20] },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto', 'auto'],
            body: [
              ['Employee', 'Base', 'Bonuses', 'Deductions', 'Net Pay'],
              ...payroll.items.map(item => [
                `${item.employee.firstName} ${item.employee.lastName}`,
                item.baseSalary.toString(),
                '0.00', 
                '0.00', 
                item.netPay.toString()
              ])
            ]
          }
        },
        { text: `\nTotal Net: ${payroll.totalNet.toString()} ${payroll.currency}`, style: 'subheader', margin: [0, 20, 0, 0] }
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] }
      }
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    return pdfDoc;
  }
}

export const exportsService = new ExportsService();
