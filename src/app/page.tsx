import { HeroSection } from "@/components/HeroSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-amber-500/30">
      <HeroSection />
      {/* Placeholder for the next section so the page is actually scrollable */}
      <section id="features" className="min-h-screen bg-neutral-950 flex items-center justify-center border-t border-white/5">
        <h2 className="text-4xl font-light text-white/50 tracking-tight">More content coming here...</h2>
      </section>
    </main>
  );
}
