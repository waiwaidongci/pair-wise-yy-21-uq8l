import type { GridAsset } from "../types/GridAsset";

export const createDefaultGridAsset = (overrides: Partial<GridAsset> = {}): GridAsset => ({
  id: 0,
  asset_code: "",
  asset_type: "VOLTAGE_LOW",
  feeder_line: "",
  voltage_level: "LOW",
  location_desc: "",
  health_status: "NORMAL",
  owner_team_id: 0,
  ...overrides
});

export const createGridAssetForm = createDefaultGridAsset;
export const createGridAssetResponse = createDefaultGridAsset;
