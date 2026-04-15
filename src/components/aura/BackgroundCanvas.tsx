"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { memo, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { AuraGradientUniforms } from "@/hooks/useAuraGradient";
import {
  AURA_FRAGMENT_SHADER,
  AURA_VERTEX_SHADER,
} from "@/hooks/useAuraGradient";

interface AuraShaderMeshProps {
  uniforms: AuraGradientUniforms;
}

const AuraShaderMesh = memo(function AuraShaderMesh({
  uniforms,
}: AuraShaderMeshProps) {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const { size, viewport } = useThree();

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: uniforms as unknown as { [key: string]: THREE.IUniform },
        vertexShader: AURA_VERTEX_SHADER,
        fragmentShader: AURA_FRAGMENT_SHADER,
        depthTest: false,
        depthWrite: false,
      }),
    [uniforms],
  );

  useLayoutEffect(() => {
    materialRef.current = material;
    return () => {
      material.dispose();
      materialRef.current = null;
    };
  }, [material]);

  useFrame((state) => {
    const m = materialRef.current;
    if (!m) return;
    const uRes = m.uniforms.uResolution as { value: THREE.Vector2 };
    uRes.value.set(size.width, size.height);
    (m.uniforms.uTime as { value: number }).value = state.clock.elapsedTime;
  });

  return (
    <mesh position={[0, 0, 0]} material={material}>
      <planeGeometry args={[viewport.width, viewport.height]} />
    </mesh>
  );
});

export interface BackgroundCanvasProps {
  uniforms: AuraGradientUniforms;
  className?: string;
}

export const BackgroundCanvas = memo(function BackgroundCanvas({
  uniforms,
  className,
}: BackgroundCanvasProps) {
  return (
    <div className={className ?? "fixed inset-0 -z-20 h-full w-full"}>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1, near: 0, far: 10 }}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        dpr={[1, 2]}
        frameloop="always"
      >
        <AuraShaderMesh uniforms={uniforms} />
      </Canvas>
    </div>
  );
});
