"use client";

import React, { useEffect, useRef, useState } from "react";

// world experience component that mounts the interactive 3d engine
// when the user scrolls through the tail of the rock sequence.
export function WorldExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // load the engine script dynamically on client mount
    let scriptElement: HTMLScriptElement | null = null;

    const loadEngine = async () => {
      if (typeof window === "undefined") return;

      const loadScript = (src: string, isModule = false): Promise<void> => {
        return new Promise((resolve, reject) => {
          const existing = document.querySelector(`script[src="${src}"]`);
          if (existing) {
            resolve();
            return;
          }
          const s = document.createElement("script");
          s.src = src;
          if (isModule) s.type = "module";
          s.async = true;
          s.onload = () => resolve();
          s.onerror = (e) => reject(e);
          document.body.appendChild(s);
        });
      };

      try {
        // load core vendor bundle first, then custom logic
        await loadScript("/assets/_astro/hoisted.D5QinsOB.js", true);
        await loadScript("/assets/custom_logic.js", false);

        if ((window as any).__bootWorldEngine) {
          (window as any).__bootWorldEngine();
          setIsLoaded(true);
        }
      } catch (err) {
        console.error("failed to load world engine runtime:", err);
      }
    };

    loadEngine();

    return () => {
      // keep the engine persistent once booted or clean up if unmounted
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="pages-container"
      className="relative w-full min-h-screen bg-black overflow-hidden"
      style={{ zIndex: 10 }}
    >
      <div id="home" className="relative w-full h-screen">
        {/* primary webgl canvas consumed by properties.renderer in engine */}
        <canvas
          id="canvas"
          className="w-full h-full block touch-none"
          style={{ width: "100%", height: "100%" }}
        />

        {/* hidden preloader dom nodes required by preloader.preinit */}
        <div id="preloader" style={{ display: "none" }}>
          <canvas id="preloader-canvas" />
          <span id="preloader-percent" />
          <div id="preloader-logo">
            <svg viewBox="0 0 100 100">
              <path d="M0 0 L100 100" />
              <rect x="0" y="0" width="10" height="10" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
