import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { RecruitmentService } from '../../core/services/recruitment.service';

export const jobListResolver: ResolveFn<any> = () => {
  return inject(RecruitmentService).getJobs();
};

export const jobDetailResolver: ResolveFn<any> = (route) => {
  const id = route.paramMap.get('id');
  if (!id) throw new Error('Job ID is required');
  return inject(RecruitmentService).getJobById(id);
};
