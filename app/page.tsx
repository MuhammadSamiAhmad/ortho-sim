import { LandingNavbar } from "@/components/home/Navbar";
import { HeroSection } from "@/components/home/Hero";
import { FeaturesSection } from "@/components/home/Features";
import { TeamSection } from "@/components/home/TeamSection";
import About from "@/components/home/About";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <main>
        <HeroSection />
        <About />
        <FeaturesSection />
        <TeamSection />
      </main>
      <Footer />
    </div>
  );
}
