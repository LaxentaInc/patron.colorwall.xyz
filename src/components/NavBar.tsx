"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";

// -------------------------------------------------------------------------
// patreon-inspired nav bar.
// Desktop: 3-column grid (links, logo, CTAs)
// Mobile: Flexbox between logo (left) and hamburger (right)
// -------------------------------------------------------------------------
export function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300" style={{ transform: "translateY(1.3rem)" }}>
        {/* Desktop Nav (hidden on mobile) */}
        <div
          className="hidden md:grid items-center w-full"
          style={{
            gridTemplateColumns: "1fr auto 1fr",
            padding: "var(--spacing-sm) var(--spacing-lg)",
          }}
        >
          {/* left nav links */}
          <nav className="flex items-center gap-1">
            {["Features", "Tiers", "Community"].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                className="nav-link-hover text-white text-sm"
                data-label={label}
                style={{ padding: "1.5rem 2.4rem", fontWeight: 350, letterSpacing: "-0.032rem" }}
              >
                <span className="opacity-0">{label}</span>
              </a>
            ))}
          </nav>

          {/* center brand */}
          <div className="flex items-center justify-center">
            <a href="/" className="text-white font-semibold tracking-tight" style={{ fontSize: "1.4rem", letterSpacing: "-0.02em" }}>
              COLORWALL
            </a>
          </div>

          {/* right ctas */}
          <div className="flex items-center justify-end gap-3">
            <a href="https://colorwall.xyz" className="pill-button secondary text-white">
              <span className="btn-label">Main Site</span>
            </a>
            <a href="#join" className="pill-button primary">
              <span className="btn-label">Get Started</span>
            </a>
          </div>
        </div>

        {/* Mobile Nav (hidden on desktop) */}
        <div className="md:hidden flex items-center justify-between w-full px-6 py-4">
          <a href="/" className="text-white font-semibold tracking-tight" style={{ fontSize: "1.4rem", letterSpacing: "-0.02em" }}>
            COLORWALL
          </a>
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="text-white p-2 focus:outline-none"
            aria-label="Open menu"
          >
            <Menu size={28} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex flex-col md:hidden">
          <div className="flex items-center justify-between px-6 py-4 mt-[1.3rem]">
            <a href="/" className="text-white font-semibold tracking-tight" style={{ fontSize: "1.4rem", letterSpacing: "-0.02em" }}>
              COLORWALL
            </a>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="text-white p-2 focus:outline-none"
              aria-label="Close menu"
            >
              <X size={28} strokeWidth={1.5} />
            </button>
          </div>
          
          <div className="flex flex-col items-center justify-center flex-1 gap-8 pb-20">
            {["Features", "Tiers", "Community"].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-white text-3xl font-light tracking-tight"
              >
                {label}
              </a>
            ))}
            <div className="flex flex-col w-full px-10 gap-4 mt-8">
              <a href="https://colorwall.xyz" className="pill-button secondary text-white w-full">
                <span className="btn-label">Main Site</span>
              </a>
              <a href="#join" className="pill-button primary w-full">
                <span className="btn-label">Get Started</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
