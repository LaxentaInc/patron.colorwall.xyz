"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function DustParticles({ count = 2500 }) {
  const pointsRef = useRef<THREE.Points>(null);

  // generate stars strictly in the background volume behind the scene
  // this guarantees they are clearly visible while preventing foreground orbs
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 60;     // x spread: -30 to 30
      p[i * 3 + 1] = (Math.random() - 0.5) * 50; // y spread: -25 to 25
      p[i * 3 + 2] = -5 - Math.random() * 25;    // z depth: -5 to -30 (strictly behind camera)
    }
    return p;
  }, [count]);

  // subtle ambient drift for the starfield
  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.z += delta / 60;
      pointsRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.06}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.85}
      />
    </Points>
  );
}

export function SpaceDust() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <DustParticles count={3000} />
      </Canvas>
    </div>
  );
}
