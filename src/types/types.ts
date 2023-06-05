export type RowCount = 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19;

export interface GameState {
  clinks: number;
  buildings: {
    [key in Building['name']]: {
      count: number;
      level: number;
    };
  };
  rows: RowCount;
  setClinks: (clinks: number) => void;
  setRows: (rows: RowCount) => void;
  setBuildingCount: (building: Building['name'], count: number) => void;
  setBuildingLevel: (building: Building['name'], level: number) => void;
}

export type Building = {
  name:
    | 'cursors'
    | 'factories'
    | 'mines'
    | 'cryptominers'
    | 'ballpits'
    | 'farms'
    | 'nuclearplants';
};
