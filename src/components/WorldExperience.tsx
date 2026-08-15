"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

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

      // assign three symbols and legacy compatibility constants to window object
      (window as any).THREE = THREE;
      Object.assign(window, THREE, {
        LinearEncoding: 3000,
        sRGBEncoding: 3001,
        BasicDepthPacking: 3200,
        RGBADepthPacking: 3201,
      });

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
        // load the custom logic engine bundle directly
        await loadScript("/assets/custom_logic.js", true);

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
      className="fixed inset-0 w-full h-full overflow-hidden bg-black select-none touch-none"
      style={{ zIndex: 10 }}
    >
      {/* primary webgl canvas pinned permanently to the full viewport */}
      <canvas
        id="canvas"
        className="fixed inset-0 w-full h-full block pointer-events-auto"
        style={{ width: "100vw", height: "100vh", zIndex: 1 }}
      />

      {/* transition overlay canvas */}
      <canvas id="transition-canvas" style={{ display: "none" }} />

      {/* pages-container translated by ScrollManager without displacing canvas */}
      <div
        id="pages-container"
        className="absolute top-0 left-0 w-full pointer-events-none"
        style={{ zIndex: 2, minHeight: "800vh" }}
      >
        <div id="home" className="page relative w-full" style={{ minHeight: "800vh" }}>
          {/* scrollable section triggers that feed scrollManager dimensions */}
          <div id="home-hero" className="section relative w-full" style={{ minHeight: "100vh" }}>
            <div className="section__content">
              <div className="subtitle"></div>
              <div className="kicker"></div>
              <div className="title"></div>
            </div>
          </div>

          <div id="home-everblade" className="section relative w-full" style={{ minHeight: "100vh" }}>
            <div className="section__content">
              <div className="title">
                <span><span></span></span>
                <span><span></span></span>
              </div>
              <div className="description"></div>
              <div className="subtitle"><span></span></div>
              <div id="home-everblade__logo"></div>
              <canvas id="home-everblade__logo-canvas" />
            </div>
          </div>

          <div id="home-everclear" className="section relative w-full" style={{ minHeight: "100vh" }}>
            <div className="section__content">
              <div className="subtitle"></div>
              <div className="kicker"></div>
              <div className="title"></div>
            </div>
          </div>

          <div id="home-pool" className="section relative w-full" style={{ minHeight: "100vh" }}>
            <div className="section__content">
              <div className="title"><span></span></div>
              <div className="description"></div>
              <div id="home-pool__cta"><span></span><svg></svg></div>
            </div>
          </div>

          <div id="home-everyone" className="section relative w-full" style={{ minHeight: "100vh" }}>
            <div className="section__content">
              <div className="kicker"><span></span></div>
              <div id="home-everyone__lps">
                <div className="icon-wrapper"></div>
                <div className="title-wrapper"></div>
                <div className="title"></div>
                <div className="subtitle"></div>
              </div>
              <div id="home-everyone__borrowers">
                <div className="icon-wrapper"></div>
                <div className="title-wrapper"></div>
                <div className="title"></div>
                <div className="subtitle"></div>
              </div>
              <div id="home-everyone__traders">
                <div className="icon-wrapper"></div>
                <div className="title-wrapper"></div>
                <div className="title"></div>
                <div className="subtitle"></div>
              </div>
            </div>
          </div>

          <div id="home-evernet" className="section relative w-full" style={{ minHeight: "100vh" }}>
            <div className="section__content">
              <div id="home-evernet__logo"><svg></svg></div>
              <div className="title-wrapper"><div className="title"><span></span></div></div>
              <div className="description"></div>
              <div className="subtitle"></div>
              <canvas id="home-evernet__logo-canvas" />
            </div>
          </div>

          <div id="home-relayers" className="section relative w-full" style={{ minHeight: "100vh" }}>
            <div className="section__content">
              <div className="title-wrapper"><div className="title"></div></div>
              <div className="description"></div>
              <div className="logo"></div>
              <canvas id="home-relayers__logo-canvas" />
            </div>
          </div>

          <div id="home-join" className="section relative w-full" style={{ minHeight: "100vh" }}>
            <div className="section__content">
              <div className="title"><span></span></div>
              <div className="subtitle"></div>
              <div id="home-join__buttons"><a></a></div>
            </div>
          </div>

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
    </div>
  );
}
