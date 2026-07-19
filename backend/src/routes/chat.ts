// StadiumGPT — /api/chat route (thin wrapper → controller)
import { Router } from "express";
import { chatController } from "../controllers/chat.controller.js";

export const chatRouter = Router();
chatRouter.post("/chat", chatController);
