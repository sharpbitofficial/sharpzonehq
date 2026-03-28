import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AnimatedSection from "./AnimatedSection";

const faqs = [
  {
    q: "What services does SharpZone offer?",
    a: "We specialize in logo design, brand identity, graphic design, social media kits, and complete branding packages for businesses of all sizes.",
  },
  {
    q: "How long does a typical project take?",
    a: "Most projects are completed within 3–7 business days depending on complexity. Rush delivery options are available upon request.",
  },
  {
    q: "How do I place an order?",
    a: "Simply browse our Services section, select your desired service, and click 'Order Now'. Fill in your requirements and we'll get started right away.",
  },
  {
    q: "Do you offer revisions?",
    a: "Yes! Every project includes revision rounds to ensure you're 100% satisfied with the final result.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept bKash, Nagad, bank transfer, and international payment methods including PayPal and Stripe.",
  },
  {
    q: "Can I track my order status?",
    a: "Absolutely. Once you create an account, you can track your order through stages: Pending, Processing, and Completed — all from your profile dashboard.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-24 px-4 bg-secondary/50">
      <div className="max-w-3xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <span className="text-primary font-semibold text-sm tracking-widest uppercase">
            FAQ
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know about working with SharpZone.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card rounded-xl border border-border px-5 shadow-card data-[state=open]:shadow-elevated transition-shadow"
              >
                <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:text-primary transition-colors py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default FAQSection;
