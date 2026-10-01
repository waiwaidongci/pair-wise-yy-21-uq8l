import { request } from "./request";
import type { Crew } from "../types/Crew";

const endpoint = "/api/crew";

export async function listCrew(): Promise<Crew[]> {
  return request<Crew[]>(endpoint);
}

export async function saveCrew(payload: Crew): Promise<Crew> {
  return request<Crew>(endpoint, { method: "POST", body: JSON.stringify(payload) });
}
