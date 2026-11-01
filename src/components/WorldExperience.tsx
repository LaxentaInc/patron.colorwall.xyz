"use client";

import React, { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent, motion } from "framer-motion";
import { WorldEngine } from "@/lib/engine/WorldEngine";
import { Volume2, VolumeX, Sparkles, Check, Copy, X } from "lucide-react";

const LIQUID_ADDRESS = "lq1qqwtc98th06ulteyzkegdu8rtyetmrrlcxakml0qtcqgpq3f2tq5j0t0vpx3au2wnpkrthtre4alqlt7z0dc9z0zj0an7wwezt";

export function WorldExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<WorldEngine | null>(null);

  const [isEngineReady, setIsEngineReady] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // sync audio mute state with global soundtrack manager
  useEffect(() => {
    const handleStateChange = (e: Event) => {
      const custom = e as CustomEvent<{ isMuted: boolean }>;
      if (custom.detail) {
        setIsAudioMuted(custom.detail.isMuted);
      }
    };
    window.addEventListener("ambient-soundtrack-state", handleStateChange);
    return () => window.removeEventListener("ambient-soundtrack-state", handleStateChange);
  }, []);

  // helper copying liquid wallet address with user feedback timeout
  const handleCopyAddress = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(LIQUID_ADDRESS);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2500);
    }
  };
 
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

  // audio toggle handler triggering global ambient soundtrack engine
  const toggleAudio = () => {
    window.dispatchEvent(new CustomEvent("toggle-ambient-soundtrack"));
  };

  return (
    <div ref={containerRef} className="relative w-full h-[1400vh] bg-[#050c18] select-none">
      {/* fixed sticky viewport hosting the webgl canvas */}
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        {/* primary three.js webgl canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block touch-none pointer-events-auto"
        />

        <header className="fixed top-6 left-6 right-6 z-40 flex items-center justify-between pointer-events-none">
          <div />

          <div className="flex items-center gap-5 pointer-events-auto">
            <button
              onClick={toggleAudio}
              className="text-white/60 hover:text-white transition-colors cursor-pointer p-1"
              title={isAudioMuted ? "Play Ambiance" : "Mute Ambiance"}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-white" />}
            </button>

            <div className="font-mono text-xs tracking-[0.25em] text-white/60 select-none">
              {scrollPercent < 0.35
                ? `ALTITUDE ${Math.round(150 + (scrollPercent / 0.35) * 650)}M`
                : scrollPercent < 0.70
                ? `ALTITUDE ${Math.round(450 + ((scrollPercent - 0.35) / 0.35) * 650)}M`
                : `ALTITUDE 22M; LAKE LEVEL`}
            </div>
          </div>
        </header>

        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center p-6 md:p-16">
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
              <p
                // type="button"
                // onClick={() => engineRef.current?.warpToLake()}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-[family-name:var(--font-outfit)] text-sm font-semibold tracking-wider hover:bg-neutral-200 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <span>Keep scrolling!</span>
                <Sparkles className="w-4 h-4 text-black group-hover:rotate-12 transition-transform duration-300" />
              </p>
            </div>
          </motion.div>

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
            {/* why was this in caps? */}
            <div className="max-w-3xl mx-auto mb-6 text-center">
              <h2 className="font-[family-name:var(--font-outfit)] text-2xl md:text-3xl font-light text-white tracking-tight mb-2">
                The Laxenta team (it&apos;s just me)
              </h2>
              <p className="font-[family-name:var(--font-outfit)] text-xs md:text-sm text-white/60 font-light max-w-lg mx-auto">
                Directly fuel independent programming, opensource projects, runtime upgrades of colorwall and it&apos;s sister products, and aura of the developer too.
              </p>
              <p className="text-xs md:text-sm text-white/60 font-light mt-1">
                All at once, You are this cool.
              </p>
            </div>

            <div className="max-w-xl w-full bg-black/75 border border-white/15 backdrop-blur-xl p-7 sm:p-9 text-left shadow-[0_24px_64px_rgba(0,0,0,0.9)] relative z-20 pointer-events-auto">
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <h3 className="font-[family-name:var(--font-bilbo)] text-4xl sm:text-5xl text-white tracking-wide">
                  Buy us a Coffee &lt;3
                </h3>
              </div>

              <p className="font-[family-name:var(--font-outfit)] text-xs sm:text-sm text-neutral-300 font-light leading-relaxed mb-6">
                Contribute whatever you want, anything you do will always help the development.
              </p>

              <div className="mb-6">
                <div className="text-[11px] font-mono tracking-wider text-white/45 mb-2.5">
                  We will thank you with:
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-light text-neutral-200">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-3.5 h-3.5 text-white/80 shrink-0" />
                    <span>Discounts on all Colorwall products, Well upcoming ones; It's still in development.</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-3.5 h-3.5 text-white/80 shrink-0" />
                    <span>Upcoming Community Minecraft server access! Early too!</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-3.5 h-3.5 text-white/80 shrink-0" />
                    <span>Browser Extension &amp; in app plugin/creator memberships</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-3.5 h-3.5 text-white/80 shrink-0" />
                    <span className="text-white font-medium">Coolest Discord role and lots of love too!</span>
                  </li>
                </ul>
              </div>

              {/* action buttons row */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                {/* buy me a coffee trigger button opening the bitcoin liquid modal */}
                <button
                  type="button"
                  onClick={() => setIsWalletModalOpen(true)}
                  className="w-full sm:flex-1 inline-flex items-center justify-center gap-2.5 py-3 px-5 bg-white text-black hover:bg-neutral-200 active:scale-95 font-[family-name:var(--font-outfit)] text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M20.216 6.415l-.132-.666c-.119-.597-.384-1.144-1.042-1.282-1.054-.22-2.115-.43-3.178-.636-.582-.113-1.129.284-1.242.866l-.132.666 5.726 1.052zm-14.71 8.877c-1.002 0-1.815-.813-1.815-1.815s.813-1.815 1.815-1.815 1.815.813 1.815 1.815-.813 1.815-1.815 1.815zm16.516-5.748l-.348-1.748c-.287-1.442-1.488-2.457-2.955-2.738-1.637-.313-3.29-.619-4.945-.916-1.579-.283-3.084.776-3.367 2.355l-.348 1.748-4.228-.76c-.347-.062-.693.167-.755.514l-2.022 11.238c-.062.347.167.693.514.755l14.39 2.585c.347.062.693-.167.755-.514l2.022-11.238c.062-.347-.167-.693-.514-.755l-2.848-.512zm-3.83 5.485c-.062.347-.408.576-.755.514l-5.694-1.023c-.347-.062-.576-.408-.514-.755l.897-4.985c.062-.347.408-.576.755-.514l5.694 1.023c.347.062.576.408.514.755l-.897 4.985z"/>
                  </svg>
                  <span>Buy Us A Coffee</span>
                </button>

                {/* discord community redirect button */}
                <a
                  href="https://discord.gg/BbsGD63xNP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 border border-white/20 hover:border-white/60 hover:bg-white/5 active:scale-95 text-white font-[family-name:var(--font-outfit)] text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white/80" />
                  <span>Join Discord</span>
                </a>
              </div>

              <p className="text-[11px] text-white/40 font-light text-center mt-4">
                Post your transaction in our Discord to claim your perks or stay mysterious!
              </p>
            </div>

            {/* atmospheric obsidian liquid crypto modal popping over the viewport */}
            {isWalletModalOpen && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md pointer-events-auto"
                onClick={() => setIsWalletModalOpen(false)}
              >
                <div 
                  className="relative w-full max-w-md bg-[#0a0a0d] border border-white/20 p-6 sm:p-8 text-left shadow-[0_32px_80px_rgba(0,0,0,0.95)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* dismiss button closing the modal */}
                  <button
                    type="button"
                    onClick={() => setIsWalletModalOpen(false)}
                    className="absolute top-4 right-4 p-1.5 text-white/40 hover:text-white transition-colors cursor-pointer"
                    title="Close Modal"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  
                  <p className="font-[family-name:var(--font-outfit)] text-xs text-neutral-400 font-light mb-5 leading-relaxed">
                    Scan using Aqua, Blockstream Green, Marina, or SideSwap. Any amount of L-BTC or USDt is welcomed.
                  </p>

                  {/* qr code container */}
                  <div className="flex flex-col items-center mb-5">
                    <div className="p-3 bg-white shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/crypto/liquid_qr.svg"
                        alt="Liquid Bitcoin Receive QR"
                        width={170}
                        height={170}
                        className="w-40 h-40 sm:w-44 sm:h-44 block"
                      />
                    </div>
                  </div>

                  {/* interactive address field with clipboard feedback */}
                  <div className="mb-5">
                    <div className="text-[10px] font-mono tracking-wider text-white/40 mb-1">
                      Liquid Account Address
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-black/80 border border-white/15 min-w-0">
                      <span className="font-mono text-[11px] text-white/80 truncate min-w-0 flex-1 select-all">
                        {LIQUID_ADDRESS}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyAddress}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-mono text-xs tracking-wider transition-all cursor-pointer border border-white/10"
                        title="Copy Liquid Address"
                      >
                        {copiedAddress ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span className="text-white font-semibold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-neutral-300" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* proof note and discord action */}
                  {/* <div className="justify-center pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-[11px] text-white/50 font-light text-center sm:text-left leading-tight">
                      Drop transaction proof in Discord to get your roles &amp; perks!
                    </p>
                    <a
                      href="https://discord.gg/BbsGD63xNP"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-neutral-200 active:scale-95 font-[family-name:var(--font-outfit)] text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-black" />
                      <span>Discord</span>
                    </a>
                  </div> */}
                </div>
              </div>
            )}

            {/* commented out legacy three-tier subscription plans preserved for reference */}
            {/*
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left">
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
                      <span>Access to experimental builds, and more perks/gifts as we grow across every sister product.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-white/80 shrink-0" />
                      <span>Coolest role on Discord</span>
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
            */}
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
