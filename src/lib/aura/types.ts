export type AuraMetricKey = "social" | "chaos" | "focus" | "sleep";

export interface AuraMetrics {
  social: number;
  chaos: number;
  focus: number;
  sleep: number;
}

export interface AuraPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}
