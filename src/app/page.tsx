import { HeroSection } from "@/components/HeroSection";
import { RockSequence } from "@/components/RockSequence";
import { WorldExperience } from "@/components/WorldExperience";
import { SoundtrackManager } from "@/components/SoundtrackManager";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-amber-500/30">
      {/* global multi-track ambient audio engine with altitude crossfading */}
      <SoundtrackManager />

      <HeroSection />
      
      {/* 
        rock sequence section with 1200vh scroll progress and textplosion headings
      */}
      <RockSequence />

      {/* 
        interactive 3d world experience seamlessly integrated via continuous scrolling
      */}
      <WorldExperience />
    </main>
  );
}
