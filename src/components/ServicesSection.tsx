import { Palette, Code, Megaphone, Camera, Layers, Zap } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const services = [
  { icon: Palette, title: "Graphic Design", description: "Logo, branding, social media creatives, and print-ready materials." },
  { icon: Code, title: "Web Development", description: "Custom websites, landing pages, and full-stack web applications." },
  { icon: Megaphone, title: "Digital Marketing", description: "SEO, social media campaigns, and performance-driven strategies." },
  { icon: Camera, title: "Video Editing", description: "Professional video production, motion graphics, and visual storytelling." },
  { icon: Layers, title: "UI/UX Design", description: "Intuitive interfaces and seamless user experiences for apps and web." },
  { icon: Zap, title: "Custom Solutions", description: "Tailored digital solutions built exactly to your specifications." },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <span className="text-primary font-semibold text-sm tracking-widest uppercase">What We Do</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            Our Services
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From concept to delivery, we provide end-to-end digital services that transform your vision into reality.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <AnimatedSection key={service.title} delay={index * 100}>
              <div className="group relative p-8 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all duration-500 hover:-translate-y-1 border border-border/50">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold text-card-foreground mb-3">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
                <div className="absolute bottom-0 left-8 right-8 h-0.5 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
