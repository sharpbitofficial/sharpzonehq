import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import PortfolioSection from "@/components/PortfolioSection";
import TeamSection from "@/components/TeamSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PartnersSection from "@/components/PartnersSection";
import BlogSection from "@/components/BlogSection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import DynamicIsland from "@/components/DynamicIsland";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ServicesSection />
      <PortfolioSection />
      <TeamSection />
      <TestimonialsSection />
      <PartnersSection />
      <BlogSection />
      <FAQSection />
      <ContactSection />
      <Footer />
      <DynamicIsland />
    </div>
  );
};

export default Index;
