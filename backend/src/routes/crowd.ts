// StadiumGPT — /api/crowd route (thin wrapper → controller)
import { Router } from "express";
import { crowdController } from "../controllers/crowd.controller.js";

export const crowdRouter = Router();
crowdRouter.post("/crowd", crowdController);
