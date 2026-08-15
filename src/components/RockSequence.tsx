"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

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
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // use center-based rotation so we can easily tweak the angle without clipping
    ctx.save();
    
    // move to the center of our 1000x1000 canvas
    ctx.translate(canvas.width / 2, canvas.height / 2);
    
    // rotate by 110 degrees as requested
    ctx.rotate((110 * Math.PI) / 180);
    
    // zoom in the rock by 30% so it fills the canvas better
    ctx.scale(1.17, 1.17);
    
    // draw the image centered. the original frames are 750x820
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

  // custom smoothing loop inspired by FluidGalleryEngine.ts
  useEffect(() => {
    let rafId: number;
    
    const loop = () => {
      let current = currentFrameRef.current;
      const target = targetFrameRef.current;
      const dist = target - current;
      
      // only recalculate and render if we haven't reached the target
      if (Math.abs(dist) > 0.001) {
        // smooth step factor tuned to 0.095 for crisp transition pacing
        current += dist * 0.095;
        
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
    <section ref={containerRef} className="h-[800vh] bg-black relative">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        
        {/* canvas is now a 1000x1000 square so the rock has plenty of room to
            rotate at any angle without getting its corners clipped off. */}
        <canvas 
          ref={canvasRef} 
          width={1000} 
          height={1000} 
          className="w-full max-w-[1200px] max-h-screen object-contain drop-shadow-2xl"
        />

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
