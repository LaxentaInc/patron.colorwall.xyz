"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent, useTransform, motion } from "framer-motion";
import { SpaceDust } from "./SpaceDust";

const FRAME_COUNT = 270;

export function RockSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const targetFrameRef = useRef(1);
  const currentFrameRef = useRef(1);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  const renderFrame = (index: number) => {
    const img = imagesRef.current[index];
    if (!img) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // move to the center of our 1000x1000 canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // rotate by 110 degrees for dynamic composition
    ctx.rotate((110 * Math.PI) / 180);
    
    // zoom in the rock so it fills the canvas
    ctx.scale(1.17, 1.17);
    
    // draw the image centered (source frame dimensions: 750x820)
    ctx.drawImage(img, -750 / 2, -820 / 2, 750, 820);
    ctx.restore();
  };

  // Preload images optimally
  useEffect(() => {
    const loadImages = () => {
      // Load frame 1 immediately to show it on screen
      const firstImg = new Image();
      firstImg.onload = () => {
        imagesRef.current[1] = firstImg;
        setImagesLoaded(prev => prev + 1);
        
        // Once frame 1 is ready, aggressively load the rest
        for (let i = 2; i <= FRAME_COUNT; i++) {
          const img = new Image();
          const num = i.toString().padStart(4, "0");
          img.onload = () => {
            imagesRef.current[i] = img;
            setImagesLoaded(prev => prev + 1);
          };
          img.src = `/assets/produx_rock/rock_${num}.webp`;
        }
      };
      firstImg.src = `/assets/produx_rock/rock_0001.webp`;
    };
    
    loadImages();
  }, []);

  // Draw the initial frame as soon as it's loaded
  useEffect(() => {
    if (imagesLoaded > 0 && imagesRef.current[1]) {
      renderFrame(1);
    }
  }, [imagesLoaded]);

  // Framer Motion scroll tracker
  const { scrollYProgress } = useScroll({
    target: containerRef,
    // Start tracking when the top of the container hits the top of the viewport
    // Stop tracking when the bottom of the container hits the bottom of the viewport
    offset: ["start start", "end end"]
  });

  // instead of rendering instantly on scroll, we just update the target frame
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    targetFrameRef.current = Math.max(1, Math.min(FRAME_COUNT, Math.ceil(latest * FRAME_COUNT)));
  });

  // text phase 1 early scroll opacity and vertical translation
  const opacity1 = useTransform(scrollYProgress, [0.00, 0.10, 0.20, 0.28], [0, 1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0.00, 0.28], [40, -40]);

  // text phase 2 mid scroll opacity and vertical translation
  const opacity2 = useTransform(scrollYProgress, [0.32, 0.42, 0.52, 0.60], [0, 1, 1, 0]);
  const y2 = useTransform(scrollYProgress, [0.32, 0.60], [40, -40]);

  // text phase 3 late scroll opacity and vertical translation
  const opacity3 = useTransform(scrollYProgress, [0.64, 0.74, 0.90, 0.98], [0, 1, 1, 0]);
  const y3 = useTransform(scrollYProgress, [0.64, 0.90, 1.00], [40, 0, -30]);

  // rock canvas tail fade and scale-up transition into 3d cosmos
  const canvasOpacity = useTransform(scrollYProgress, [0.93, 0.99], [1, 0]);
  const canvasScale = useTransform(scrollYProgress, [0.93, 0.99], [1, 1.08]);

  // custom smoothing loop inspired by FluidGalleryEngine.ts
  useEffect(() => {
    let rafId: number;
    
    const loop = () => {
      let current = currentFrameRef.current;
      const target = targetFrameRef.current;
      const dist = target - current;
      
      // only recalculate and render if we haven't reached the target
      if (Math.abs(dist) > 0.001) {
        // smooth step factor tuned to 0.045 so the rock keeps
        // gliding for much longer instead of stopping abruptly
        current += dist * 0.045;
        
        // snap threshold to eliminate exponential lerp decay tail
        if (Math.abs(target - current) < 0.012) {
          current = target;
        }
        
        currentFrameRef.current = current;
        
        const frameIndex = Math.round(current);
        
        // fallback to the closest previous loaded frame if scrolled too fast
        let targetIndex = frameIndex;
        while (!imagesRef.current[targetIndex] && targetIndex > 1) {
          targetIndex--;
        }
        
        if (imagesRef.current[targetIndex]) {
          renderFrame(targetIndex);
        }
      }
      
      rafId = requestAnimationFrame(loop);
    };
    
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <section ref={containerRef} className="h-[1200vh] bg-black relative">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        
        {/* WebGL space dust behind the rock */}
        <SpaceDust />
        
        {/* canvas is wrapped in smooth motion transforms to fade gracefully into the 3d world */}
        <motion.div
          style={{ opacity: canvasOpacity, scale: canvasScale }}
          className="relative z-10 w-full max-w-[1200px] max-h-screen flex items-center justify-center pointer-events-none"
        >
          <canvas 
            ref={canvasRef} 
            width={1000} 
            height={1000} 
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </motion.div>

        {/* editorial text overlays distributed across both sides of the screen */}
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center p-6 md:p-14 lg:p-24 overflow-hidden">
          
          {/* phase 1: early scroll positioned on the left side of the rotating rock */}
          <motion.div 
            className="absolute left-6 md:left-14 lg:left-24 max-w-md lg:max-w-xl text-left"
            style={{ opacity: opacity1, y: y1 }}
          >
            <p className="font-[family-name:var(--font-outfit)] text-xl sm:text-2xl md:text-3xl lg:text-[2.2rem] font-extralight text-white/90 leading-relaxed tracking-tight">
              Colorwall isn't just software. It's a living, breathing canvas that redefines your digital environment. Become a Patron and help us build the ultimate Wallpaper Engine alternative.
            </p>
          </motion.div>

          {/* phase 2: mid scroll positioned on the right side of the rotating rock */}
          <motion.div 
            className="absolute right-6 md:right-14 lg:right-24 max-w-md lg:max-w-xl text-left"
            style={{ opacity: opacity2, y: y2 }}
          >
            <p className="font-[family-name:var(--font-outfit)] text-xl sm:text-2xl md:text-3xl lg:text-[2.2rem] font-extralight text-white/90 leading-relaxed tracking-tight">
              By backing us early, you get exclusive access to beta builds, cutting-edge renderer features, and a direct line to the development team.
            </p>
          </motion.div>

          {/* phase 3: late scroll positioned on the right side in open dark space */}
          <motion.div 
            className="absolute right-6 md:right-14 lg:right-24 max-w-md lg:max-w-xl text-left"
            style={{ opacity: opacity3, y: y3 }}
          >
            <p className="font-[family-name:var(--font-outfit)] text-xl sm:text-2xl md:text-3xl lg:text-[2.2rem] font-extralight text-white/90 leading-relaxed tracking-tight">
              Secure your place among our earliest supporters. Unlock exclusive perks, early access drops, and have direct influence over the roadmap.
            </p>
          </motion.div>

        </div>

        {/* Subtle loading indicator if the user scrolls faster than their network */}
        {imagesLoaded < FRAME_COUNT && (
          <div className="absolute bottom-6 right-6 text-white/30 text-xs font-mono tracking-widest">
            LOADING ASSETS [{Math.floor((imagesLoaded / FRAME_COUNT) * 100)}%]
          </div>
        )}
      </div>
    </section>
  );
}
