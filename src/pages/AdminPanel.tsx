import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChartBar as BarChart3, Users, ShoppingCart, Ticket, Plus, LogOut, Chrome as Home, UserCog, Handshake, BookOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import TeamMembersManagement from "@/components/TeamMembersManagement";

const AdminPanel = () => {
  const { user, profile, isAdmin, isCeo, isLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "events" | "orders" | "customers" | "coupons" | "team" | "partners" | "survey" | "responses" | "blog">("dashboard");

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
            { key: "team", label: "Team", icon: UserCog },
            { key: "partners", label: "Partners", icon: Handshake },
            { key: "blog", label: "Blog Posts", icon: BookOpen },
            { key: "survey", label: "Survey Form", icon: BarChart3 },
            { key: "responses", label: "Responses", icon: Users },
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
          {["dashboard", "events", "orders", "customers", "coupons", "team", "partners"].map((tab) => (
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
          {activeTab === "team" && <TeamMembersManagement />}
          {activeTab === "partners" && <PartnersTab />}
          {activeTab === "blog" && <BlogTab />}
          {activeTab === "survey" && <SurveyFieldsTab />}
          {activeTab === "responses" && <SurveyResponsesTab />}
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

const PartnersTab = () => {
  const { data: partners = [], refetch } = useQuery({
    queryKey: ["admin-partners"],
    queryFn: async () => {
      const { data } = await supabase.from("partners").select("*").order("display_order", { ascending: true });
      return data || [];
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
    website_url: "",
    display_order: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = editingId
      ? await supabase.from("partners").update(formData).eq("id", editingId)
      : await supabase.from("partners").insert(formData);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(editingId ? "Partner updated!" : "Partner added!");
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", logo_url: "", website_url: "", display_order: 0 });
    refetch();
  };

  const handleEdit = (partner: any) => {
    setEditingId(partner.id);
    setFormData({
      name: partner.name,
      logo_url: partner.logo_url,
      website_url: partner.website_url,
      display_order: partner.display_order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this partner?")) return;
    const { error } = await supabase.from("partners").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Partner deleted!");
      refetch();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-foreground">Business Partners</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: "", logo_url: "", website_url: "", display_order: 0 });
          }}
          className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> Add Partner
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-4 border border-border mb-4 space-y-3">
          <input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Partner Name"
            required
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
          />
          <input
            value={formData.logo_url}
            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
            placeholder="Logo URL"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
          />
          <input
            value={formData.website_url}
            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
            placeholder="Website URL"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
          />
          <input
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
            placeholder="Display Order"
            type="number"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
          />
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg">
            {editingId ? "Update" : "Create"}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {partners.map((p: any) => (
          <div key={p.id} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              {p.logo_url && (
                <img src={p.logo_url} alt={p.name} className="w-16 h-12 object-contain" />
              )}
              <div>
                <p className="font-medium text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.website_url}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(p)}
                className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-80 transition text-xs"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="p-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-80 transition text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {partners.length === 0 && <p className="text-muted-foreground text-center py-8">No partners yet.</p>}
      </div>
    </div>
  );
};

const SurveyFieldsTab = () => {
  const { data: fields = [], refetch } = useQuery({
    queryKey: ["admin-form-fields"],
    queryFn: async () => {
      const { data } = await supabase.from("form_fields").select("*").order("display_order", { ascending: true });
      return data || [];
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: "text",
    question: "",
    options: "",
    required: false,
    display_order: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const options = formData.options ? formData.options.split(",").map((o) => o.trim()) : [];
    const payload = { ...formData, options };

    const { error } = editingId
      ? await supabase.from("form_fields").update(payload).eq("id", editingId)
      : await supabase.from("form_fields").insert(payload);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(editingId ? "Field updated!" : "Field added!");
    setShowForm(false);
    setEditingId(null);
    setFormData({ type: "text", question: "", options: "", required: false, display_order: 0 });
    refetch();
  };

  const handleEdit = (field: any) => {
    setEditingId(field.id);
    setFormData({
      type: field.type,
      question: field.question,
      options: field.options?.join(", ") || "",
      required: field.required,
      display_order: field.display_order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this field?")) return;
    const { error } = await supabase.from("form_fields").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Field deleted!");
      refetch();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-foreground">Survey Form Fields</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ type: "text", question: "", options: "", required: false, display_order: 0 });
          }}
          className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> Add Field
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-4 border border-border mb-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Field Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
            >
              <option value="text">Text</option>
              <option value="textarea">Text Area</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="checkbox">Checkbox</option>
              <option value="dropdown">Dropdown</option>
            </select>
          </div>
          <input
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            placeholder="Question"
            required
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
          />
          {["multiple_choice", "checkbox", "dropdown"].includes(formData.type) && (
            <input
              value={formData.options}
              onChange={(e) => setFormData({ ...formData, options: e.target.value })}
              placeholder="Options (comma-separated)"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
            />
          )}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.required}
              onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
              id="required"
              className="w-4 h-4"
            />
            <label htmlFor="required" className="text-sm text-foreground">Required</label>
          </div>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg">
            {editingId ? "Update" : "Create"}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {fields.map((f: any) => (
          <div key={f.id} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-foreground">{f.question}</p>
                <p className="text-xs text-muted-foreground">{f.type} {f.required && "• Required"}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(f)}
                  className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-80 transition text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(f.id)}
                  className="p-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-80 transition text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
            {f.options && f.options.length > 0 && (
              <p className="text-xs text-muted-foreground">Options: {f.options.join(", ")}</p>
            )}
          </div>
        ))}
        {fields.length === 0 && <p className="text-muted-foreground text-center py-8">No survey fields yet.</p>}
      </div>
    </div>
  );
};

const SurveyResponsesTab = () => {
  const { data: responses = [] } = useQuery({
    queryKey: ["admin-form-responses"],
    queryFn: async () => {
      const { data } = await supabase.from("form_responses").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const handleExport = () => {
    if (responses.length === 0) {
      toast.error("No responses to export");
      return;
    }

    const headers = ["Submitted At", "Responses"];
    const rows = responses.map((r: any) => [
      new Date(r.submitted_at).toLocaleString(),
      JSON.stringify(r.responses),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `survey-responses-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Responses exported!");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-foreground">Survey Responses ({responses.length})</h2>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:opacity-90 transition"
        >
          Export as CSV
        </button>
      </div>

      <div className="space-y-2">
        {responses.map((r: any) => (
          <div key={r.id} className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-2">{new Date(r.submitted_at).toLocaleString()}</p>
            <pre className="bg-background p-2 rounded-lg text-xs overflow-auto max-h-32 text-foreground">
              {JSON.stringify(r.responses, null, 2)}
            </pre>
          </div>
        ))}
        {responses.length === 0 && <p className="text-muted-foreground text-center py-8">No responses yet.</p>}
      </div>
    </div>
  );
};

const BlogTab = () => {
  const { data: posts = [], refetch } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "General",
    tags: "",
    thumbnail_url: "",
    is_published: false,
  });

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = formData.slug || generateSlug(formData.title);
    const tags = formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [];
    const payload = { ...formData, slug, tags };

    const { error } = editingId
      ? await supabase.from("blog_posts").update(payload).eq("id", editingId)
      : await supabase.from("blog_posts").insert(payload);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(editingId ? "Post updated!" : "Post created!");
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: "", slug: "", excerpt: "", content: "", category: "General", tags: "", thumbnail_url: "", is_published: false });
    refetch();
  };

  const handleEdit = (post: any) => {
    setEditingId(post.id);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      tags: post.tags?.join(", ") || "",
      thumbnail_url: post.thumbnail_url,
      is_published: post.is_published,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Post deleted!");
      refetch();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-foreground">Blog Posts</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ title: "", slug: "", excerpt: "", content: "", category: "General", tags: "", thumbnail_url: "", is_published: false });
          }}
          className="flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-4 border border-border mb-4 space-y-3">
          <input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Title"
            required
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
          />
          <input
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="Slug (auto-generated if empty)"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
          />
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            placeholder="Excerpt"
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm resize-none"
          />
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Content"
            rows={5}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm resize-none"
          />
          <input
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Category"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
          />
          <input
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="Tags (comma-separated)"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
          />
          <input
            value={formData.thumbnail_url}
            onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
            placeholder="Thumbnail URL"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm text-foreground">Publish Post</span>
          </label>
          <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg">
            {editingId ? "Update" : "Create"}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {posts.map((p: any) => (
          <div key={p.id} className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-foreground">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.category} {p.is_published ? "• Published" : "• Draft"}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-80 transition text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-80 transition text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">{p.excerpt}</p>
          </div>
        ))}
        {posts.length === 0 && <p className="text-muted-foreground text-center py-8">No blog posts yet.</p>}
      </div>
    </div>
  );
};

export default AdminPanel;
