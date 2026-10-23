import type { AutomationModel } from "./automation.model.js";

export type Lever = AutomationModel & {  springReturn: false; };