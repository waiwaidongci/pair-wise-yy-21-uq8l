import { seed } from "../seed";
import type { GridAsset } from "../models/GridAsset";

// 配网资产：台账参考数据，内存维护
let rows: GridAsset[] = [...(seed.gridAsset as unknown as GridAsset[])];

export const gridAssetRepository = {
  findAll: (): GridAsset[] => rows,
  findById: (id: number): GridAsset | undefined => rows.find((r) => r.id === id),
  save: (row: GridAsset): GridAsset => {
    rows = [...rows, row];
    return row;
  }
};
