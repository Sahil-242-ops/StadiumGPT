// StadiumGPT — Chat service (frontend)
// Wraps the raw API client with domain-level concerns
import { sendChat } from "@/lib/api";
import { ChatResponse, Language } from "@/types";

export interface SendChatParams {
  message: string;
  language?: Language;
  stadium_id?: string;
  section?: string;
  accessibility_mode?: boolean;
}

export const chatService = {
  async send(params: SendChatParams): Promise<ChatResponse> {
    return sendChat(params);
  },
};
