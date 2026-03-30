import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DynamicIsland from "@/components/DynamicIsland";
import HamburgerMenu from "@/components/HamburgerMenu";

const EmployeeDashboard = () => {
  const { user, roles, isLoading, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) navigate("/employee-login");
  }, [user, isLoading, navigate]);

  const isEmployee = roles.some((r) => ["staff", "admin", "ceo"].includes(r));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isEmployee) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Your employee application is pending approval.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HamburgerMenu />
      {/* Silver-themed header for employees */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Welcome, {profile?.full_name || "Sir/Madam"}!
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Employee Dashboard — SharpZone</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tasks Card */}
          <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">📋 My Tasks</h3>
            <p className="text-muted-foreground text-sm">No tasks assigned yet. Check back soon!</p>
          </div>

          {/* Notifications Card */}
          <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">🔔 Notifications</h3>
            <p className="text-muted-foreground text-sm">No new notifications.</p>
          </div>

          {/* Performance Card */}
          <div className="bg-card rounded-2xl p-6 border border-border shadow-card">
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">📊 Performance</h3>
            <p className="text-muted-foreground text-sm">Performance stats will appear here.</p>
          </div>
        </div>
      </div>

      <DynamicIsland />
    </div>
  );
};

export default EmployeeDashboard;
