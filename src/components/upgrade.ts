export type Buildings = {
  cursors: {
    cost: number;
    cps: number;
    costScale: number;
  };
  mines: {
    cost: number;
    cps: number;
    costScale: number;
  };
  factories: {
    cost: number;
    cps: number;
    costScale: number;
  };
  farms: {
    cost: number;
    cps: number;
    costScale: number;
  };
  nuclearplants: {
    cost: number;
    cps: number;
    costScale: number;
  };
  cryptominers: {
    cost: number;
    cps: number;
    costScale: number;
  };
  ballpits: {
    cost: number;
    cps: number;
    costScale: number;
  };
  rows: {
    cost: number;
    costScale: number;
    bucketMultiplier: {
      [key: number]: {
        [key: number]: number;
        EV: number;
      };
    };
  };
  buildingUpgrade: {
    cost: number;
    costScale: number;
  };
};

export const buildings: Buildings = {
  cursors: {
    cost: 10,
    cps: 0.1,
    costScale: 1.15,
  },
  mines: {
    cost: 120,
    cps: 0.2,
    costScale: 1.15,
  },
  factories: {
    cost: 1000,
    cps: 0.75,
    costScale: 1.15,
  },
  farms: {
    cost: 5500,
    cps: 2.5,
    costScale: 1.15,
  },
  nuclearplants: {
    cost: 30000,
    cps: 8,
    costScale: 1.15,
  },
  cryptominers: {
    cost: 200000,
    cps: 25,
    costScale: 1.15,
  },
  ballpits: {
    cost: 1000000,
    cps: 90,
    costScale: 1.15,
  },
  rows: {
    cost: 10000,
    costScale: 6.5,
    bucketMultiplier: {
      8: {
        0: 7,
        1: 3,
        2: 1,
        3: 0.5,
        4: 0.5,
        5: 0.5,
        6: 1,
        7: 3,
        8: 7,
        EV: 1.5,
      },
      9: {
        0: 8,
        1: 3,
        2: 2,
        3: 1,
        4: 0.5,
        5: 0.5,
        6: 1,
        7: 2,
        8: 3,
        9: 8,
        EV: 2,
      },
      10: {
        0: 10,
        1: 6,
        2: 5,
        3: 2,
        4: 1,
        5: 0.5,
        6: 1,
        7: 2,
        8: 5,
        9: 6,
        10: 10,
        EV: 2.5,
      },
      11: {
        0: 15,
        1: 8,
        2: 6,
        3: 3,
        4: 2,
        5: 1,
        6: 1,
        7: 2,
        8: 3,
        9: 6,
        10: 8,
        11: 15,
        EV: 3,
      },
      12: {
        0: 25,
        1: 15,
        2: 8,
        3: 5,
        4: 3,
        5: 1,
        6: 1,
        7: 1,
        8: 3,
        9: 5,
        10: 8,
        11: 15,
        12: 25,
        EV: 3.5,
      },
      13: {
        0: 35,
        1: 25,
        2: 15,
        3: 6,
        4: 3,
        5: 2,
        6: 1,
        7: 1,
        8: 2,
        9: 3,
        10: 6,
        11: 15,
        12: 25,
        13: 35,
        EV: 4,
      },
      14: {
        0: 45,
        1: 30,
        2: 15,
        3: 9,
        4: 4,
        5: 3,
        6: 2,
        7: 1,
        8: 2,
        9: 3,
        10: 4,
        11: 9,
        12: 15,
        13: 30,
        14: 45,
        EV: 4.5,
      },
      15: {
        0: 60,
        1: 45,
        2: 30,
        3: 10,
        4: 7,
        5: 4,
        6: 2,
        7: 2,
        8: 2,
        9: 2,
        10: 4,
        11: 7,
        12: 10,
        13: 30,
        14: 45,
        15: 60,
        EV: 5,
      },
      16: {
        0: 75,
        1: 40,
        2: 30,
        3: 15,
        4: 8,
        5: 4,
        6: 3,
        7: 2,
        8: 2,
        9: 2,
        10: 3,
        11: 4,
        12: 8,
        13: 15,
        14: 30,
        15: 40,
        16: 75,
        EV: 5.5,
      },
      17: {
        0: 90,
        1: 65,
        2: 35,
        3: 25,
        4: 12,
        5: 6,
        6: 3,
        7: 2,
        8: 2,
        9: 2,
        10: 2,
        11: 3,
        12: 6,
        13: 12,
        14: 25,
        15: 35,
        16: 65,
        17: 90,
        EV: 6,
      },
      18: {
        0: 100,
        1: 65,
        2: 50,
        3: 20,
        4: 10,
        5: 7,
        6: 5,
        7: 3,
        8: 2,
        9: 2,
        10: 2,
        11: 3,
        12: 5,
        13: 7,
        14: 10,
        15: 20,
        16: 50,
        17: 65,
        18: 100,
        EV: 6.5,
      },
      19: {
        0: 120,
        1: 90,
        2: 50,
        3: 15,
        4: 10,
        5: 7,
        6: 4,
        7: 3,
        8: 2,
        9: 2,
        10: 2,
        11: 2,
        12: 3,
        13: 4,
        14: 7,
        15: 10,
        16: 15,
        17: 50,
        18: 90,
        19: 120,
        EV: 7,
      },
    },
  },
  buildingUpgrade: {
    cost: 10000,
    costScale: 2,
  },
};

export const getBuildingCost = (
  buildingName: string,
  amount: number,
): number => {
  const selectedBuilding = buildings[buildingName as keyof typeof buildings];

  return Math.floor(
    selectedBuilding.cost * Math.pow(selectedBuilding.costScale, amount),
  );
};

export const upgradeLevelColors = {
  1: '#F18F01',
  2: '#E1DD8F',
  3: '#F26CA7',
  4: '#317B22',
  5: '#F0A7A0',
  6: '#5E4AE3',
  7: '#A20021',
  8: '#00E8FC',
  9: '#FFBE0A',
  10: '#5E2BFF',
  11: '#7CEA9C',
  12: '#29339B',
  13: '#CB04A5',
  14: '#3BB273',
  15: '#7768AE',
  16: '#ABD2FA',
  17: '#C04CFD',
  18: '#F2C078',
  19: '#330C2F',
  20: '#00F5D0',
  21: '#EF5B5B',
  22: '#E1E6E1',
  23: '#E7D336',
  24: '#86E675',
  25: '#D91E36',
};
