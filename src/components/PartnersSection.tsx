import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AnimatedSection from "./AnimatedSection";

const PartnersSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: partners = [] } = useQuery({
    queryKey: ["partners-public"],
    queryFn: async () => {
      const { data } = await supabase
        .from("partners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      return data || [];
    },
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || partners.length === 0) return;

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
  }, [partners]);

  if (partners.length === 0) return null;

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
            <a
              key={`${p.id}-${i}`}
              href={p.website_url || "#"}
              target={p.website_url ? "_blank" : "_self"}
              rel={p.website_url ? "noopener noreferrer" : ""}
              className="flex-shrink-0 w-40 h-24 bg-card rounded-2xl border border-border flex items-center justify-center shadow-card hover:shadow-glow transition-all duration-500 hover:scale-105 cursor-pointer group p-4"
            >
              {p.logo_url ? (
                <img
                  src={p.logo_url}
                  alt={p.name}
                  className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <span className="font-display font-bold text-lg text-primary group-hover:scale-110 transition-transform duration-300">
                  {p.name}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
