import { useState } from "react";
import { Chrome as Home, Layers, BookOpen, User, Shield, Settings as SettingsIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DynamicIsland = () => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-notifications", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const menuItems = [
    { icon: Home, label: "Home", action: () => { if (location.pathname === "/") { window.scrollTo({ top: 0, behavior: "smooth" }); } else { navigate("/"); } } },
    { icon: Layers, label: "Services", action: () => { if (location.pathname === "/") { document.getElementById("services")?.scrollIntoView({ behavior: "smooth" }); } else { navigate("/"); setTimeout(() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" }), 300); } } },
    { icon: BookOpen, label: "Blog", action: () => { if (location.pathname === "/") { document.getElementById("blog")?.scrollIntoView({ behavior: "smooth" }); } else { navigate("/"); setTimeout(() => document.getElementById("blog")?.scrollIntoView({ behavior: "smooth" }), 300); } } },
    { icon: User, label: user ? "Profile" : "Login", action: () => navigate(user ? "/profile" : "/login") },
    { icon: SettingsIcon, label: "Settings", action: () => navigate("/settings") },
    ...(isAdmin ? [{ icon: Shield, label: "Admin", action: () => navigate("/admin"), hasNotification: true }] : []),
  ];

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
            const isActive =
              (item.label === "Home" && location.pathname === "/") ||
              (item.label === "Profile" && location.pathname === "/profile") ||
              (item.label === "Login" && location.pathname === "/login") ||
              (item.label === "Admin" && location.pathname === "/admin");

            return (
              <button
                key={item.label}
                onClick={(e) => {
                  e.stopPropagation();
                  item.action();
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
                {("hasNotification" in item && item.hasNotification) || (item.label === "Admin" && unreadCount > 0) ? (
                  <span className="absolute top-1.5 right-1.5 min-w-[8px] h-2 bg-destructive rounded-full flex items-center justify-center">
                    {unreadCount > 0 && item.label === "Admin" && (
                      <span className="text-[8px] font-bold text-primary-foreground px-1">{unreadCount > 9 ? "9+" : unreadCount}</span>
                    )}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default DynamicIsland;
