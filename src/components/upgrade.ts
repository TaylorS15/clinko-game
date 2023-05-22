export const buildings = {
  cursor: {
    cost: 10,
    cps: 0.1,
    costScale: 1.15,
  },
  row: {
    cost: 1000,
    costScale: 2.1,
  },
  buildingUpgrade: {
    cost: 10000,
    costScale: 2.4,
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
