// StadiumGPT — Crowd service (frontend)
import { getCrowd } from "@/lib/api";
import { CrowdResponse } from "@/types";

export interface GetCrowdParams {
  stadium_id?: string;
  section?: string;
}

export const crowdService = {
  async get(params: GetCrowdParams): Promise<CrowdResponse> {
    return getCrowd(params);
  },
};
