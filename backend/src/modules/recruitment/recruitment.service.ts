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
    
    if (query.status) where.status = query.status;
    if (query.departmentId) where.departmentId = query.departmentId;

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
}

export const recruitmentService = new RecruitmentService();
