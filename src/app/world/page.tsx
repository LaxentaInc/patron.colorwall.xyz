import { WorldExperience } from "@/components/WorldExperience";
import Link from "next/link";

// dedicated full-viewport route hosting the complete interactive 3d engine.
// separating this from the landing page prevents scroll event conflicts between
// lenis / gsap in the rock sequence and the legacy engine's internal coordinators.
export default function WorldPage() {
  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden select-none">
      {/* floating navigation pill to allow users to return to the landing page */}
      <div className="fixed top-6 left-6 z-50 pointer-events-auto">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 hover:border-amber-500/40 text-white/80 hover:text-white font-[family-name:var(--font-outfit)] text-sm tracking-wider transition-all duration-300 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
        >
          <svg
            className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-light">RETURN TO PATRON</span>
        </Link>
      </div>

      {/* interactive 3d engine container with canvas and scene coordinators */}
      <WorldExperience />
    </main>
  );
}
