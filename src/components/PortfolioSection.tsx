import AnimatedSection from "./AnimatedSection";
import portfolioJersey from "@/assets/portfolio-jersey.jpeg";
import portfolioLearn from "@/assets/portfolio-learn.jpeg";
import portfolioMahins from "@/assets/portfolio-mahins.jpeg";
import portfolioSzGold from "@/assets/portfolio-sz-gold.jpeg";
import portfolioSzRed from "@/assets/portfolio-sz-red.jpeg";

const works = [
  { image: portfolioJersey, title: "Jersey Euphoria", category: "Brand Identity" },
  { image: portfolioLearn, title: "Learn With Mahin", category: "Logo Design" },
  { image: portfolioMahins, title: "Mahin's Creative World", category: "Brand Identity" },
  { image: portfolioSzGold, title: "SharpZone Gold", category: "Logo Variant" },
  { image: portfolioSzRed, title: "SharpZone Red", category: "Logo Variant" },
];

const PortfolioSection = () => {
  return (
    <section id="portfolio" className="py-24 px-4 bg-secondary/50">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <span className="text-primary font-semibold text-sm tracking-widest uppercase">Portfolio</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            Our Work
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A showcase of brands and identities we've brought to life.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {works.map((work, index) => (
            <AnimatedSection key={work.title} delay={index * 80}>
              <div className="group relative rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-500 hover:-translate-y-1 aspect-square">
                <img
                  src={work.image}
                  alt={work.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-4">
                  <h3 className="font-display text-sm font-semibold text-background">{work.title}</h3>
                  <p className="text-background/70 text-xs">{work.category}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
