import { HeroSection } from "@/components/HeroSection";
import { RockSequence } from "@/components/RockSequence";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-amber-500/30">
      <HeroSection />
      
      {/* 
        rock sequence section with 1200vh scroll progress and textplosion headings
      */}
      <RockSequence />
    </main>
  );
}
