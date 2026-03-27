import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo.jpeg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="SharpZone digital background"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-hero-gradient opacity-80" />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-glow/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-bright/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="mb-6">
          <img src={logo} alt="SharpZone Logo" className="w-20 h-20 mx-auto rounded-2xl shadow-elevated" />
        </div>
        <div className="inline-block mb-6 px-4 py-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 backdrop-blur-sm">
          <span className="text-primary-foreground/90 text-sm font-medium tracking-wide">
            ✦ Premium Digital Services
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-primary-foreground leading-tight mb-6">
          Sharpen Your
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-light to-blue-glow">
            Digital Presence
          </span>
        </h1>

        <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          We craft exceptional digital experiences — from stunning designs to powerful platforms 
          that elevate your brand and drive results.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#services"
            className="px-8 py-4 bg-primary-foreground text-blue-vivid font-semibold rounded-xl hover:shadow-elevated hover:scale-105 transition-all duration-300"
          >
            Explore Services
          </a>
          <a
            href="#contact"
            className="px-8 py-4 border-2 border-primary-foreground/30 text-primary-foreground font-semibold rounded-xl hover:bg-primary-foreground/10 transition-all duration-300"
          >
            Get in Touch
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-primary-foreground/50 text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex items-start justify-center p-1.5">
          <div className="w-1.5 h-3 bg-primary-foreground/60 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
