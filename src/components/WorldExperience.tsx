"use client";

import React, { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent, motion } from "framer-motion";
import { WorldEngine } from "@/lib/engine/WorldEngine";
import { Volume2, VolumeX, Sparkles, Check } from "lucide-react";

// world experience component mounting multi-scene 3d engine with floating islands and lake sanctuary
export function WorldExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<WorldEngine | null>(null);

  const [isEngineReady, setIsEngineReady] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [scrollPercent, setScrollPercent] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // framer motion scroll progress tracker across the expanded 1400vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // feed scroll progress updates directly into the engine
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setScrollPercent(latest);
    if (engineRef.current) {
      engineRef.current.setScrollProgress(latest);
    }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // instantiate our custom multi-scene webgl engine
    const engine = new WorldEngine(canvas);
    engineRef.current = engine;

    engine
      .init()
      .then(() => {
        setIsEngineReady(true);
      })
      .catch((err) => {
        console.error("failed to boot world engine:", err);
      });

    // mouse move listener for parallax camera look-at tilt
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      engine.setMousePosition(normX, normY);
    };

    // window resize handler to maintain responsive projection
    const handleResize = () => {
      engine.onResize();
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // viewport observer to halt three.js render loop when out of screen, eliminating background gpu load
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!engineRef.current) return;
          if (entry.isIntersecting) {
            engineRef.current.start();
          } else {
            engineRef.current.stop();
          }
        });
      },
      { rootMargin: "300px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [isEngineReady]);

  // audio toggle handler
  const toggleAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/track-by-hebel.opus");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.45;
    }

    if (isAudioMuted) {
      audioRef.current
        .play()
        .then(() => setIsAudioMuted(false))
        .catch((err) => console.warn("audio play blocked by browser:", err));
    } else {
      audioRef.current.pause();
      setIsAudioMuted(true);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-[1400vh] bg-[#050c18] select-none">
      {/* audio element holder */}
      <audio ref={audioRef} src="/track-by-hebel.opus" preload="none" loop />

      {/* fixed sticky viewport hosting the webgl canvas */}
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        {/* primary three.js webgl canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block touch-none pointer-events-auto"
        />

        {/* top navigation bar */}
        <header className="fixed top-6 left-6 right-6 z-40 flex items-center justify-between pointer-events-none">
          <div />

          {/* right controls: audio ambiance and clean unboxed hud telemetry */}
          <div className="flex items-center gap-5 pointer-events-auto">
            <button
              onClick={toggleAudio}
              className="text-white/60 hover:text-white transition-colors cursor-pointer p-1"
              title={isAudioMuted ? "Play Ambiance" : "Mute Ambiance"}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-white" />}
            </button>

            {/* dynamic unboxed telemetry displaying altitude across all 3 phases */}
            <div className="font-mono text-xs tracking-[0.25em] text-white/60 select-none">
              {scrollPercent < 0.35
                ? `ALTITUDE ${Math.round(150 + (scrollPercent / 0.35) * 650)}M`
                : scrollPercent < 0.70
                ? `ALTITUDE // ${Math.round(450 + ((scrollPercent - 0.35) / 0.35) * 650)}M`
                : `ALTITUDE 22M // LAKE LEVEL`}
            </div>
          </div>
        </header>

        {/* cinematic chapter overlays synchronized with scroll progress */}
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center p-6 md:p-16">
          {/* chapter 1: the team intro */}
          <motion.div
            className="absolute top-1/3 right-6 md:right-24 max-w-lg text-right"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: scrollPercent >= 0.12 && scrollPercent < 0.26 ? 1 : 0,
              y: scrollPercent >= 0.12 && scrollPercent < 0.26 ? 0 : 20,
            }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-[family-name:var(--font-outfit)] text-2xl md:text-4xl font-extralight text-white tracking-tight mb-2">
              THE COLORWALL TEAM!
            </h2>
            <p className="font-[family-name:var(--font-outfit)] text-sm md:text-base text-white/60 font-light leading-relaxed">
              We are us, we make cool stuff when we feel bored, and get bored when we make cool stuff, it is a cycle but atleast we make cool stuff
            </p>
          </motion.div>

          {/* chapter 2: mountain pass climax and patron warp trigger */}
          <motion.div
            className="absolute flex flex-col items-center justify-center text-center max-w-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: scrollPercent >= 0.26 && scrollPercent < 0.37 ? 1 : 0,
              scale: scrollPercent >= 0.26 && scrollPercent < 0.37 ? 1 : 0.95,
              pointerEvents: scrollPercent >= 0.26 && scrollPercent < 0.37 ? "auto" : "none",
            }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-[family-name:var(--font-outfit)] text-3xl md:text-6xl font-light text-white tracking-tight leading-tight mb-4">
              Tag along us :D
            </h2>
            <p className="font-[family-name:var(--font-outfit)] text-base md:text-xl text-white/70 font-light max-w-lg leading-relaxed mb-8">
              Back our vision early to gain access to nightly builds, and VIP tiers. And well, you could also say that you are a multi-millionaire.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => engineRef.current?.warpToLake()}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-[family-name:var(--font-outfit)] text-sm font-semibold tracking-wider hover:bg-neutral-200 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <span>BECOME A PATRON &lt;3</span>
                <Sparkles className="w-4 h-4 text-black group-hover:rotate-12 transition-transform duration-300" />
              </button>
            </div>
          </motion.div>

          {/* chapter 3: floating island expanse in stratosphere */}
          <motion.div
            className="absolute bottom-24 left-6 md:left-24 max-w-md text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: scrollPercent >= 0.44 && scrollPercent < 0.62 ? 1 : 0,
              y: scrollPercent >= 0.44 && scrollPercent < 0.62 ? 0 : 20,
            }}
            transition={{ duration: 0.5 }}
          >
            {/* <div className="font-mono text-xs tracking-[0.3em] text-white/50 uppercase mb-2">
              THE UPPER EXPANSION
            </div> */}
            <h2 className="font-[family-name:var(--font-outfit)] text-2xl md:text-4xl font-extralight text-white tracking-tight mb-2">
              Sky's the Limit
            </h2>
            <p className="font-[family-name:var(--font-outfit)] text-sm md:text-base text-white/60 font-light leading-relaxed">
             We welcome everyone who want's to be a patron, or just appretiates the work, Oi Oi &lt;3 we whole heartedly thank you!!
            </p>
          </motion.div>

          {/* phase 3: lake sanctuary patron tiers overlay */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center p-4 md:p-12 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: scrollPercent >= 0.72 ? 1 : 0,
              y: scrollPercent >= 0.72 ? 0 : 30,
              pointerEvents: scrollPercent >= 0.72 ? "auto" : "none",
            }}
            transition={{ duration: 0.6 }}
          >
            <div className="max-w-4xl mx-auto mb-8">
              <div className="font-mono text-xs tracking-[0.3em] text-white/50 uppercase mb-2">
                COLORWALL SANCTUARY
              </div>
              <h2 className="font-[family-name:var(--font-outfit)] text-3xl md:text-5xl font-light text-white tracking-tight mb-3">
                Shape The Foundation
              </h2>
              <p className="font-[family-name:var(--font-outfit)] text-sm md:text-base text-white/60 font-light max-w-xl mx-auto">
                Directly fuel independent graphics programming, composite shader runtimes, and local sandbox performance.
              </p>
            </div>

            {/* clean unboxed tier cards floating over the lake */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left">
              {/* tier 1: supporter */}
              <div className="p-6 md:p-8 bg-black/40 border border-white/10 backdrop-blur-md flex flex-col justify-between hover:border-white/25 transition-all duration-300">
                <div>
                  <div className="font-mono text-xs tracking-wider text-white/50 uppercase mb-1">
                    TIER 01
                  </div>
                  <h3 className="font-[family-name:var(--font-outfit)] text-xl font-medium text-white mb-2">
                    Supporter
                  </h3>
                  <div className="text-2xl font-light text-white mb-6">
                    $5<span className="text-xs text-white/50 font-normal"> / month</span>
                  </div>
                  <ul className="space-y-3 mb-8 text-xs font-light text-white/70">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-white/80 shrink-0" />
                      <span>Nightly bleeding-edge test builds</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-white/80 shrink-0" />
                      <span>Backer role in private Discord</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-white/80 shrink-0" />
                      <span>Name listed in ColorWall app credits</span>
                    </li>
                  </ul>
                </div>
                <a
                  href="https://patreon.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-3 border border-white/20 hover:border-white/60 text-white font-[family-name:var(--font-outfit)] text-xs uppercase tracking-wider transition-colors duration-200"
                >
                  Join as Supporter
                </a>
              </div>

              {/* tier 2: pioneer */}
              <div className="p-6 md:p-8 bg-black/50 border border-white/25 backdrop-blur-md flex flex-col justify-between hover:border-white/50 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <div>
                  <div className="font-mono text-xs tracking-wider text-white/70 uppercase mb-1">
                    TIER 02 // RECOMMENDED
                  </div>
                  <h3 className="font-[family-name:var(--font-outfit)] text-xl font-medium text-white mb-2">
                    Pioneer
                  </h3>
                  <div className="text-2xl font-light text-white mb-6">
                    $15<span className="text-xs text-white/50 font-normal"> / month</span>
                  </div>
                  <ul className="space-y-3 mb-8 text-xs font-light text-white/70">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-white/80 shrink-0" />
                      <span>All Supporter benefits included</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-white/80 shrink-0" />
                      <span>Access to beta composite scene shaders</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-white/80 shrink-0" />
                      <span>Interactive widget runtime SDK docs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-white/80 shrink-0" />
                      <span>Direct voting power on engine features</span>
                    </li>
                  </ul>
                </div>
                <a
                  href="https://patreon.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-3 bg-white text-black hover:bg-neutral-200 font-[family-name:var(--font-outfit)] text-xs font-semibold uppercase tracking-wider transition-colors duration-200"
                >
                  Join as Pioneer
                </a>
              </div>

              {/* tier 3: architect */}
              <div className="p-6 md:p-8 bg-black/40 border border-white/10 backdrop-blur-md flex flex-col justify-between hover:border-white/25 transition-all duration-300">
                <div>
                  <div className="font-mono text-xs tracking-wider text-white/50 uppercase mb-1">
                    TIER 03
                  </div>
                  <h3 className="font-[family-name:var(--font-outfit)] text-xl font-medium text-white mb-2">
                    Architect
                  </h3>
                  <div className="text-2xl font-light text-white mb-6">
                    $35<span className="text-xs text-white/50 font-normal"> / month</span>
                  </div>
                  <ul className="space-y-3 mb-8 text-xs font-light text-white/70">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-white/80 shrink-0" />
                      <span>All Pioneer benefits included</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-white/80 shrink-0" />
                      <span>Direct 1-on-1 developer channels</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-white/80 shrink-0" />
                      <span>Custom scene wallpaper featured in studio</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-white/80 shrink-0" />
                      <span>Source binary format documentation</span>
                    </li>
                  </ul>
                </div>
                <a
                  href="https://patreon.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center py-3 border border-white/20 hover:border-white/60 text-white font-[family-name:var(--font-outfit)] text-xs uppercase tracking-wider transition-colors duration-200"
                >
                  Join as Architect
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* initial loading indicator overlay while textures and geometries parse */}
        {!isEngineReady && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050c18] text-white">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-white/10 border-t-white/80 animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-white/10 border-b-white/50 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
            </div>
            <div className="text-xs font-mono tracking-[0.25em] text-white/70 uppercase">
              COMPILING 3D SCENE
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
