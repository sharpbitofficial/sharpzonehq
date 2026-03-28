import { Star, Quote } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const testimonials = [
  {
    name: "Rafi Ahmed",
    role: "Startup Founder",
    text: "SharpZone transformed our brand identity completely. Their attention to detail and creative vision exceeded all expectations.",
    rating: 5,
  },
  {
    name: "Nusrat Jahan",
    role: "E-commerce Owner",
    text: "Professional, responsive, and incredibly talented. The logo they designed became the cornerstone of our entire brand.",
    rating: 5,
  },
  {
    name: "Tanvir Hasan",
    role: "Marketing Director",
    text: "Working with SharpZone was seamless. They delivered on time and the quality was outstanding. Highly recommended!",
    rating: 5,
  },
  {
    name: "Sabrina Akter",
    role: "Restaurant Owner",
    text: "From concept to final delivery, SharpZone understood our vision perfectly. Our brand has never looked better.",
    rating: 4,
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-24 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <span className="text-primary font-semibold text-sm tracking-widest uppercase">
            Testimonials
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Hear from the brands and businesses we've helped grow.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <AnimatedSection key={t.name} delay={i * 100}>
              <div className="relative bg-card rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all duration-500 border border-border group">
                <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10 group-hover:text-primary/20 transition-colors" />
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      className={`w-4 h-4 ${si < t.rating ? "text-yellow-400 fill-yellow-400" : "text-muted"}`}
                    />
                  ))}
                </div>
                <p className="text-foreground/80 mb-4 leading-relaxed italic">
                  "{t.text}"
                </p>
                <div>
                  <p className="font-display font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
