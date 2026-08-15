"use client";

import React, { useRef } from "react";
import { NavBar } from "./NavBar";
import { motion, useScroll, useTransform } from "framer-motion";

// -------------------------------------------------------------------------
// hero section - the main export.
// features atmospheric fog, parallax scroll effects, and cinematic typography
// seamlessly blends into the black background of the next section
// -------------------------------------------------------------------------
export const HeroSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  
  // Track scroll progress through the hero section to drive parallax effects
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Parallax calculations
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const cloud1X = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const cloud1Y = useTransform(scrollYProgress, [0, 1], ["0%", "-5%"]);
  const cloud2X = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const cloud2Y = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const textOpacity = useTransform(scrollYProgress, [0.3, 0.8], [1, 0]);

  return (
    <section ref={containerRef} className="relative w-full overflow-hidden bg-black" style={{ height: "100vh" }}>

      {/* Main Background with parallax */}
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ y: bgY }}
      >
        <img 
          src="/assets/izanami/home_fv_img.webp" 
          alt="Background" 
          className="object-cover absolute inset-0 w-full h-full opacity-50" 
        />
      </motion.div>

      {/* Cloud Layer 1 - drifting and parallax */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ x: cloud1X, y: cloud1Y, opacity: 0.8 }}
        animate={{ 
          x: ["-2%", "2%", "-2%"],
          y: ["-1%", "1%", "-1%"],
        }}
        transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
      >
        <img 
          src="/assets/izanami/common_fv_cloud01.webp" 
          alt="Fog Layer 1" 
          className="object-cover absolute inset-0 w-full h-full scale-110" 
        />
      </motion.div>

      {/* Cloud Layer 2 - opposite drifting and parallax */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ x: cloud2X, y: cloud2Y, opacity: 0.7 }}
        animate={{ 
          x: ["2%", "-2%", "2%"],
          y: ["1%", "-1%", "1%"],
        }}
        transition={{ repeat: Infinity, duration: 22, ease: "easeInOut" }}
      >
        <img 
          src="/assets/izanami/common_fv_cloud02.webp" 
          alt="Fog Layer 2" 
          className="object-cover absolute inset-0 w-full h-full scale-110" 
        />
      </motion.div>

      {/* radial gradient overlay to darken edges for cinematic focus */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.95) 100%)",
        }}
      />

      {/* bottom fade to perfectly blend into the black rock sequence */}
      <div
        className="absolute bottom-0 left-0 w-full h-64 z-[2] pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)",
        }}
      />

      {/* nav bar */}
      <NavBar />

      {/* hero text - anchors bottom left and uses parallax */}
      <motion.div
        className="absolute z-10 w-full"
        style={{
          bottom: 0,
          padding: "0 max(env(safe-area-inset-right, 0px), 5rem) 0.17em max(env(safe-area-inset-left, 0px), 5rem)",
          lineHeight: 0.98,
          pointerEvents: "none",
          y: textY,
          opacity: textOpacity
        }}
      >
        <span 
          className="hero-heading block" 
          style={{ 
            textAlign: "left",
            fontFamily: "var(--font-cinzel), serif",
            fontWeight: 400
          }}
        >
          Fuel the
        </span>
        <span
          className="hero-heading block text-white/90"
          style={{
            textAlign: "right",
            paddingRight: "max(env(safe-area-inset-right, 0px), 5rem)",
            marginBottom: "2rem",
            fontFamily: "var(--font-playfair), serif",
            fontStyle: "italic",
            fontWeight: 400
          }}
        >
          future of desktop
        </span>
      </motion.div>

      {/* scroll down arrow */}
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
