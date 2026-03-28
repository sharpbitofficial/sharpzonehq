import { useEffect, useRef } from "react";
import AnimatedSection from "./AnimatedSection";

const partners = [
  { name: "TechVista", color: "hsl(217 91% 50%)" },
  { name: "CloudNine", color: "hsl(199 89% 48%)" },
  { name: "PixelForge", color: "hsl(217 91% 30%)" },
  { name: "DataStream", color: "hsl(199 89% 65%)" },
  { name: "NexGen", color: "hsl(217 91% 50%)" },
  { name: "BlueWave", color: "hsl(199 89% 48%)" },
  { name: "CoreSync", color: "hsl(217 91% 30%)" },
  { name: "VaultEdge", color: "hsl(199 89% 65%)" },
];

const PartnersSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId: number;
    let scrollPos = 0;

    const scroll = () => {
      scrollPos += 0.5;
      if (scrollPos >= el.scrollWidth / 2) scrollPos = 0;
      el.scrollLeft = scrollPos;
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    
    const pause = () => cancelAnimationFrame(animationId);
    const resume = () => { animationId = requestAnimationFrame(scroll); };
    
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);

    return () => {
      cancelAnimationFrame(animationId);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
    };
  }, []);

  const allPartners = [...partners, ...partners];

  return (
    <section id="partners" className="py-24 px-4 bg-secondary/50">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <span className="text-primary font-semibold text-sm tracking-widest uppercase">
            Partners
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            Our Trusted Business Partners
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Collaborating with industry leaders to deliver excellence.
          </p>
        </AnimatedSection>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-hidden"
          style={{ scrollBehavior: "auto" }}
        >
          {allPartners.map((p, i) => (
            <div
              key={`${p.name}-${i}`}
              className="flex-shrink-0 w-40 h-24 bg-card rounded-2xl border border-border flex items-center justify-center shadow-card hover:shadow-glow transition-all duration-500 hover:scale-105 cursor-pointer group"
            >
              <span
                className="font-display font-bold text-lg group-hover:scale-110 transition-transform duration-300"
                style={{ color: p.color }}
              >
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
