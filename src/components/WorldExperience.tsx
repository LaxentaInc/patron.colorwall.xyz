"use client";

import React, { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent, motion } from "framer-motion";
import Link from "next/link";
import { WorldEngine } from "@/lib/engine/WorldEngine";
import { Volume2, VolumeX, ArrowLeft, Compass, Sparkles } from "lucide-react";

// world experience component mounting our custom three.js webgl engine
export function WorldExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<WorldEngine | null>(null);

  const [isEngineReady, setIsEngineReady] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [scrollPercent, setScrollPercent] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // framer motion scroll progress tracker across the 500vh container
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

    // instantiate our custom clean webgl engine
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
    <div ref={containerRef} className="relative w-full h-[550vh] bg-[#050c18] select-none">
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
          {/* return to top button commented out per user request */}
          {/*
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group pointer-events-auto inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 hover:border-amber-400/50 text-white/90 hover:text-white font-[family-name:var(--font-outfit)] text-xs tracking-wider transition-all duration-300 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.6)] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">SCROLL TO TOP</span>
          </button>
          */}
          <div />

          {/* right controls: audio ambiance and clean hud telemetry */}
          <div className="flex items-center gap-5 pointer-events-auto">
            <button
              onClick={toggleAudio}
              className="text-white/60 hover:text-white transition-colors cursor-pointer p-1"
              title={isAudioMuted ? "Play Ambiance" : "Mute Ambiance"}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-white" />}
            </button>

            {/* clean unboxed altitude telemetry without pill containers */}
            <div className="font-mono text-xs tracking-[0.25em] text-white/60 select-none">
              ALTITUDE {Math.round(150 + scrollPercent * 650)}M
            </div>
          </div>
        </header>

        {/* cinematic chapter overlays synchronized with scroll progress */}
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center p-6 md:p-16">
        
          {/* chapter 2: the ridge and falcon flight */}
          <motion.div
            className="absolute top-1/3 right-6 md:right-24 max-w-lg text-right"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: scrollPercent >= 0.28 && scrollPercent < 0.65 ? 1 : 0,
              y: scrollPercent >= 0.28 && scrollPercent < 0.65 ? 0 : 20,
            }}
            transition={{ duration: 0.5 }}
          >
            {/* <div className="font-mono text-xs tracking-[0.25em] text-white/50 uppercase mb-3">
              Hi THERE!
            </div> */}
            <h2 className="font-[family-name:var(--font-outfit)] text-2xl md:text-4xl font-extralight text-white tracking-tight mb-2">
              THE COLORWALL TEAM!
            </h2>
            <p className="font-[family-name:var(--font-outfit)] text-sm md:text-base text-white/60 font-light leading-relaxed">
              We are us, we make cool stuff when we feel bored, and get bored when we make cool stuff, it is a cycle but atleast we make cool stuff
            </p>
          </motion.div>

          {/* chapter 3: climax and patron cta */}
          <motion.div
            className="absolute flex flex-col items-center justify-center text-center max-w-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: scrollPercent >= 0.72 ? 1 : 0,
              scale: scrollPercent >= 0.72 ? 1 : 0.95,
              pointerEvents: scrollPercent >= 0.72 ? "auto" : "none",
            }}
            transition={{ duration: 0.5 }}
          >
            <div className="font-mono text-xs tracking-[0.25em] text-white/55 uppercase mb-4">
              
            </div>
            <h2 className="font-[family-name:var(--font-outfit)] text-3xl md:text-6xl font-light text-white tracking-tight leading-tight mb-4">
              Tag along us :D
            </h2>
            <p className="font-[family-name:var(--font-outfit)] text-base md:text-xl text-white/70 font-light max-w-lg leading-relaxed mb-8">
              Back our vision early to gain access to nightly builds, and VIP tiers. And well , you could also say that you are a multi-millionare.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/#patron-tiers"
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-[family-name:var(--font-outfit)] text-sm font-semibold tracking-wider hover:bg-neutral-200 active:scale-95 transition-all duration-300"
              >
                <span>BECOME A PATRON  &lt;3</span>
                <Sparkles className="w-4 h-4 text-black group-hover:rotate-12 transition-transform duration-300" />
              </Link>
            </div>
          </motion.div>

        </div>

        {/* initial loading indicator overlay while textures and geometries parse */}
        {!isEngineReady && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050c18] text-white">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-white/10 border-t-amber-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border-2 border-white/10 border-b-orange-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
            </div>
            <div className="text-xs font-mono tracking-[0.25em] text-white/70 uppercase">
              COMPLINING ASSETS
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
