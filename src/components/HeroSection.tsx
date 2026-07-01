"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Typewriter } from "react-simple-typewriter";
import { Crown, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { GradientHeading } from "./GradientHeading";

// WebGL Background Component
function ParticleSwirl() {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate particles
  const [positions, colors] = useMemo(() => {
    const particleCount = 4000;
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const color = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
      const radius = 2 + Math.random() * 8;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 10;
      
      // Swirl equation
      const x = Math.cos(angle) * radius;
      const y = height;
      const z = Math.sin(angle) * radius;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      // Gold/Amber color gradient based on radius
      const mixRatio = (radius - 2) / 8;
      color.lerpColors(new THREE.Color("#FDE047"), new THREE.Color("#B45309"), mixRatio);
      
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial 
        size={0.05} 
        vertexColors 
        transparent 
        opacity={0.6} 
        sizeAttenuation 
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black text-white">
      {/* WebGL Canvas Background */}
      <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
        <Canvas camera={{ position: [0, 2, 12], fov: 60 }}>
          <fog attach="fog" args={["#000000", 5, 20]} />
          <ParticleSwirl />
        </Canvas>
      </div>

      {/* Radial Gradient Overlay for depth */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_80%,rgba(0,0,0,1)_100%)] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 flex flex-col items-center text-center space-y-8 mt-12">
        
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-md animate-float">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-medium tracking-widest uppercase text-amber-200">
            Exclusive Access
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight drop-shadow-2xl">
          Support The Vision. <br className="hidden sm:block" />
          Become a <GradientHeading text="Patron" theme="gold" />
        </h1>

        {/* Typewriter Subtitle */}
        <div className="min-h-[3rem] md:min-h-[3.5rem] flex items-center justify-center text-sm md:text-lg font-mono text-white/80 drop-shadow-lg">
          <Typewriter
            words={[
              "< Get early access to beta builds >",
              "< Unlock exclusive studio features >",
              "< Direct communication with the developers >",
              "< Fuel the ultimate Wallpaper Engine alternative >"
            ]}
            loop={0}
            cursor
            cursorStyle={
              <span className="inline-block w-2 h-5 bg-amber-400 ml-1 animate-pulse" />
            }
            typeSpeed={40}
            deleteSpeed={20}
            delaySpeed={4000}
          />
        </div>

        {/* CTA Button */}
        <div className="pt-8">
          <div className="relative group inline-flex rounded-xl p-[2px] overflow-hidden hover:-translate-y-1 transition-transform duration-300">
            {/* Spinning edge glint */}
            <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#FBBF24_50%,transparent_100%)] opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
            
            <a
              href="https://patreon.com" // Placeholder link
              className="relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-[10px] bg-neutral-950 text-white font-bold text-sm sm:text-base tracking-wide hover:bg-neutral-900 transition-colors w-full sm:w-auto"
            >
              <Crown className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform duration-300" />
              Join the Vanguard
              <ArrowRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-mono pt-12 text-white/60 drop-shadow-md">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Secure via Patreon</span>
          <span className="opacity-30">·</span>
          <span className="flex items-center gap-1.5"><Crown className="w-4 h-4" /> Cancel Anytime</span>
        </div>

      </div>
    </section>
  );
};
