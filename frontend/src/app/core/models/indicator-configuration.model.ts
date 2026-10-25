export interface IndicatorConfiguration {
  id: string;
  color: string;
}

export interface IndicatorDocument {
  name: string;
  state: boolean;
  config?: {
    visible?: boolean;
    color?: string;
  };
}

export interface ConfiguredIndicator extends IndicatorConfiguration {
  readonly name: string;
  readonly state: boolean;
}