import { useState } from "react";
import EntryAnimation from "@/components/EntryAnimation";
import HeroSection from "@/components/HeroSection";
import SurveyFormSection from "@/components/SurveyFormSection";
import ServicesSection from "@/components/ServicesSection";
import PortfolioSection from "@/components/PortfolioSection";
import TeamSection from "@/components/TeamSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PartnersSection from "@/components/PartnersSection";
import BlogSection from "@/components/BlogSection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import NewsletterSection from "@/components/NewsletterSection";
import DynamicIsland from "@/components/DynamicIsland";
import HamburgerMenu from "@/components/HamburgerMenu";
import Footer from "@/components/Footer";

const Index = () => {
  const [showAnimation, setShowAnimation] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {showAnimation && <EntryAnimation onComplete={() => setShowAnimation(false)} />}
      <HeroSection />
      <SurveyFormSection />
      <ServicesSection />
      <PortfolioSection />
      <TeamSection />
      <TestimonialsSection />
      <PartnersSection />
      <BlogSection />
      <FAQSection />
      <NewsletterSection />
      <ContactSection />
      <Footer />
      <DynamicIsland />
    </div>
  );
};

export default Index;
