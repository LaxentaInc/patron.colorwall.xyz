"use client";

import { useEffect } from "react";

// -------------------------------------------------------------------------
// site-wide smooth scroll provider.
// intercepts native wheel events and replaces them with a custom
// requestAnimationFrame loop that lerps window.scrollTo towards a
// target position. this creates the buttery, momentum-based scrolling
// where the page glides to a stop even after releasing the mouse wheel.
//
// inspired by the FluidGalleryEngine.ts smoothing logic:
//   position += dist * LERP_FACTOR
//   if (Math.abs(dist) < SNAP_THRESHOLD) position = target
//
// also caps the maximum scroll delta per wheel tick so fast scrolling
// doesn't teleport the user through sections.
// -------------------------------------------------------------------------

// max pixels the scroll target can jump per single wheel tick.
// 400px keeps scrolling feeling substantial without teleporting
const MAX_DELTA = 400;

// multiplier applied to raw wheel deltaY before clamping.
// 1.5x is close to native feel but gives us control over the easing
const SCROLL_MULTIPLIER = 1.5;

// exponential decay factor per frame. higher = more responsive.
// 0.12 feels close to native scrolling but with a smooth glide tail.
const LERP_FACTOR = 0.12;

// pixel threshold below which we snap to the target to avoid
// infinite asymptotic decay (the "never quite reaches it" problem).
const SNAP_THRESHOLD = 0.5;

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let targetScroll = window.scrollY;
    let currentScroll = window.scrollY;
    let rafId: number;
    // flag to distinguish our own scrollTo calls from user-initiated
    // scroll events (scrollbar drag, keyboard, etc.)
    let isOurScroll = false;

    const getMaxScroll = () =>
      document.documentElement.scrollHeight - window.innerHeight;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      // amplify the raw delta, then clamp to max to prevent
      // trackpad flings from overshooting entire page sections
      const amplified = e.deltaY * SCROLL_MULTIPLIER;
      const clampedDelta = Math.max(
        -MAX_DELTA,
        Math.min(MAX_DELTA, amplified)
      );

      // accumulate into target, clamped to page bounds so we never
      // try to scroll past the top or bottom of the document
      targetScroll = Math.max(
        0,
        Math.min(getMaxScroll(), targetScroll + clampedDelta)
      );
    };

    // sync target when the user scrolls via scrollbar drag, keyboard,
    // or any other non-wheel mechanism so the lerp doesn't fight
    // against their intended position
    const onScroll = () => {
      if (isOurScroll) {
        isOurScroll = false;
        return;
      }
      // user scrolled via scrollbar/keyboard, sync both values
      targetScroll = window.scrollY;
      currentScroll = window.scrollY;
    };

    const loop = () => {
      const dist = targetScroll - currentScroll;

      if (Math.abs(dist) > SNAP_THRESHOLD) {
        // exponential lerp: each frame closes 8% of the remaining gap.
        // this creates natural deceleration as the gap shrinks.
        currentScroll += dist * LERP_FACTOR;

        // snap to prevent infinite asymptotic approach
        if (Math.abs(targetScroll - currentScroll) < SNAP_THRESHOLD) {
          currentScroll = targetScroll;
        }

        isOurScroll = true;
        window.scrollTo(0, currentScroll);
      }

      rafId = requestAnimationFrame(loop);
    };

    // passive: false is required to allow preventDefault on wheel events.
    // without it, the browser ignores our attempt to hijack scrolling.
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll);
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return <>{children}</>;
}
