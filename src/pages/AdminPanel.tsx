import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Users, ShoppingCart, Ticket, Plus, LogOut, Home } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const AdminPanel = () => {
  const { user, profile, isAdmin, isCeo, isLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "events" | "orders" | "customers" | "coupons">("dashboard");

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  if (!user || !isAdmin) return <Navigate to="/login" />;

  const greeting = isCeo ? `Honourable Sir, ${profile?.full_name}` : `Sir/Madam, ${profile?.full_name}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div>
          <h1 className="font-display text-lg font-bold text-foreground">Admin Panel</h1>
          <p className="text-xs text-muted-foreground">Welcome, {greeting}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/" className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:opacity-80 transition"><Home className="w-4 h-4" /></Link>
          <button onClick={signOut} className="p-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-80 transition"><LogOut className="w-4 h-4" /></button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 bg-card border-r border-border min-h-[calc(100vh-52px)] p-3 hidden md:block">
          {[
            { key: "dashboard", label: "Dashboard", icon: BarChart3 },
            { key: "events", label: "Events", icon: Ticket },
            { key: "orders", label: "Orders", icon: ShoppingCart },
            { key: "customers", label: "Customers", icon: Users },
            { key: "coupons", label: "Coupons", icon: Ticket },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key as any)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition ${
                activeTab === item.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </aside>

        {/* Mobile tabs */}
        <div className="md:hidden flex overflow-x-auto border-b border-border bg-card px-2 py-2 gap-1 w-full fixed top-[52px] z-30">
          {["dashboard", "events", "orders", "customers", "coupons"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                activeTab === tab ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 md:mt-0 mt-12">
          {activeTab === "dashboard" && <DashboardTab />}
          {activeTab === "events" && <EventsTab />}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "customers" && <CustomersTab />}
          {activeTab === "coupons" && <CouponsTab />}
        </main>
      </div>
    </div>
  );
};

const DashboardTab = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [orders, events, profiles] = await Promise.all([
        supabase.from("orders").select("status, final_price"),
        supabase.from("events").select("id", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact" }),
      ]);
      const allOrders = orders.data || [];
      const totalRevenue = allOrders.filter(o => o.status === "completed").reduce((s, o) => s + Number(o.final_price), 0);
      return {
        totalOrders: allOrders.length,
        pendingOrders: allOrders.filter(o => o.status === "pending").length,
        totalRevenue,
        totalEvents: events.count || 0,
        totalCustomers: profiles.count || 0,
      };
    },
  });

  const cards = [
    { label: "Total Orders", value: stats?.totalOrders ?? 0, color: "text-primary" },
    { label: "Pending", value: stats?.pendingOrders ?? 0, color: "text-yellow-500" },
    { label: "Revenue", value: `৳${stats?.totalRevenue ?? 0}`, color: "text-green-500" },
    { label: "Events", value: stats?.totalEvents ?? 0, color: "text-accent" },
    { label: "Customers", value: stats?.totalCustomers ?? 0, color: "text-primary" },
  ];

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-foreground mb-4">Dashboard Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card rounded-2xl p-4 border border-border shadow-card">
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const EventsTab = () => {
  const { data: events = [], refetch } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("events").insert({ title, description, price: Number(price) });
    if (error) { toast.error(error.message); return; }
    toast.success("Event created!");
    setShowForm(false);
    setTitle(""); setDescription(""); setPrice("");
    refetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-foreground">Events</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:opacity-90 transition">
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card rounded-xl p-4 border border-border mb-4 space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm" />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm" rows={3} />
          <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" type="number" required className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm" />
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg">Create</button>
        </form>
      )}

      <div className="space-y-2">
        {events.map((ev) => (
          <div key={ev.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{ev.title}</p>
              <p className="text-xs text-muted-foreground">{ev.description?.slice(0, 60)}</p>
            </div>
            <span className="text-sm font-semibold text-primary">৳{ev.price}</span>
          </div>
        ))}
        {events.length === 0 && <p className="text-muted-foreground text-center py-8">No events yet.</p>}
      </div>
    </div>
  );
};

const OrdersTab = () => {
  const { data: orders = [], refetch } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*, events(title), profiles:user_id(full_name)").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Status updated"); refetch(); }
  };

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-foreground mb-4">Orders</h2>
      <div className="space-y-2">
        {orders.map((order: any) => (
          <div key={order.id} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-foreground">{order.events?.title || "Service"}</p>
                <p className="text-xs text-muted-foreground">By: {order.profiles?.full_name || "Customer"}</p>
              </div>
              <span className="text-sm font-semibold text-foreground">৳{order.final_price}</span>
            </div>
            <div className="flex gap-2">
              {["pending", "processing", "completed"].map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(order.id, s)}
                  className={`text-xs px-2 py-1 rounded-full transition ${
                    order.status === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-muted-foreground text-center py-8">No orders yet.</p>}
      </div>
    </div>
  );
};

const CustomersTab = () => {
  const { data: customers = [] } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-foreground mb-4">Customers</h2>
      <div className="space-y-2">
        {customers.map((c) => (
          <div key={c.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{c.full_name || "Unnamed"}</p>
              <p className="text-xs text-muted-foreground">{c.phone}</p>
            </div>
            <span className="text-xs text-muted-foreground">{new Date(c.created_at!).toLocaleDateString()}</span>
          </div>
        ))}
        {customers.length === 0 && <p className="text-muted-foreground text-center py-8">No customers yet.</p>}
      </div>
    </div>
  );
};

const CouponsTab = () => {
  const { data: coupons = [], refetch } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("coupons").insert({ code: code.toUpperCase(), discount_percent: Number(discount) });
    if (error) { toast.error(error.message); return; }
    toast.success("Coupon created!");
    setShowForm(false);
    setCode(""); setDiscount("");
    refetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-foreground">Coupons</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:opacity-90 transition">
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card rounded-xl p-4 border border-border mb-4 space-y-3">
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="Coupon Code" required className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm" />
          <input value={discount} onChange={e => setDiscount(e.target.value)} placeholder="Discount %" type="number" min="1" max="100" required className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm" />
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg">Create</button>
        </form>
      )}

      <div className="space-y-2">
        {coupons.map((c) => (
          <div key={c.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
            <div>
              <p className="font-mono font-medium text-foreground">{c.code}</p>
              <p className="text-xs text-muted-foreground">{c.is_active ? "Active" : "Inactive"}</p>
            </div>
            <span className="text-sm font-semibold text-primary">{c.discount_percent}% OFF</span>
          </div>
        ))}
        {coupons.length === 0 && <p className="text-muted-foreground text-center py-8">No coupons yet.</p>}
      </div>
    </div>
  );
};

export default AdminPanel;
