"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// -------------------------------------------------------------------------
// webgl particle swirl background.
// generates 4000 particles in a swirling torus shape with gold/amber colors.
// the particle field rotates slowly on the y-axis and oscillates on x,
// creating an ambient living background behind the editorial text overlay.
// -------------------------------------------------------------------------
function ParticleSwirl() {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const count = 4000;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const radius = 2 + Math.random() * 8;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 10;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      // interpolate from bright gold to deep amber based on radial distance
      const mix = (radius - 2) / 8;
      color.lerpColors(new THREE.Color("#FDE047"), new THREE.Color("#B45309"), mix);
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

// -------------------------------------------------------------------------
// patreon-inspired nav bar.
// 3-column grid: left text links, center brand wordmark, right cta pills.
// uses the nav-link-hover class from globals.css for the label slide effect.
// fixed at top with z-50, semi-transparent backdrop.
// -------------------------------------------------------------------------
function NavBar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50" style={{ transform: "translateY(1.3rem)" }}>
      <div
        className="grid items-center w-full"
        style={{
          gridTemplateColumns: "1fr auto 1fr",
          padding: "var(--spacing-sm) var(--spacing-lg)",
        }}
      >
        {/* left nav links - desktop only */}
        <nav className="hidden md:flex items-center gap-1">
          {["Features", "Tiers", "Community"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="nav-link-hover text-white text-sm"
              data-label={label}
              style={{
                padding: "1.5rem 2.4rem",
                fontWeight: 350,
                letterSpacing: "-0.032rem",
              }}
            >
              <span className="label-text">{label}</span>
            </a>
          ))}
        </nav>

        {/* center - brand name. patreon uses their svg wordmark here,
            we use text styled to match their wordmark proportions */}
        <div className="flex items-center justify-center">
          <a
            href="/"
            className="text-white font-semibold tracking-tight"
            style={{ fontSize: "1.4rem", letterSpacing: "-0.02em" }}
          >
            COLORWALL
          </a>
        </div>

        {/* right ctas - pill buttons matching patreon's bordered + filled style */}
        <div className="hidden md:flex items-center justify-end gap-3">
          <a
            href="https://colorwall.xyz"
            className="pill-button secondary text-white"
          >
            <span className="btn-label">Main Site</span>
          </a>
          <a
            href="#join"
            className="pill-button primary"
          >
            <span className="btn-label">Get Started</span>
          </a>
        </div>
      </div>
    </header>
  );
}

// -------------------------------------------------------------------------
// hero section - the main export.
// follows patreon's editorial hero pattern:
//   - full viewport height
//   - webgl canvas as background (our unique twist vs patreon's photos)
//   - massive thin text anchored bottom-left with mix-blend-mode: exclusion
//   - scroll arrow at bottom-left, matching patreon's scroll indicator
//   - radial gradient overlay for depth and readability
// -------------------------------------------------------------------------
export const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden" style={{ height: "100vh" }}>

      {/* webgl canvas background - replaces patreon's photo carousel with live particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 2, 12], fov: 60 }}>
          <fog attach="fog" args={["#000000", 5, 20]} />
          <ParticleSwirl />
        </Canvas>
      </div>

      {/* radial gradient overlay - darkens edges for text readability,
          same technique patreon uses over their photo backgrounds */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.95) 100%)",
        }}
      />

      {/* nav bar */}
      <NavBar />

      {/* hero text - anchored bottom-left, matching patreon's title-wrapper positioning.
          patreon uses left: calc(5rem + var(--rem-scale-viewport-half-excess)),
          we simplify to padding-based positioning. */}
      <div
        className="absolute z-10 w-full"
        style={{
          bottom: 0,
          padding: "0 max(env(safe-area-inset-right, 0px), 5rem) 0.17em max(env(safe-area-inset-left, 0px), 5rem)",
          lineHeight: 0.98,
          pointerEvents: "none",
        }}
      >
        {/* first line - left aligned, with right padding to leave room for
            the creator card area (patreon puts cards at right side) */}
        <span className="hero-heading block" style={{ textAlign: "left" }}>
          Fuel the
        </span>
        {/* second line - right aligned + indented, matching patreon's
            alternating text alignment pattern */}
        <span
          className="hero-heading block"
          style={{
            textAlign: "right",
            paddingRight: "max(env(safe-area-inset-right, 0px), 5rem)",
            marginBottom: "2rem",
          }}
        >
          future of desktop
        </span>
      </div>

      {/* creator info card - positioned right side like patreon's hero cards.
          shows the project context alongside the massive headline. */}
      <div
        className="absolute z-10 hidden md:flex items-center gap-6"
        style={{
          right: "max(env(safe-area-inset-right, 0px), 5rem)",
          top: "50%",
          marginTop: "5rem",
          width: "34.5rem",
          fontSize: "0.95rem",
          fontWeight: 350,
          lineHeight: "110%",
          letterSpacing: "-0.036rem",
          color: "white",
        }}
      >
        {/* circular avatar placeholder - matches patreon's 5em avatar circles */}
        <div
          className="flex-shrink-0 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center"
          style={{ width: "5em", height: "5em" }}
        >
          <span className="text-black font-bold text-xl">CW</span>
        </div>
        <div>
          <h3 className="font-medium" style={{ lineHeight: 1.2 }}>
            Colorwall is building the ultimate desktop wallpaper engine
          </h3>
          <p className="mt-1 opacity-50" style={{ lineHeight: 1.2 }}>
            Rust + Tauri · DirectX 11 · Free forever →
          </p>
        </div>
      </div>

      {/* scroll down arrow - bottom left, matching patreon's home-arrow positioning.
          patreon uses a 7rem svg at left: 5rem, bottom: 5rem */}
      <button
        className="absolute z-20 animate-arrow-bounce"
        style={{
          left: "max(env(safe-area-inset-left, 0px), 5rem)",
          bottom: "5rem",
          width: "3.5rem",
          height: "3.5rem",
          appearance: "none",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          color: "white",
        }}
        aria-label="Scroll down"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </button>
    </section>
  );
};
