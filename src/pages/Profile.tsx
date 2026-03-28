import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Package, Clock, CheckCircle, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { user, profile, isLoading, signOut } = useAuth();

  const { data: orders = [] } = useQuery({
    queryKey: ["my-orders", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*, events(title)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  if (!user) return <Navigate to="/login" />;

  const pending = orders.filter((o) => o.status === "pending");
  const processing = orders.filter((o) => o.status === "processing");
  const completed = orders.filter((o) => o.status === "completed");

  const statCards = [
    { label: "Pending", count: pending.length, icon: Clock, color: "text-yellow-500" },
    { label: "Processing", count: processing.length, icon: Package, color: "text-primary" },
    { label: "Completed", count: completed.length, icon: CheckCircle, color: "text-green-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Welcome, {profile?.full_name || "Sir/Madam"}
            </h1>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/" className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-xl hover:opacity-80 transition">Home</Link>
            <button onClick={signOut} className="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-xl hover:opacity-80 transition">Sign Out</button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {statCards.map((s) => (
            <div key={s.label} className="bg-card rounded-2xl p-5 border border-border shadow-card text-center">
              <s.icon className={`w-8 h-8 mx-auto mb-2 ${s.color}`} />
              <p className="text-2xl font-bold text-foreground">{s.count}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Recent Orders</h2>
        {orders.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 border border-border text-center text-muted-foreground">
            No orders yet. <Link to="/#services" className="text-primary hover:underline">Browse services</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 10).map((order) => (
              <div key={order.id} className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{(order as any).events?.title || "Service Order"}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.created_at!).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">৳{order.final_price}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    order.status === "completed" ? "bg-green-100 text-green-700" :
                    order.status === "processing" ? "bg-blue-100 text-blue-700" :
                    order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
