import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import TeamSection from "@/components/TeamSection";
import ContactSection from "@/components/ContactSection";
import DynamicIsland from "@/components/DynamicIsland";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ServicesSection />
      <TeamSection />
      <ContactSection />
      <Footer />
      <DynamicIsland />
    </div>
  );
};

export default Index;
