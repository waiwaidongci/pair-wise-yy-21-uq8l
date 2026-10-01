import { request } from "./request";
import type { GridAsset } from "../types/GridAsset";

const endpoint = "/api/grid-asset";

export async function listGridAsset(): Promise<GridAsset[]> {
  return request<GridAsset[]>(endpoint);
}

export async function saveGridAsset(payload: GridAsset): Promise<GridAsset> {
  return request<GridAsset>(endpoint, { method: "POST", body: JSON.stringify(payload) });
}
