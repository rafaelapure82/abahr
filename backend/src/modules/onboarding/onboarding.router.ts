import { Router } from 'express';

export const onboardingRouter = Router();

// TODO: implement onboarding routes
onboardingRouter.get('/', (_req, res) => {
  res.json({ success: true, module: 'onboarding', message: 'Module ready' });
});
