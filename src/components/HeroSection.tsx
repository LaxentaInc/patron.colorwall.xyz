"use client";

import React, { useRef } from "react";
import { NavBar } from "./NavBar";
import { motion, useScroll, useTransform } from "framer-motion";

// -------------------------------------------------------------------------
// hero section - the main export.
// features atmospheric fog, parallax scroll effects, and cinematic typography.
// overflow is NOT hidden on the section itself so the hero text can bleed
// past the section boundary and overlap with the rock sequence below,
// creating a seamless visual transition instead of a hard clip.
// the background/fog layers are wrapped in their own overflow-hidden
// container so they stay neatly contained.
// -------------------------------------------------------------------------
export const HeroSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  
  // track scroll progress through the hero section to drive parallax effects
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // global scroll for the text so it can safely overlap the next section
  // without its animation getting clipped or reset by the container boundary
  const { scrollY } = useScroll();

  // parallax calculations for the background
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const cloud1X = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const cloud1Y = useTransform(scrollYProgress, [0, 1], ["0%", "-5%"]);
  const cloud2X = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const cloud2Y = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  
  // text stays fixed and drifts upwards slightly as you scroll down into the rock.
  // it fades out based on raw pixel scroll distance (0px to 800px) so it's
  // completely decoupled from the HeroSection's bounding box.
  const textY = useTransform(scrollY, [0, 800], [0, -150]);
  const textOpacity = useTransform(scrollY, [100, 600], [1, 0]);

  return (
    <section ref={containerRef} className="relative w-full bg-black" style={{ height: "100vh" }}>

      {/* overflow-hidden wrapper for background and fog layers only.
          this keeps the fog contained while letting the hero text
          bleed past the section boundary freely. */}
      <div className="absolute inset-0 overflow-hidden">

        {/* main background with parallax */}
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

        {/* cloud layer 1 - drifting horizontally and parallax */}
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none w-[150%] h-[150%] -left-[25%] -top-[25%]"
          style={{ x: cloud1X, y: cloud1Y, opacity: 0.8 }}
          animate={{ 
            x: ["-5%", "5%", "-5%"],
            y: ["-2%", "2%", "-2%"],
          }}
          transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
        >
          <img 
            src="/assets/izanami/common_fv_cloud01.webp" 
            alt="Fog Layer 1" 
            className="object-cover absolute inset-0 w-full h-full" 
          />
        </motion.div>

        {/* cloud layer 2 - opposite drifting and parallax */}
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none w-[150%] h-[150%] -left-[25%] -top-[25%]"
          style={{ x: cloud2X, y: cloud2Y, opacity: 0.7 }}
          animate={{ 
            x: ["5%", "-5%", "5%"],
            y: ["2%", "-2%", "2%"],
          }}
          transition={{ repeat: Infinity, duration: 35, ease: "easeInOut" }}
        >
          <img 
            src="/assets/izanami/common_fv_cloud02.webp" 
            alt="Fog Layer 2" 
            className="object-cover absolute inset-0 w-full h-full" 
          />
        </motion.div>

        {/* radial gradient overlay to darken edges for cinematic focus */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.95) 100%)",
          }}
        />

        {/* bottom fade to blend into the black rock sequence */}
        <div
          className="absolute bottom-0 left-0 w-full h-64 z-[2] pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)",
          }}
        />

      </div>

      {/* nav bar */}
      <NavBar />

      {/* hero text - fixed so it floats above everything and stays on screen
          while the rock scrolls up from underneath it. textOpacity fades it
          out globally based on pixel scroll distance. */}
      <motion.div
        className="fixed z-50 w-full pointer-events-none"
        style={{
          bottom: 0,
          padding: "0 max(env(safe-area-inset-right, 0px), 5rem) 0.17em max(env(safe-area-inset-left, 0px), 5rem)",
          lineHeight: 0.98,
          y: textY,
          opacity: textOpacity
        }}
      >
        <span className="hero-heading block" style={{ textAlign: "left" }}>
          Fuel the
        </span>
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
