// StadiumGPT — Navigate service (frontend)
import { getRoute } from "@/lib/api";
import { NavigateResponse, Language } from "@/types";

export interface GetRouteParams {
  from_gate: string;
  to_section: string;
  stadium_id?: string;
  step_free?: boolean;
  language?: Language;
}

export const navigateService = {
  async getRoute(params: GetRouteParams): Promise<NavigateResponse> {
    return getRoute(params);
  },
};
