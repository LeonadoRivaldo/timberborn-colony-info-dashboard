export interface ColonyDocument {
  timestamp: string;
  colonyInfo: {
    settlementId: string;
    settlementName: string;
  };
  time?: { dayNumber: number; cycle: number; cycleDay: number; partialCycleDay: number };
  population?: { adults: number; children: number; bots: number; total: number; healthyAdults: number; healthyChildren: number };
  resources?: { count: number; stockAvailable: boolean; goods: ColonyGood[] };
  powerGrid?: { networkCount: number; networks: PowerNetwork[] };
}

export interface ColonyGood {
  id: string;
  name: string;
  type: string;
  stock: number;
  capacity: number;
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
}