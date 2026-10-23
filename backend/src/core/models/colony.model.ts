export interface ColonySnapshot {
  timestamp: string;
  colonyInfo: { settlementId: string; settlementName: string };
  [field: string]: unknown;
}