"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { clampAuraMetrics, computeAuraPalette } from "@/lib/aura/aura-palette";
import type { AuraMetrics, AuraPalette } from "@/lib/aura/types";

export const AURA_VERTEX_SHADER = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/**
 * Full-screen Aura fragment shader. Metrics are supplied as normalized floats
 * via uniforms so the GPU can animate without recompilation.
 */
export const AURA_FRAGMENT_SHADER = /* glsl */ `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uSocial;
uniform float uChaos;
uniform float uFocus;
uniform float uSleep;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = rot * p * 2.0 + vec2(100.0);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / uResolution.xy;
  vec2 p = uv * 2.0 - 1.0;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  p.x *= aspect;

  float warmth = clamp(0.45 * uChaos + 0.35 * uSleep + 0.2 * (1.0 - uFocus), 0.0, 1.0);
  float chill = clamp(0.4 * uFocus + 0.35 * uSocial * 0.5, 0.0, 1.0);
  float colorTemp = clamp(warmth - chill * 0.35 + 0.5, 0.0, 1.0);

  vec3 cool = vec3(0.0, 0.75, 0.85);
  vec3 warm = vec3(1.0, 0.65, 0.35);
  vec3 base = mix(cool, warm, colorTemp);

  float rotSpeed = mix(0.08, 1.25, uChaos) * (0.5 + 0.5 * uFocus);
  float angle = uTime * rotSpeed;
  float c = cos(angle);
  float s = sin(angle);
  p = mat2(c, -s, s, c) * p;

  float flow = fbm(p * 1.8 + uTime * 0.15 + uSocial * 0.4);
  float swirl = fbm(p.yx * 2.1 - uTime * 0.12 + uFocus * 0.35);
  vec3 field = mix(base, base.zxy, 0.25 + 0.35 * swirl);
  field = mix(field, field.yzx, 0.15 + 0.45 * flow);

  float grainAmt = mix(0.02, 0.18, uChaos) + 0.03 * uSleep;
  float g = hash(frag * 0.35 + uTime * 60.0) - 0.5;
  field += vec3(g) * grainAmt;

  float vignette = smoothstep(1.35, 0.35, length(uv - 0.5) * 1.9);
  field *= 0.85 + 0.25 * vignette;

  gl_FragColor = vec4(field, 1.0);
}
`;

export interface AuraGradientUniforms {
  uResolution: { value: THREE.Vector2 };
  uTime: { value: number };
  uSocial: { value: number };
  uChaos: { value: number };
  uFocus: { value: number };
  uSleep: { value: number };
}

export interface UseAuraGradientResult {
  /** Raw GLSL fragment source; reads Social/Chaos/Focus/Sleep via uniforms. */
  fragmentShader: string;
  vertexShader: string;
  uniforms: AuraGradientUniforms;
  palette: AuraPalette;
  metrics: AuraMetrics;
}

function createUniforms(metrics: AuraMetrics): AuraGradientUniforms {
  const s = metrics.social / 100;
  const c = metrics.chaos / 100;
  const f = metrics.focus / 100;
  const z = metrics.sleep / 100;
  return {
    uResolution: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uSocial: { value: s },
    uChaos: { value: c },
    uFocus: { value: f },
    uSleep: { value: z },
  };
}

/**
 * @param social 0–100 — social battery drain
 * @param chaos 0–100 — mental noise
 * @param focus 0–100 — flow / focus
 * @param sleep 0–100 — sleep debt
 */
export function useAuraGradient(
  social: number,
  chaos: number,
  focus: number,
  sleep: number,
): UseAuraGradientResult {
  const metrics = useMemo(
    () => clampAuraMetrics({ social, chaos, focus, sleep }),
    [social, chaos, focus, sleep],
  );

  const palette = useMemo(() => computeAuraPalette(metrics), [metrics]);

  const uniformsRef = useRef<AuraGradientUniforms | null>(null);
  if (!uniformsRef.current) {
    uniformsRef.current = createUniforms(metrics);
  }
  const uniforms = uniformsRef.current;
  uniforms.uSocial.value = metrics.social / 100;
  uniforms.uChaos.value = metrics.chaos / 100;
  uniforms.uFocus.value = metrics.focus / 100;
  uniforms.uSleep.value = metrics.sleep / 100;

  return useMemo(
    () => ({
      fragmentShader: AURA_FRAGMENT_SHADER,
      vertexShader: AURA_VERTEX_SHADER,
      uniforms,
      palette,
      metrics,
    }),
    [uniforms, palette, metrics],
  );
}
