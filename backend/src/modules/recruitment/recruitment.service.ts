import { prisma } from '../../config/prisma';
import { parsePagination, paginate } from '../../common/utils/response';
import { NotFound, BadRequest } from '../../common/utils/apiError';
import { emailService } from '../../common/services/email.service';
import type { 
  RecruitmentQuery, 
  CreateJobPostingDto, 
  ApplyJobDto,
  MoveStageDto 
} from './Recruitment.types';
import { ApplicationStatus } from '@prisma/client';

export class RecruitmentService {
  
  // ── Job Postings ──────────────────────────────────────────────────────────
  
  async findAllJobs(query: RecruitmentQuery) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = { deletedAt: null };
    
    if (query.status && query.status !== '') where.status = query.status;
    if (query.departmentId) where.departmentId = query.departmentId;
    
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const [data, total] = await Promise.all([
      prisma.jobPosting.findMany({ 
        where, 
        skip, 
        take: limit, 
        orderBy: { createdAt: 'desc' },
        include: { department: { select: { name: true } }, _count: { select: { applications: true } } }
      }),
      prisma.jobPosting.count({ where }),
    ]);

    return { data, meta: paginate(total, page, limit) };
  }

  async findJobById(id: string) {
    const job = await prisma.jobPosting.findUnique({
      where: { id },
      include: { department: true }
    });
    if (!job || job.deletedAt) throw NotFound('Job Posting');
    return job;
  }

  async createJob(dto: CreateJobPostingDto) {
    return prisma.jobPosting.create({
      data: {
        ...dto,
        code: `JOB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
      }
    });
  }

  async updateJob(id: string, dto: Partial<CreateJobPostingDto>) {
    await this.findJobById(id);
    return prisma.jobPosting.update({
      where: { id },
      data: dto
    });
  }

  async removeJob(id: string) {
    await this.findJobById(id);
    return prisma.jobPosting.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'CANCELLED' }
    });
  }

  // ── Applications & Candidates ──────────────────────────────────────────────

  async applyToJob(dto: ApplyJobDto) {
    let candidateId = dto.candidateId;

    // 1. Create or Find Candidate
    if (!candidateId && dto.candidate) {
      const existing = await prisma.candidate.findFirst({ where: { email: dto.candidate.email } });
      if (existing) {
        candidateId = existing.id;
      } else {
        const candidate = await prisma.candidate.create({ data: dto.candidate });
        candidateId = candidate.id;
      }
    }

    if (!candidateId) throw BadRequest('Candidate information is required');

    // 2. Check if already applied
    const existingApp = await prisma.jobApplication.findUnique({
      where: { jobId_candidateId: { jobId: dto.jobId, candidateId } }
    });
    if (existingApp) throw BadRequest('Candidate has already applied to this job');

    // 3. Create Application
    const application = await prisma.jobApplication.create({
      data: {
        jobId: dto.jobId,
        candidateId,
        coverLetter: dto.coverLetter,
        status: 'APPLIED'
      },
      include: { candidate: true, job: true }
    });

    // 4. Send Email
    await emailService.sendApplicationReceived(
      application.candidate.email,
      application.candidate.firstName,
      application.job.title
    );

    return application;
  }

  async moveApplicationStage(applicationId: string, dto: MoveStageDto) {
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { candidate: true, job: true }
    });
    if (!application) throw NotFound('Application');

    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: { 
        status: dto.status || application.status,
        currentStageId: dto.currentStageId || application.currentStageId,
        internalNotes: dto.notes ? `${application.internalNotes || ''}\n[Update]: ${dto.notes}` : application.internalNotes
      }
    });

    // Handle Email Triggers based on stage
    if (dto.status === 'OFFER_EXTENDED') {
      await emailService.sendOfferExtended(application.candidate.email, application.candidate.firstName, application.job.title);
    } else if (dto.status === 'REJECTED') {
      await emailService.sendRejection(application.candidate.email, application.candidate.firstName, application.job.title);
    } else if (dto.status === 'HIRED') {
      // Integration with Employee module could happen here
      await prisma.jobPosting.update({
        where: { id: application.jobId },
        data: { filledCount: { increment: 1 } }
      });
    }

    return updated;
  }

  async scheduleInterview(applicationId: string, dto: { title: string, scheduledAt: string, interviewerIds: string[] }) {
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { candidate: true, job: true }
    });
    if (!application) throw NotFound('Application');

    const interview = await prisma.interview.create({
      data: {
        applicationId,
        title: dto.title,
        scheduledAt: new Date(dto.scheduledAt),
        interviewerIds: dto.interviewerIds,
        type: 'VIDEO' // Default
      }
    });

    // Move status to INTERVIEW if it's not already
    if (application.status === 'SCREENING' || application.status === 'APPLIED') {
      await prisma.jobApplication.update({
        where: { id: applicationId },
        data: { status: 'TECHNICAL_INTERVIEW' }
      });
    }

    // Send Email
    await emailService.sendInterviewInvitation(
      application.candidate.email,
      application.candidate.firstName,
      application.job.title,
      interview.scheduledAt
    );

    return interview;
  }

  async getApplicationsByJob(jobId: string) {
    return prisma.jobApplication.findMany({
      where: { jobId },
      include: {
        candidate: true,
        interviews: true
      },
      orderBy: { appliedAt: 'desc' }
    });
  }

  async getApplicationDetails(id: string) {
    const app = await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        candidate: true,
        job: { include: { department: true } },
        interviews: { orderBy: { scheduledAt: 'asc' } }
      }
    });
    if (!app) throw NotFound('Application');
    return app;
  }

  async updateCandidateResume(candidateId: string, fileUrl: string) {
    return prisma.candidate.update({
      where: { id: candidateId },
      data: { resumeUrl: fileUrl }
    });
  }

  async getStats() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const [totalJobs, activeJobs, totalApplications, byStatus, interviewsToday] = await Promise.all([
      prisma.jobPosting.count({ where: { deletedAt: null } }),
      prisma.jobPosting.count({ where: { status: 'OPEN', deletedAt: null } }),
      prisma.jobApplication.count(),
      prisma.jobApplication.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.interview.findMany({
        where: {
          scheduledAt: {
            gte: todayStart,
            lt: todayEnd
          }
        },
        include: {
          application: {
            include: {
              candidate: true,
              job: true
            }
          }
        },
        orderBy: { scheduledAt: 'asc' }
      })
    ]);

    const nextInterview = interviewsToday.find(i => new Date(i.scheduledAt) > new Date());

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      byStatus: byStatus.map(s => ({ status: s.status, count: s._count })),
      interviewsTodayCount: interviewsToday.length,
      interviewsToday,
      nextInterviewTime: nextInterview ? nextInterview.scheduledAt : null
    };
  }

  async generateOfferLetterPdf(applicationId: string) {
    const app = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        candidate: true,
        job: { include: { department: true } }
      }
    });

    if (!app) throw NotFound('Application');

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

    const docDefinition: any = {
      content: [
        { text: 'CARTA DE OFERTA LABORAL', style: 'header', alignment: 'center' },
        { text: '\n\n' },
        { text: `Fecha: ${new Date().toLocaleDateString()}`, alignment: 'right' },
        { text: '\n' },
        { text: `Estimado(a) ${app.candidate.firstName} ${app.candidate.lastName},` },
        { text: '\n' },
        { 
          text: [
            'Es un placer para nosotros en ',
            { text: 'ABA Talent Management', bold: true },
            ', extenderle esta oferta formal para unirse a nuestro equipo en la posición de ',
            { text: app.job.title, bold: true },
            ' dentro del departamento de ',
            { text: app.job.department?.name || 'Operaciones', bold: true },
            '.'
          ]
        },
        { text: '\n' },
        { text: 'Detalles de la Oferta:', style: 'subheader' },
        {
          ul: [
            { text: [`Salario Base: `, { text: `${app.offerAmount || app.job.salaryMin} ${app.job.currency}`, bold: true }] },
            { text: [`Tipo de Contrato: `, { text: app.job.employmentType, bold: true }] },
            { text: [`Ubicación: `, { text: app.job.location || 'Remoto', bold: true }] },
            { text: [`Fecha de Inicio Sugerida: `, { text: app.expectedStartDate ? app.expectedStartDate.toLocaleDateString() : 'Por definir', bold: true }] },
          ]
        },
        { text: '\n' },
        { text: 'Estamos convencidos de que su experiencia y habilidades serán un gran aporte para nuestra organización y que encontrará en ABA Talent un entorno propicio para su desarrollo profesional.', leadingIndent: 20 },
        { text: '\n' },
        { text: 'Quedamos a la espera de su respuesta. Esta oferta tiene una validez de 5 días hábiles a partir de la fecha de emisión.' },
        { text: '\n\n\n' },
        { text: 'Atentamente,', alignment: 'left' },
        { text: '\n' },
        app.hrSignature ? { image: app.hrSignature, width: 100, margin: [0, 5, 0, 5] } : null,
        { text: 'El Equipo de Reclutamiento', bold: true },
        { text: 'ABA Talent Management' },
      ].filter(Boolean),
      styles: {
        header: { fontSize: 18, bold: true, color: '#0F172A' },
        subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5], color: '#334155' }
      },
      defaultStyle: { font: 'Helvetica', fontSize: 11, lineHeight: 1.5, color: '#475569' }
    };

    return printer.createPdfKitDocument(docDefinition);
  }

  async saveHrSignature(applicationId: string, signatureData: string) {
    return prisma.jobApplication.update({
      where: { id: applicationId },
      data: { hrSignature: signatureData }
    });
  }

  async scheduleInterview(applicationId: string, data: any) {
    return prisma.interview.create({
      data: {
        applicationId,
        title: data.title,
        scheduledAt: new Date(data.scheduledAt),
        durationMins: data.durationMins || 60,
        type: data.type || 'VIDEO',
        location: data.location,
        notes: data.notes,
        interviewerIds: data.interviewerIds || []
      }
    });
  }
}

export const recruitmentService = new RecruitmentService();
