import { HeroSection } from "@/components/HeroSection";
import { RockSequence } from "@/components/RockSequence";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-amber-500/30">
      <HeroSection />
      
      {/* 
        This adds the Produx rock animation right below the Hero Section. 
        It has a height of 300vh to give the user enough scroll distance.
      */}
      <RockSequence />
      
    </main>
  );
}
