import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Moon, Sun, Globe } from "lucide-react";

const Settings = () => {
  const { user, isLoading } = useAuth();
  const [settings, setSettings] = useState({
    language: "en",
    dark_mode: false,
    notifications_enabled: true,
    email_notifications: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchSettings = async () => {
      const { data } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setSettings(data);
        if (data.dark_mode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    fetchSettings();
  }, [user]);

  const handleSettingChange = (key: string, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);

    if (key === "dark_mode") {
      if (value) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from("user_settings")
      .update(settings)
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Settings saved successfully!");
    }
  };

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your preferences and account settings</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-6">
          {/* Dark Mode */}
          <div className="pb-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.dark_mode ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-primary" />
                )}
                <div>
                  <h3 className="font-semibold text-foreground">Dark Mode</h3>
                  <p className="text-sm text-muted-foreground">Toggle dark theme for the interface</p>
                </div>
              </div>
              <button
                onClick={() => handleSettingChange("dark_mode", !settings.dark_mode)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  settings.dark_mode ? "bg-primary" : "bg-secondary"
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.dark_mode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Language */}
          <div className="pb-6 border-b border-border">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">Language</h3>
                <p className="text-sm text-muted-foreground">Choose your preferred language</p>
              </div>
            </div>
            <div className="flex gap-3">
              {[
                { value: "en", label: "English" },
                { value: "bn", label: "Bangla (বাংলা)" },
              ].map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => handleSettingChange("language", lang.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    settings.language === lang.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:opacity-80"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="pb-6 border-b border-border">
            <h3 className="font-semibold text-foreground mb-4">Notifications</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications_enabled}
                  onChange={(e) => handleSettingChange("notifications_enabled", e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-foreground">Enable in-app notifications</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.email_notifications}
                  onChange={(e) => handleSettingChange("email_notifications", e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-foreground">Enable email notifications</span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
