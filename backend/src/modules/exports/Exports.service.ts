import * as ExcelJS from 'exceljs';
import { prisma } from '../../config/prisma';
import { NotFound } from '../../common/utils/apiError';
import { logger } from '../../config/logger';
import { 
  startOfDay, endOfDay, 
  startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, 
  startOfYear, endOfYear 
} from 'date-fns';


import { TDocumentDefinitions } from 'pdfmake/interfaces';

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
      Helvetica: {
        normal: 'Helvetica', 
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
      }
    };

    const PdfPrinter = require('pdfmake');
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

  async exportAttendanceToExcel(query: any) {
    const where: any = {};
    if (query.startDate) where.date = { gte: new Date(query.startDate) };
    if (query.endDate)   where.date = { ...(where.date || {}), lte: new Date(query.endDate) };
    if (query.status)    where.status = query.status;

    const attendance = await prisma.attendance.findMany({
      where,
      include: { employee: true },
      orderBy: { date: 'desc' }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');

    worksheet.columns = [
      { header: 'Fecha', key: 'date', width: 15 },
      { header: 'Empleado', key: 'employee', width: 25 },
      { header: 'Código', key: 'code', width: 15 },
      { header: 'Entrada', key: 'checkIn', width: 20 },
      { header: 'Salida', key: 'checkOut', width: 20 },
      { header: 'Horas', key: 'hours', width: 10 },
      { header: 'Estado', key: 'status', width: 15 },
    ];

    attendance.forEach(att => {
      worksheet.addRow({
        date: att.date.toISOString().split('T')[0],
        employee: `${att.employee.firstName} ${att.employee.lastName}`,
        code: att.employee.employeeCode,
        checkIn: att.checkIn ? att.checkIn.toLocaleTimeString() : '--',
        checkOut: att.checkOut ? att.checkOut.toLocaleTimeString() : '--',
        hours: att.hoursWorked || 0,
        status: att.status,
      });
    });

    worksheet.getRow(1).font = { bold: true };
    return workbook.xlsx.writeBuffer();
  }

  // ── Advanced Attendance Report (PDF) ───────────────────────────────────────

  async exportAttendanceReportPdf(params: { 
    employeeId?: string, 
    departmentId?: string, 
    period: 'daily' | 'weekly' | 'monthly' | 'annual',
    date?: string 
  }) {
    const where: any = {};
    if (params.employeeId)   where.employeeId = params.employeeId;
    if (params.departmentId) where.employee = { departmentId: params.departmentId };
    
    // Period logic
    const baseDate = params.date ? new Date(params.date) : new Date();
    if (params.period === 'daily') {
      where.date = { gte: startOfDay(baseDate), lte: endOfDay(baseDate) };
    } else if (params.period === 'weekly') {
      where.date = { gte: startOfWeek(baseDate), lte: endOfWeek(baseDate) };
    } else if (params.period === 'monthly') {
      where.date = { gte: startOfMonth(baseDate), lte: endOfMonth(baseDate) };
    } else if (params.period === 'annual') {
      where.date = { gte: startOfYear(baseDate), lte: endOfYear(baseDate) };
    }
    
    const attendance = await prisma.attendance.findMany({
      where,
      include: { 
        employee: { include: { department: true } } 
      },
      orderBy: { date: 'asc' }
    });

    if (attendance.length === 0) {
      logger.warn(`No attendance records found for report: ${JSON.stringify(params)}`);
    }

    const fonts = {
      Helvetica: {
        normal: 'Helvetica', 
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
      }
    };

    const PdfPrinter = require('pdfmake');
    const printer = new PdfPrinter(fonts);
    
    const totalHours = attendance.reduce((sum, a) => sum + Number(a.hoursWorked || 0), 0);
    const totalDays = attendance.length;
    const lates = attendance.filter(a => a.status === 'LATE').length;

    try {
      const docDefinition: TDocumentDefinitions = {
        content: [
          { text: 'REPORTE DE ASISTENCIA - ABA TALENT HR', style: 'header', alignment: 'center' },
          { text: `Periodo: ${params.period.toUpperCase()}`, margin: [0, 5, 0, 15], alignment: 'center' },
          
          {
            columns: [
              { text: `Filtro: ${params.employeeId ? 'Empleado Individual' : params.departmentId ? 'Departamento' : 'General'}`, bold: true },
              { text: `Fecha Generación: ${new Date().toLocaleDateString()}`, alignment: 'right' }
            ]
          },
          { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#eeeeee' }], margin: [0, 10, 0, 20] },
  
          // Stats Summary
          {
            table: {
              widths: ['*', '*', '*'],
              body: [
                [
                  { text: 'Total Horas', style: 'statLabel' },
                  { text: 'Días Presente', style: 'statLabel' },
                  { text: 'Retrasos', style: 'statLabel' }
                ],
                [
                  { text: `${totalHours.toFixed(1)}h`, style: 'statValue' },
                  { text: totalDays.toString(), style: 'statValue' },
                  { text: lates.toString(), style: 'statValue', color: lates > 0 ? '#ef4444' : '#10b981' }
                ]
              ]
            },
            layout: 'noBorders',
            margin: [0, 0, 0, 30]
          },
  
          // Detailed Table
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'FECHA', style: 'tableHeader' },
                  { text: 'EMPLEADO', style: 'tableHeader' },
                  { text: 'ENTRADA', style: 'tableHeader' },
                  { text: 'SALIDA', style: 'tableHeader' },
                  { text: 'HORAS', style: 'tableHeader' }
                ],
                ...attendance.length > 0 ? attendance.map(a => [
                  { text: a.date.toISOString().split('T')[0], fontSize: 9 },
                  { text: `${a.employee.firstName} ${a.employee.lastName}`, fontSize: 9 },
                  { text: a.checkIn ? a.checkIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--', fontSize: 9 },
                  { text: a.checkOut ? a.checkOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--', fontSize: 9 },
                  { text: `${a.hoursWorked || 0}h`, fontSize: 9, bold: true }
                ]) : [[{ text: 'No hay registros en este periodo', colSpan: 5, alignment: 'center' as any, margin: [0, 10, 0, 10], color: '#64748b' }, {}, {}, {}, {}]]
              ]
            },
            layout: {
              hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 2 : 1,
              vLineWidth: () => 0,
              hLineColor: (i: number) => (i === 0) ? '#4f46e5' : '#eeeeee',
              paddingTop: () => 8,
              paddingBottom: () => 8
            }
          }
        ],
        styles: {
          header: { fontSize: 22, bold: true, color: '#1e293b' },
          statLabel: { fontSize: 10, color: '#64748b', bold: true, alignment: 'center' },
          statValue: { fontSize: 18, bold: true, color: '#1e293b', alignment: 'center', margin: [0, 5, 0, 0] },
          tableHeader: { fontSize: 10, bold: true, color: '#4f46e5', margin: [0, 5, 0, 5] }
        },
        defaultStyle: { font: 'Helvetica' }
      };
  
      return printer.createPdfKitDocument(docDefinition);
    } catch (err: any) {
      logger.error('Error generating PDF doc definition:', err);
      throw err;
    }
  }
}

export const exportsService = new ExportsService();
