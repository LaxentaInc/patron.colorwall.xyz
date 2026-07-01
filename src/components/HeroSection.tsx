"use client";

import React from "react";

// -------------------------------------------------------------------------
// patreon-inspired nav bar.
// 3-column grid: left text links, center brand wordmark, right cta pills.
// uses the nav-link-hover class from globals.css for the label slide effect.
// fixed at top with z-50, semi-transparent backdrop.
// -------------------------------------------------------------------------
function NavBar() {
  return (
    <header className="fixed top-0 left-0 w-full z-50" style={{ transform: "translateY(1.3rem)" }}>
      <div
        className="grid items-center w-full"
        style={{
          gridTemplateColumns: "1fr auto 1fr",
          padding: "var(--spacing-sm) var(--spacing-lg)",
        }}
      >
        {/* left nav links - desktop only */}
        <nav className="hidden md:flex items-center gap-1">
          {["Features", "Tiers", "Community"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase()}`}
              className="nav-link-hover text-white text-sm"
              data-label={label}
              style={{
                padding: "1.5rem 2.4rem",
                fontWeight: 350,
                letterSpacing: "-0.032rem",
              }}
            >
              <span className="opacity-0">{label}</span>
            </a>
          ))}
        </nav>

        {/* center - brand name. patreon uses their svg wordmark here,
            we use text styled to match their wordmark proportions */}
        <div className="flex items-center justify-center">
          <a
            href="/"
            className="text-white font-semibold tracking-tight"
            style={{ fontSize: "1.4rem", letterSpacing: "-0.02em" }}
          >
            COLORWALL
          </a>
        </div>

        {/* right ctas - pill buttons matching patreon's bordered + filled style */}
        <div className="hidden md:flex items-center justify-end gap-3">
          <a
            href="https://colorwall.xyz"
            className="pill-button secondary text-white"
          >
            <span className="btn-label">Main Site</span>
          </a>
          <a
            href="#join"
            className="pill-button primary"
          >
            <span className="btn-label">Get Started</span>
          </a>
        </div>
      </div>
    </header>
  );
}

// -------------------------------------------------------------------------
// hero section - the main export.
// follows patreon's editorial hero pattern:
//   - full viewport height
//   - webgl canvas as background (our unique twist vs patreon's photos)
//   - massive thin text anchored bottom-left with mix-blend-mode: exclusion
//   - scroll arrow at bottom-left, matching patreon's scroll indicator
//   - radial gradient overlay for depth and readability
// -------------------------------------------------------------------------
export const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden" style={{ height: "100vh" }}>

      {/* video background using the dangerouslySetInnerHTML trick for optimal performance */}
      <div 
          className="absolute inset-0 z-0 pointer-events-none bg-black overflow-hidden"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: `
              <img id="hero-poster" src="/videos/posters/laxenta.webp" alt="Background Poster" fetchpriority="high" class="object-cover absolute inset-0 w-full h-full opacity-100 transition-opacity duration-1000 ease-in-out" />
              <video id="hero-video" src="/videos/laxenta.webm" autoplay muted loop playsinline preload="none" class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-1000 ease-in-out"></video>
              <script>
                  (function() {
                      try {
                          var video = document.getElementById('hero-video');
                          var poster = document.getElementById('hero-poster');
                          
                          var forcePlay = function() {
                              var playPromise = video.play();
                              if (playPromise !== undefined) {
                                  playPromise.catch(function(e) { console.error('Autoplay blocked:', e); });
                              }
                          };

                          video.addEventListener('playing', function() {
                              video.classList.remove('opacity-0');
                              video.classList.add('opacity-100');
                              setTimeout(function() {
                                  if (poster && poster.parentNode) {
                                      poster.parentNode.removeChild(poster);
                                  }
                              }, 1000);
                          }, { once: true });

                          // Try playing immediately, then on interaction
                          forcePlay();
                          window.addEventListener('touchstart', forcePlay, { once: true, passive: true });
                          window.addEventListener('click', forcePlay, { once: true, passive: true });
                          window.addEventListener('scroll', forcePlay, { once: true, passive: true });
                      } catch (e) {
                          console.error('Video background script error:', e);
                      }
                  })();
              </script>
          ` }}
      />

      {/* radial gradient overlay - darkens edges for text readability,
          same technique patreon uses over their photo backgrounds */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.95) 100%)",
        }}
      />

      {/* nav bar */}
      <NavBar />

      {/* hero text - anchored bottom-left, matching patreon's title-wrapper positioning.
          patreon uses left: calc(5rem + var(--rem-scale-viewport-half-excess)),
          we simplify to padding-based positioning. */}
      <div
        className="absolute z-10 w-full"
        style={{
          bottom: 0,
          padding: "0 max(env(safe-area-inset-right, 0px), 5rem) 0.17em max(env(safe-area-inset-left, 0px), 5rem)",
          lineHeight: 0.98,
          pointerEvents: "none",
        }}
      >
        {/* first line - left aligned, with right padding to leave room for
            the creator card area (patreon puts cards at right side) */}
        <span className="hero-heading block" style={{ textAlign: "left" }}>
          Fuel the
        </span>
        {/* second line - right aligned + indented, matching patreon's
            alternating text alignment pattern */}
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
      </div>

      {/* scroll down arrow - bottom left, matching patreon's home-arrow positioning.
          patreon uses a 7rem svg at left: 5rem, bottom: 5rem */}
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
