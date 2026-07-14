// StadiumGPT — /api/insights route
import { Router } from 'express';
import { insightsController } from '../controllers/insights.controller.js';

export const insightsRouter = Router();
insightsRouter.get('/insights', insightsController);
