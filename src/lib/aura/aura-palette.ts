import type { AuraMetrics, AuraPalette } from "./types";

function clamp01(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n))) / 100;
}

function toHex(rgb: [number, number, number]): string {
  const h = (c: number) =>
    Math.round(Math.min(255, Math.max(0, c * 255)))
      .toString(16)
      .padStart(2, "0");
  return `#${h(rgb[0])}${h(rgb[1])}${h(rgb[2])}`;
}

/**
 * Derives the same palette keys the Aura shader emphasizes so web, export,
 * and Firestore stay aligned. Values mirror the GLSL mixing weights.
 */
export function computeAuraPalette(metrics: AuraMetrics): AuraPalette {
  const s = clamp01(metrics.social);
  const c = clamp01(metrics.chaos);
  const f = clamp01(metrics.focus);
  const z = clamp01(metrics.sleep);

  const warmth = Math.min(
    1,
    Math.max(0, 0.45 * c + 0.35 * z + 0.2 * (1 - f)),
  );
  const chill = Math.min(1, Math.max(0, 0.4 * f + 0.35 * s * 0.5));
  const colorTemp = Math.min(1, Math.max(0, warmth - chill * 0.35 + 0.5));

  const cool: [number, number, number] = [0.0, 0.75, 0.85];
  const warm: [number, number, number] = [1.0, 0.65, 0.35];
  const primaryRgb: [number, number, number] = [
    cool[0] + (warm[0] - cool[0]) * colorTemp,
    cool[1] + (warm[1] - cool[1]) * colorTemp,
    cool[2] + (warm[2] - cool[2]) * colorTemp,
  ];

  const secondaryMix = Math.min(1, Math.max(0, 0.55 * f + 0.25 * (1 - c)));
  const secondaryRgb: [number, number, number] = [
    0.42 + 0.35 * secondaryMix,
    0.22 + 0.45 * (1 - secondaryMix),
    0.83 - 0.2 * secondaryMix,
  ];

  const accentRgb: [number, number, number] = [
    0.55 + 0.25 * s,
    0.35 + 0.2 * (1 - z),
    0.2 + 0.35 * c,
  ];

  const bgLift = 0.08 * (1 - z) + 0.05 * (1 - f);
  const backgroundRgb: [number, number, number] = [
    0.04 + bgLift,
    0.06 + bgLift * 1.1,
    0.09 + bgLift * 1.2,
  ];

  return {
    primary: toHex(primaryRgb),
    secondary: toHex(secondaryRgb),
    accent: toHex(accentRgb),
    background: toHex(backgroundRgb),
  };
}

export function clampAuraMetrics(metrics: AuraMetrics): AuraMetrics {
  const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));
  return {
    social: clamp(metrics.social),
    chaos: clamp(metrics.chaos),
    focus: clamp(metrics.focus),
    sleep: clamp(metrics.sleep),
  };
}
