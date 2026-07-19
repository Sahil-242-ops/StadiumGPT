// StadiumGPT — /api/navigate route (thin wrapper → controller)
import { Router } from "express";
import { navigateController } from "../controllers/navigate.controller.js";

export const navigateRouter = Router();
navigateRouter.post("/navigate", navigateController);
