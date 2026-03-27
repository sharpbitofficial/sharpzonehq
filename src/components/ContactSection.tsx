import { Mail, MessageCircle, Phone } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const contactMethods = [
  {
    icon: Mail,
    label: "Email Us",
    value: "sharpzone.official@gmail.com",
    href: "mailto:sharpzone.official@gmail.com",
  },
  {
    icon: Phone,
    label: "WhatsApp",
    value: "+880 1942‑485183",
    href: "https://wa.me/8801942485183",
  },
  {
    icon: MessageCircle,
    label: "Messenger",
    value: "Message us on Facebook",
    href: "https://m.me/sharpzone",
  },
];

const ContactSection = () => {
  return (
    <section id="contact" className="py-24 px-4 bg-background">
      <div className="max-w-4xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <span className="text-primary font-semibold text-sm tracking-widest uppercase">Get in Touch</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            Contact Us
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ready to start your next project? Reach out through any of these channels.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactMethods.map((method, index) => (
            <AnimatedSection key={method.label} delay={index * 100}>
              <a
                href={method.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center p-8 rounded-2xl bg-card shadow-card hover:shadow-elevated border border-border/50 transition-all duration-500 hover:-translate-y-1"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <method.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold text-card-foreground mb-1">
                  {method.label}
                </h3>
                <p className="text-muted-foreground text-sm text-center">{method.value}</p>
              </a>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
