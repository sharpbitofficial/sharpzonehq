import { useState } from "react";
import { Home, Layers, BookOpen, User, Shield } from "lucide-react";

const menuItems = [
  { icon: Home, label: "Home", href: "#" },
  { icon: Layers, label: "Services", href: "#services" },
  { icon: BookOpen, label: "Blog", href: "#blog" },
  { icon: User, label: "Profile", href: "#profile" },
  { icon: Shield, label: "Admin", href: "#admin", hasNotification: true },
];

const DynamicIsland = () => {
  const [expanded, setExpanded] = useState(false);
  const [activeItem, setActiveItem] = useState("Home");

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div
        className={`glass-surface border border-border/50 transition-all duration-500 ease-out ${
          expanded
            ? "w-[calc(100vw-2rem)] max-w-lg rounded-3xl px-3 py-3"
            : "w-auto rounded-full px-2 py-2"
        }`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-around gap-1">
          {menuItems.map((item) => {
            const isActive = activeItem === item.label;
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveItem(item.label);
                }}
                className={`relative flex items-center gap-2 px-3 py-2.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {expanded && (
                  <span className="text-xs font-medium whitespace-nowrap animate-fade-in">
                    {item.label}
                  </span>
                )}
                {item.hasNotification && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                )}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default DynamicIsland;
