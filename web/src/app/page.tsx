import {
  Navigation,
  HeroSection,
  PlatformMarquee,
  ValueProps,
  ArchitectureFlow,
  BentoGrid,
  FooterCTA,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Navigation />
      <main>
        <HeroSection />
        <PlatformMarquee />
        <ValueProps />
        <ArchitectureFlow />
        <BentoGrid />
        <FooterCTA />
        <Footer />
      </main>
    </div>
  );
}
