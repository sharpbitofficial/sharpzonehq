const Footer = () => {
  return (
    <footer className="py-12 px-4 bg-foreground text-background/80 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="font-display text-2xl font-bold text-background mb-1">SharpZone</h3>
            <p className="text-background/60 text-sm">Sharpen Your Digital Presence</p>
          </div>
          <div className="flex gap-8 text-sm">
            <a href="#services" className="hover:text-background transition-colors">Services</a>
            <a href="#team" className="hover:text-background transition-colors">Team</a>
            <a href="#contact" className="hover:text-background transition-colors">Contact</a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-background/10 text-center text-xs text-background/40">
          © {new Date().getFullYear()} SharpZone. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
