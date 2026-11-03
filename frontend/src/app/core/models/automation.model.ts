export interface AutomationDocument {
  name?: string;
  state?: boolean;
  springReturn?: boolean;
  config?: {
    visible?: boolean;
    color?: string;
  };
  [field: string]: unknown;
}