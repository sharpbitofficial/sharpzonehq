import { useState } from "react";
import { Menu, X, LogIn, UserPlus, Settings as SettingsIcon, Moon, Sun, Globe, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const HamburgerMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut, isCeo, isAdmin } = useAuth();

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 right-4 z-[60] p-2.5 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-elevated hover:scale-105 transition-transform"
        aria-label="Menu"
      >
        {open ? <X className="w-6 h-6 text-foreground" /> : <Menu className="w-6 h-6 text-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55]"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-card border-l border-border shadow-elevated z-[58] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-border">
                <h2 className="font-display text-lg font-bold text-foreground">SharpZone</h2>
                <p className="text-xs text-muted-foreground mt-1">Navigate & Access</p>
              </div>

              {/* Normal Users Section */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-3">User Account</p>
                  {user ? (
                    <div className="space-y-1">
                      <MenuItem icon={<LogIn className="w-4 h-4" />} label="Profile" onClick={() => go("/profile")} />
                      {isAdmin && <MenuItem icon={<Briefcase className="w-4 h-4" />} label="Admin Panel" onClick={() => go("/admin")} />}
                      <MenuItem icon={<SettingsIcon className="w-4 h-4" />} label="Settings" onClick={() => go("/settings")} />
                      <MenuItem
                        icon={<X className="w-4 h-4" />}
                        label="Sign Out"
                        onClick={() => { signOut(); setOpen(false); }}
                        destructive
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <MenuItem icon={<LogIn className="w-4 h-4" />} label="Log In" onClick={() => go("/login")} />
                      <MenuItem icon={<UserPlus className="w-4 h-4" />} label="Sign Up" onClick={() => go("/signup")} />
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="mx-4 border-t border-border" />

                {/* Employee Section */}
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-3">
                    <Briefcase className="w-3 h-3 inline mr-1 -mt-0.5" />
                    Employee Access
                  </p>
                  <div className="space-y-1">
                    <MenuItem icon={<LogIn className="w-4 h-4" />} label="Employee Log In" onClick={() => go("/employee-login")} />
                    <MenuItem icon={<UserPlus className="w-4 h-4" />} label="Employee Sign Up" onClick={() => go("/employee-signup")} />
                  </div>
                </div>

                {/* Divider */}
                <div className="mx-4 border-t border-border" />

                {/* Quick Settings */}
                <div className="p-4">
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-3">Quick Settings</p>
                  <div className="space-y-1">
                    <MenuItem icon={<SettingsIcon className="w-4 h-4" />} label="Settings" onClick={() => go("/settings")} />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border">
                <p className="text-[10px] text-muted-foreground text-center">© 2026 SharpZone</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const MenuItem = ({ icon, label, onClick, destructive }: { icon: React.ReactNode; label: string; onClick: () => void; destructive?: boolean }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      destructive
        ? "text-destructive hover:bg-destructive/10"
        : "text-foreground hover:bg-muted"
    }`}
  >
    {icon}
    {label}
  </button>
);

export default HamburgerMenu;
