export interface ColonyDocument {
  timestamp: string;
  colonyInfo: {
    settlementId: string;
    settlementName: string;
  };
  time?: { dayNumber: number; cycle: number; cycleDay: number; partialCycleDay: number };
  population?: ColonyPopulation;
  resources?: { count: number; stockAvailable: boolean; goods: ColonyGood[] };
  powerGrid?: { networkCount: number; networks: PowerNetwork[] };
}

export interface ColonyPopulation {
  adults: number;
  children: number;
  bots: number;
  total: number;
  healthyAdults: number;
  healthyChildren: number;
  averageWellbeing?: number;
  beavers?: number;
  beaverWorkforce?: ColonyWorkforce;
  botWorkforce?: ColonyWorkforce;
  beds?: { occupied: number; free: number; homeless: number };
  beaverWorkplaces?: ColonyWorkplaces;
  botWorkplaces?: ColonyWorkplaces;
  contamination?: { adults: number; children: number; total: number };
  botCreated?: boolean;
  isAnyoneContaminated?: boolean;
  onlyBotsAlive?: boolean;
  allDead?: boolean;
}

export interface ColonyWorkforce {
  employable: number;
  unemployable: number;
  total: number;
}

export interface ColonyWorkplaces {
  occupied: number;
  free: number;
  unemployed: number;
  total: number;
}

export const GOODS_TREND_TYPES = [
  'HighDepletion',
  'MediumDepletion',
  'LowDepletion',
  'Stable',
  'LowGrowth',
  'MediumGrowth',
  'HighGrowth',
] as const;

export type GoodsTrendType = (typeof GOODS_TREND_TYPES)[number];

export interface GoodsTrend {
  type: GoodsTrendType;
  daysLeft: number;
}

export interface ColonyGood {
  id: string;
  name: string;
  type: string;
  stock: number;
  capacity: number;
  trend?: GoodsTrend;
  resourceDetails?: {
    stockpiledStock: number;
    bufferedOutputStock: number;
    inputOutputCapacity: number;
    fillRate: number;
    carriedToStockpilesStock: number;
    carriedToProcessors: number;
    stockUnderProcessing: number;
    bufferedInput: number;
    availableStock: number;
  };
}

export interface PowerNetwork {
  id: number;
  powerSupply: number;
  powerDemand: number;
  powerSurplus: number;
  powered: boolean;
  batteryCharge: number;
  batteryCapacity: number;
  powerEfficiency: number;
  batteryChargeLevel?: number;
  generatorCount?: number;
  valid?: boolean;
}