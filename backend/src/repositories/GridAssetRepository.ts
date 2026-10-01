import { seed } from "../seed";
import type { GridAsset } from "../models/GridAsset";

const rows: GridAsset[] = seed.gridAsset.map((row) => ({ ...row })) as GridAsset[];

export const gridAssetRepository = {
  findAll: (): GridAsset[] => rows.map((row) => ({ ...row })),
  findById: (id: number): GridAsset | undefined => {
    const found = rows.find((row) => row.id === id);
    return found ? { ...found } : undefined;
  },
  save: (row: Omit<GridAsset, "id"> & { id?: number }): GridAsset => {
    const id = row.id ?? Math.max(0, ...rows.map((r) => r.id)) + 1;
    const record = { ...row, id } as GridAsset;
    rows.push(record);
    return { ...record };
  }
};
