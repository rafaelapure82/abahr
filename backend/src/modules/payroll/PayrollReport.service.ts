import PDFDocument from 'pdfkit';
import * as XLSX from 'xlsx';
import { prisma } from '../../config/prisma';
import { NotFound } from '../../common/utils/apiError';
import { format } from 'date-fns';
import { Response } from 'express';

export class PayrollReportService {
  
  /**
   * Generates a Payslip PDF for a single PayrollItem
   */
  async generatePayslipPDF(itemId: string, res: Response) {
    const item = await prisma.payrollItem.findUnique({
      where: { id: itemId },
      include: {
        employee: { include: { department: true } },
        bonuses: true,
        deductions: true,
        payroll: true
      }
    });

    if (!item) throw NotFound('Payroll Item');

    const doc = new PDFDocument({ margin: 50 });

    // Stream to response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payslip_${item.employee.employeeCode}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('ABA Talent Management', { align: 'center' });
    doc.fontSize(14).text('Recibo de Pago (Payslip)', { align: 'center' });
    doc.moveDown();

    // Employee & Period Info
    doc.fontSize(12).text(`Empleado: ${item.employee.firstName} ${item.employee.lastName}`);
    doc.text(`ID: ${item.employee.employeeCode}`);
    doc.text(`Departamento: ${item.employee.department?.name || 'N/A'}`);
    doc.text(`Periodo: ${format(item.payroll.periodStart, 'dd/MM/yyyy')} - ${format(item.payroll.periodEnd, 'dd/MM/yyyy')}`);
    doc.moveDown();

    // Table Header
    doc.fontSize(12).text('Descripción', 50, 200);
    doc.text('Monto (USD)', 400, 200, { align: 'right' });
    doc.moveTo(50, 215).lineTo(550, 215).stroke();

    let y = 230;
    // Base Salary
    doc.text('Salario Base (Periodo)', 50, y);
    doc.text(`${item.baseSalary}`, 400, y, { align: 'right' });
    y += 20;

    // Overtime
    if (Number(item.overtimeHours) > 0) {
      doc.text(`Horas Extra (${item.overtimeHours} hrs)`, 50, y);
      doc.text(`${item.overtimePay}`, 400, y, { align: 'right' });
      y += 20;
    }

    // Bonuses
    item.bonuses.forEach(b => {
      doc.text(b.name, 50, y);
      doc.text(`${b.amount}`, 400, y, { align: 'right' });
      y += 20;
    });

    doc.moveDown();
    doc.fontSize(11).text('Deducciones', 50, y, { underline: true });
    y += 20;

    // Deductions
    item.deductions.forEach(d => {
      doc.fillColor('red').text(d.name, 50, y);
      doc.text(`- ${d.amount}`, 400, y, { align: 'right' });
      doc.fillColor('black');
      y += 20;
    });

    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 10;

    // Footer Totals
    doc.fontSize(14).font('Helvetica-Bold').text('Total Neto:', 50, y);
    doc.text(`${item.netPay} USD`, 400, y, { align: 'right' });
    doc.font('Helvetica'); // Reset to normal

    doc.end();
  }

  /**
   * Exports a full Payroll period to Excel
   */
  async exportToExcel(payrollId: string, res: Response) {
    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      include: {
        items: {
          include: { employee: true }
        }
      }
    });

    if (!payroll) throw NotFound('Payroll');

    const data = payroll.items.map(item => ({
      'Employee Code': item.employee.employeeCode,
      'Name': `${item.employee.firstName} ${item.employee.lastName}`,
      'Base Salary': Number(item.baseSalary),
      'OT Hours': Number(item.overtimeHours),
      'OT Pay': Number(item.overtimePay),
      'Gross Pay': Number(item.grossPay),
      'Net Pay': Number(item.netPay),
      'Currency': item.currency
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=payroll_${payrollId}.xlsx`);
    res.send(buffer);
  }
}

export const payrollReportService = new PayrollReportService();
