// StadiumGPT — /api/sos route
import { Router } from 'express';
import { sosController } from '../controllers/sos.controller.js';

export const sosRouter = Router();
sosRouter.post('/sos', sosController);
