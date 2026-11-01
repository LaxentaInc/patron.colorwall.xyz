"use client";

import { useEffect, useRef, useState } from "react";

const TRACK_SOURCES = [
  { id: "ambient1", src: "/ambient1startonsite.mp3" },
  { id: "ambient2", src: "/ambient2afterwescroll.mp3" },
  { id: "beforebirb", src: "/beforethebirb.mp3" },
  { id: "highbirb", src: "/hightenwhenwereachthebirb.mp3" },
];

function calculateAltitudeWeights(progress: number): [number, number, number, number] {
  let w1 = 0;
  if (progress < 0.15) {
    w1 = 1;
  } else if (progress < 0.28) {
    w1 = 1 - (progress - 0.15) / 0.13;
  } else if (progress >= 0.85 && progress < 0.92) {
    // crossfade up to full volume as we descend from the sky to the lake
    w1 = (progress - 0.85) / 0.07;
  } else if (progress >= 0.92) {
    // sustain full loud volume indefinitely at the lake sanctuary so music never pauses
    w1 = 1;
  }

  let w2 = 0;
  if (progress >= 0.15 && progress < 0.28) {
    w2 = (progress - 0.15) / 0.13;
  } else if (progress >= 0.28 && progress < 0.44) {
    w2 = 1;
  } else if (progress >= 0.44 && progress < 0.56) {
    w2 = 1 - (progress - 0.44) / 0.12;
  }

  let w3 = 0;
  if (progress >= 0.44 && progress < 0.56) {
    w3 = (progress - 0.44) / 0.12;
  } else if (progress >= 0.56 && progress < 0.68) {
    w3 = 1;
  } else if (progress >= 0.68 && progress < 0.76) {
    w3 = 1 - (progress - 0.68) / 0.08;
  }

  let w4 = 0;
  if (progress >= 0.68 && progress < 0.76) {
    w4 = (progress - 0.68) / 0.08;
  } else if (progress >= 0.76 && progress < 0.85) {
    w4 = 1;
  } else if (progress >= 0.85 && progress < 0.92) {
    w4 = 1 - (progress - 0.85) / 0.07;
  }

  return [w1, w2, w3, w4];
}

export function SoundtrackManager() {
  const [isMuted, setIsMuted] = useState(false);
  const audioElementsRef = useRef<HTMLAudioElement[]>([]);
  const currentVolumesRef = useRef<number[]>([0, 0, 0, 0]);
  const isUnlockedRef = useRef(false);
  const isMutedRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    isMutedRef.current = isMuted;
    window.dispatchEvent(new CustomEvent("ambient-soundtrack-state", { detail: { isMuted } }));
  }, [isMuted]);

  useEffect(() => {
    const elements = TRACK_SOURCES.map((track) => {
      const audio = new Audio(track.src);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0;
      return audio;
    });

    audioElementsRef.current = elements;

    const unlockAndPlay = () => {
      if (isUnlockedRef.current) return;
      isUnlockedRef.current = true;

      elements.forEach((audio) => {
        audio.play().catch((err) => {
          console.warn("audio autoplay deferred:", err);
        });
      });
    };

    window.addEventListener("pointerdown", unlockAndPlay, { passive: true });
    window.addEventListener("touchstart", unlockAndPlay, { passive: true });
    window.addEventListener("keydown", unlockAndPlay, { passive: true });
    window.addEventListener("wheel", unlockAndPlay, { passive: true });

    const handleToggleEvent = () => {
      unlockAndPlay();
      setIsMuted((prev) => !prev);
    };

    window.addEventListener("toggle-ambient-soundtrack", handleToggleEvent);

    const updateVolumes = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.max(0, Math.min(1, window.scrollY / docHeight)) : 0;
      const targetWeights = calculateAltitudeWeights(progress);
      const masterScale = isMutedRef.current ? 0 : 1;

      elements.forEach((audio, idx) => {
        const targetVol = targetWeights[idx] * masterScale;
        const currentVol = currentVolumesRef.current[idx];
        const smoothed = currentVol + (targetVol - currentVol) * 0.08;
        currentVolumesRef.current[idx] = smoothed;

        // clamp volume strictly to valid html audio range
        audio.volume = Math.max(0, Math.min(1, smoothed));
      });

      rafIdRef.current = requestAnimationFrame(updateVolumes);
    };

    rafIdRef.current = requestAnimationFrame(updateVolumes);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      window.removeEventListener("pointerdown", unlockAndPlay);
      window.removeEventListener("touchstart", unlockAndPlay);
      window.removeEventListener("keydown", unlockAndPlay);
      window.removeEventListener("wheel", unlockAndPlay);
      window.removeEventListener("toggle-ambient-soundtrack", handleToggleEvent);
      elements.forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
    };
  }, []);

  return null;
}
