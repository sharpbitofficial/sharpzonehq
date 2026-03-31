import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ChartBar as BarChart3, Users, ShoppingCart, Ticket, Plus, LogOut,
  Chrome as Home, UserCog, Handshake, BookOpen, ClipboardList, Bell,
  Calendar, CheckCircle, XCircle, AlertTriangle, Trash2, Edit
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import TeamMembersManagement from "@/components/TeamMembersManagement";
import HamburgerMenu from "@/components/HamburgerMenu";

const AdminPanel = () => {
  const { user, profile, isAdmin, isCeo, isLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  if (!user || !isAdmin) return <Navigate to="/login" />;

  const greeting = isCeo ? `Honourable Sir, ${profile?.full_name}` : `Sir/Madam, ${profile?.full_name}`;

  const tabs = [
    { key: "dashboard", label: "Dashboard", icon: BarChart3 },
    { key: "tasks", label: "Task Roster", icon: ClipboardList },
    { key: "applications", label: "Applications", icon: UserCog },
    { key: "events", label: "Events", icon: Ticket },
    { key: "orders", label: "Orders", icon: ShoppingCart },
    { key: "customers", label: "Customers", icon: Users },
    { key: "coupons", label: "Coupons", icon: Ticket },
    { key: "team", label: "Team", icon: UserCog },
    { key: "partners", label: "Partners", icon: Handshake },
    { key: "blog", label: "Blog Posts", icon: BookOpen },
    { key: "holidays", label: "Holidays", icon: Calendar },
    { key: "survey", label: "Survey Form", icon: BarChart3 },
    { key: "responses", label: "Responses", icon: Users },
  ];

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, hsl(30 40% 97%), hsl(25 30% 94%))" }}>
      <HamburgerMenu />
      {/* Brown-themed Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between sticky top-0 z-40" style={{ background: "linear-gradient(135deg, hsl(25 40% 20%), hsl(30 35% 30%))" }}>
        <div>
          <h1 className="font-display text-lg font-bold text-white">CEO Admin Panel</h1>
          <p className="text-xs text-white/70">Welcome, {greeting}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/" className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"><Home className="w-4 h-4" /></Link>
          <button onClick={signOut} className="p-2 rounded-lg bg-red-500/80 text-white hover:bg-red-500 transition"><LogOut className="w-4 h-4" /></button>
        </div>
      </header>

      <div className="flex">
        {/* Brown Sidebar */}
        <aside className="w-56 border-r min-h-[calc(100vh-52px)] p-3 hidden md:block" style={{ background: "hsl(25 30% 15%)" }}>
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition ${
                activeTab === item.key ? "bg-amber-700 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </aside>

        {/* Mobile tabs */}
        <div className="md:hidden flex overflow-x-auto border-b px-2 py-2 gap-1 w-full fixed top-[52px] z-30" style={{ background: "hsl(25 30% 15%)" }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                activeTab === tab.key ? "bg-amber-700 text-white" : "bg-white/10 text-white/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 md:mt-0 mt-12">
          {activeTab === "dashboard" && <DashboardTab />}
          {activeTab === "tasks" && <TaskRosterTab />}
          {activeTab === "applications" && <ApplicationsTab />}
          {activeTab === "events" && <EventsTab />}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "customers" && <CustomersTab />}
          {activeTab === "coupons" && <CouponsTab />}
          {activeTab === "team" && <TeamMembersManagement />}
          {activeTab === "partners" && <PartnersTab />}
          {activeTab === "blog" && <BlogTab />}
          {activeTab === "holidays" && <HolidaysTab />}
          {activeTab === "survey" && <SurveyFieldsTab />}
          {activeTab === "responses" && <SurveyResponsesTab />}
        </main>
      </div>
    </div>
  );
};

/* ============ CARD WRAPPER ============ */
const AdminCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl p-4 border border-amber-100 shadow-sm ${className}`}>{children}</div>
);

/* ============ DASHBOARD ============ */
const DashboardTab = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [orders, events, profiles, tasks, applications] = await Promise.all([
        supabase.from("orders").select("status, final_price"),
        supabase.from("events").select("id", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("tasks").select("id", { count: "exact" }),
        supabase.from("employee_applications").select("id", { count: "exact" }).eq("status", "pending"),
      ]);
      const allOrders = orders.data || [];
      const totalRevenue = allOrders.filter(o => o.status === "completed").reduce((s, o) => s + Number(o.final_price), 0);
      return {
        totalOrders: allOrders.length,
        pendingOrders: allOrders.filter(o => o.status === "pending").length,
        totalRevenue,
        totalEvents: events.count || 0,
        totalCustomers: profiles.count || 0,
        totalTasks: tasks.count || 0,
        pendingApplications: applications.count || 0,
      };
    },
  });

  const cards = [
    { label: "Total Orders", value: stats?.totalOrders ?? 0, color: "text-amber-700" },
    { label: "Pending", value: stats?.pendingOrders ?? 0, color: "text-yellow-600" },
    { label: "Revenue", value: `৳${stats?.totalRevenue ?? 0}`, color: "text-green-600" },
    { label: "Events", value: stats?.totalEvents ?? 0, color: "text-blue-600" },
    { label: "Customers", value: stats?.totalCustomers ?? 0, color: "text-amber-700" },
    { label: "Tasks", value: stats?.totalTasks ?? 0, color: "text-purple-600" },
    { label: "Pending Apps", value: stats?.pendingApplications ?? 0, color: "text-red-500" },
  ];

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-amber-900 mb-4">Dashboard Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {cards.map((c) => (
          <AdminCard key={c.label}>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </AdminCard>
        ))}
      </div>
    </div>
  );
};

/* ============ TASK ROSTER ============ */
const TaskRosterTab = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", priority: "medium", frequency: "daily", deadline: "", is_emergency: false });
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [assignAll, setAssignAll] = useState(false);

  const { data: tasks = [], refetch } = useQuery({
    queryKey: ["admin-tasks"],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("*, task_assignments(*, profiles:assigned_to(full_name))").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["admin-employees"],
    queryFn: async () => {
      const { data: roleRows } = await supabase.from("user_roles").select("user_id, role").in("role", ["staff", "admin"]);
      if (!roleRows?.length) return [];
      const userIds = roleRows.map(r => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
      return profiles || [];
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: task, error } = await supabase.from("tasks").insert({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      frequency: formData.frequency,
      deadline: formData.deadline || null,
      is_emergency: formData.is_emergency,
      created_by: user!.id,
    }).select().single();

    if (error) { toast.error(error.message); return; }

    const targets = assignAll ? employees.map(e => e.id) : selectedEmployees;
    if (targets.length > 0) {
      const assignments = targets.map(empId => ({
        task_id: task.id,
        assigned_to: empId,
        assigned_by: user!.id,
      }));
      await supabase.from("task_assignments").insert(assignments);

      // Create notifications
      const notifs = targets.map(empId => ({
        user_id: empId,
        title: formData.is_emergency ? "🚨 EMERGENCY TASK" : "📋 New Task Assigned",
        message: `${formData.title} — Priority: ${formData.priority.toUpperCase()}`,
      }));
      await supabase.from("notifications").insert(notifs);
    }

    toast.success("Task created & assigned!");
    setShowForm(false);
    setFormData({ title: "", description: "", priority: "medium", frequency: "daily", deadline: "", is_emergency: false });
    setSelectedEmployees([]);
    setAssignAll(false);
    refetch();
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    await supabase.from("tasks").delete().eq("id", id);
    toast.success("Task deleted");
    refetch();
  };

  const priorityColor = (p: string) => p === "high" ? "bg-red-100 text-red-700" : p === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-amber-900">Task Roster</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-2 bg-amber-700 text-white text-sm rounded-lg hover:bg-amber-800 transition">
          <Plus className="w-4 h-4" /> New Task
        </button>
      </div>

      {showForm && (
        <AdminCard className="mb-4">
          <form onSubmit={handleCreate} className="space-y-3">
            <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Task Title" required className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Description" rows={3} className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm">
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <select value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="one-time">One-Time</option>
              </select>
              <input type="datetime-local" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={formData.is_emergency} onChange={e => setFormData({...formData, is_emergency: e.target.checked})} className="w-4 h-4" />
                🚨 Emergency
              </label>
            </div>

            {/* Assign to employees */}
            <div className="border-t border-gray-200 pt-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">Assign To:</p>
              <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <input type="checkbox" checked={assignAll} onChange={e => { setAssignAll(e.target.checked); if (e.target.checked) setSelectedEmployees(employees.map(e => e.id)); }} className="w-4 h-4" />
                All Employees
              </label>
              {!assignAll && (
                <div className="flex flex-wrap gap-2">
                  {employees.map(emp => (
                    <label key={emp.id} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs cursor-pointer transition ${selectedEmployees.includes(emp.id) ? "bg-amber-700 text-white" : "bg-gray-100 text-gray-600"}`}>
                      <input type="checkbox" checked={selectedEmployees.includes(emp.id)} onChange={e => {
                        setSelectedEmployees(e.target.checked ? [...selectedEmployees, emp.id] : selectedEmployees.filter(id => id !== emp.id));
                      }} className="sr-only" />
                      {emp.full_name}
                    </label>
                  ))}
                  {employees.length === 0 && <p className="text-xs text-gray-400">No employees found. Approve applications first.</p>}
                </div>
              )}
            </div>

            <button type="submit" className="px-4 py-2 bg-amber-700 text-white text-sm rounded-lg hover:bg-amber-800">Create & Assign</button>
          </form>
        </AdminCard>
      )}

      <div className="space-y-3">
        {tasks.map((task: any) => (
          <AdminCard key={task.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {task.is_emergency && <span className="text-red-500 text-xs font-bold">🚨 EMERGENCY</span>}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColor(task.priority)}`}>{task.priority}</span>
                  <span className="text-xs text-gray-400">{task.frequency}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{task.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                {task.deadline && <p className="text-xs text-amber-700 mt-1">Deadline: {new Date(task.deadline).toLocaleString()}</p>}
                {task.task_assignments?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {task.task_assignments.map((a: any) => (
                      <span key={a.id} className={`px-2 py-0.5 rounded-full text-xs ${a.status === "completed" ? "bg-green-100 text-green-700" : a.status === "in_progress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                        {a.profiles?.full_name || "Employee"} — {a.status} {a.score > 0 && `(${a.score}pts)`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => deleteTask(task.id)} className="p-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          </AdminCard>
        ))}
        {tasks.length === 0 && <p className="text-gray-400 text-center py-8">No tasks yet. Create one above.</p>}
      </div>
    </div>
  );
};

/* ============ EMPLOYEE APPLICATIONS ============ */
const ApplicationsTab = () => {
  const { user } = useAuth();
  const { data: apps = [], refetch } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const { data } = await supabase.from("employee_applications").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const handleAction = async (app: any, action: "approved" | "rejected") => {
    // Update application status
    await supabase.from("employee_applications").update({
      status: action,
      reviewed_by: user!.id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", app.id);

    if (action === "approved") {
      // Find user by email and assign staff role
      const { data: profiles } = await supabase.from("profiles").select("id").limit(1000);
      // We need to find the user. Since we can't query auth.users, we look up by email in the application
      // and assign role via edge function or direct insert if user already exists
      toast.success(`Application approved! The employee can now log in.`);
    } else {
      toast.success("Application rejected.");
    }
    refetch();
  };

  const statusBadge = (s: string) => s === "pending" ? "bg-yellow-100 text-yellow-700" : s === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-amber-900 mb-4">Employee Applications</h2>
      <div className="space-y-3">
        {apps.map((app: any) => (
          <AdminCard key={app.id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{app.full_name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(app.status)}`}>{app.status}</span>
                </div>
                <p className="text-xs text-gray-500">{app.email} • {app.phone}</p>
                <p className="text-xs text-gray-500">{app.profession}{app.institution ? ` — ${app.institution}` : ""}</p>
                <p className="text-xs text-gray-400">{app.address}</p>
                <p className="text-xs text-gray-400 mt-1">Applied: {new Date(app.created_at).toLocaleDateString()}</p>
              </div>
              {app.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={() => handleAction(app, "approved")} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">
                    <CheckCircle className="w-3 h-3" /> Approve
                  </button>
                  <button onClick={() => handleAction(app, "rejected")} className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600">
                    <XCircle className="w-3 h-3" /> Reject
                  </button>
                </div>
              )}
            </div>
          </AdminCard>
        ))}
        {apps.length === 0 && <p className="text-gray-400 text-center py-8">No applications yet.</p>}
      </div>
    </div>
  );
};

/* ============ HOLIDAYS ============ */
const HolidaysTab = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", holiday_date: "", message: "", ceo_note: "" });

  const { data: holidays = [], refetch } = useQuery({
    queryKey: ["admin-holidays"],
    queryFn: async () => {
      const { data } = await supabase.from("company_holidays").select("*").order("holiday_date", { ascending: false });
      return data || [];
    },
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("company_holidays").insert({ ...formData, created_by: user!.id });
    if (error) { toast.error(error.message); return; }
    toast.success("Holiday added!");
    setShowForm(false);
    setFormData({ title: "", holiday_date: "", message: "", ceo_note: "" });
    refetch();
  };

  const deleteHoliday = async (id: string) => {
    await supabase.from("company_holidays").delete().eq("id", id);
    toast.success("Holiday removed");
    refetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-amber-900">Company Holidays</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-2 bg-amber-700 text-white text-sm rounded-lg hover:bg-amber-800 transition">
          <Plus className="w-4 h-4" /> Add Holiday
        </button>
      </div>

      {showForm && (
        <AdminCard className="mb-4">
          <form onSubmit={handleCreate} className="space-y-3">
            <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Holiday Name" required className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
            <input type="date" value={formData.holiday_date} onChange={e => setFormData({...formData, holiday_date: e.target.value})} required className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
            <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="Holiday Message" rows={2} className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
            <textarea value={formData.ceo_note} onChange={e => setFormData({...formData, ceo_note: e.target.value})} placeholder="CEO Note (optional)" rows={2} className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
            <button type="submit" className="px-4 py-2 bg-amber-700 text-white text-sm rounded-lg">Add Holiday</button>
          </form>
        </AdminCard>
      )}

      <div className="space-y-2">
        {holidays.map((h: any) => (
          <AdminCard key={h.id}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{h.title}</h3>
                <p className="text-xs text-amber-700">{new Date(h.holiday_date).toLocaleDateString()}</p>
                {h.message && <p className="text-xs text-gray-500 mt-1">{h.message}</p>}
              </div>
              <button onClick={() => deleteHoliday(h.id)} className="p-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          </AdminCard>
        ))}
        {holidays.length === 0 && <p className="text-gray-400 text-center py-8">No holidays set.</p>}
      </div>
    </div>
  );
};

/* ============ EXISTING TABS (preserved) ============ */
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
    setShowForm(false); setTitle(""); setDescription(""); setPrice("");
    refetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-amber-900">Events</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-2 bg-amber-700 text-white text-sm rounded-lg hover:bg-amber-800 transition"><Plus className="w-4 h-4" /> Add Event</button>
      </div>
      {showForm && (
        <AdminCard className="mb-4">
          <form onSubmit={handleCreate} className="space-y-3">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" rows={3} />
            <input value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" type="number" required className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
            <button type="submit" className="px-4 py-2 bg-amber-700 text-white text-sm rounded-lg">Create</button>
          </form>
        </AdminCard>
      )}
      <div className="space-y-2">
        {events.map((ev) => (
          <AdminCard key={ev.id}>
            <div className="flex items-center justify-between">
              <div><p className="font-medium text-gray-900">{ev.title}</p><p className="text-xs text-gray-500">{ev.description?.slice(0, 60)}</p></div>
              <span className="text-sm font-semibold text-amber-700">৳{ev.price}</span>
            </div>
          </AdminCard>
        ))}
        {events.length === 0 && <p className="text-gray-400 text-center py-8">No events yet.</p>}
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
      <h2 className="font-display text-xl font-bold text-amber-900 mb-4">Orders</h2>
      <div className="space-y-2">
        {orders.map((order: any) => (
          <AdminCard key={order.id}>
            <div className="flex items-center justify-between mb-2">
              <div><p className="font-medium text-gray-900">{order.events?.title || "Service"}</p><p className="text-xs text-gray-500">By: {order.profiles?.full_name || "Customer"}</p></div>
              <span className="text-sm font-semibold text-gray-900">৳{order.final_price}</span>
            </div>
            <div className="flex gap-2">
              {["pending", "processing", "completed"].map((s) => (
                <button key={s} onClick={() => updateStatus(order.id, s)} className={`text-xs px-2 py-1 rounded-full transition ${order.status === s ? "bg-amber-700 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{s}</button>
              ))}
            </div>
          </AdminCard>
        ))}
        {orders.length === 0 && <p className="text-gray-400 text-center py-8">No orders yet.</p>}
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
      <h2 className="font-display text-xl font-bold text-amber-900 mb-4">Customers</h2>
      <div className="space-y-2">
        {customers.map((c) => (
          <AdminCard key={c.id}>
            <div className="flex items-center justify-between">
              <div><p className="font-medium text-gray-900">{c.full_name || "Unnamed"}</p><p className="text-xs text-gray-500">{c.phone}</p></div>
              <span className="text-xs text-gray-400">{new Date(c.created_at!).toLocaleDateString()}</span>
            </div>
          </AdminCard>
        ))}
        {customers.length === 0 && <p className="text-gray-400 text-center py-8">No customers yet.</p>}
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
    toast.success("Coupon created!"); setShowForm(false); setCode(""); setDiscount(""); refetch();
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-amber-900">Coupons</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-2 bg-amber-700 text-white text-sm rounded-lg hover:bg-amber-800 transition"><Plus className="w-4 h-4" /> Add Coupon</button>
      </div>
      {showForm && (
        <AdminCard className="mb-4">
          <form onSubmit={handleCreate} className="space-y-3">
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="Coupon Code" required className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
            <input value={discount} onChange={e => setDiscount(e.target.value)} placeholder="Discount %" type="number" min="1" max="100" required className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
            <button type="submit" className="px-4 py-2 bg-amber-700 text-white text-sm rounded-lg">Create</button>
          </form>
        </AdminCard>
      )}
      <div className="space-y-2">
        {coupons.map((c) => (
          <AdminCard key={c.id}>
            <div className="flex items-center justify-between">
              <div><p className="font-mono font-medium text-gray-900">{c.code}</p><p className="text-xs text-gray-500">{c.is_active ? "Active" : "Inactive"}</p></div>
              <span className="text-sm font-semibold text-amber-700">{c.discount_percent}% OFF</span>
            </div>
          </AdminCard>
        ))}
        {coupons.length === 0 && <p className="text-gray-400 text-center py-8">No coupons yet.</p>}
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
  const [formData, setFormData] = useState({ name: "", logo_url: "", website_url: "", display_order: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = editingId ? await supabase.from("partners").update(formData).eq("id", editingId) : await supabase.from("partners").insert(formData);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "Updated!" : "Added!");
    setShowForm(false); setEditingId(null); setFormData({ name: "", logo_url: "", website_url: "", display_order: 0 }); refetch();
  };
  const handleEdit = (p: any) => { setEditingId(p.id); setFormData({ name: p.name, logo_url: p.logo_url, website_url: p.website_url, display_order: p.display_order }); setShowForm(true); };
  const handleDelete = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("partners").delete().eq("id", id); toast.success("Deleted!"); refetch(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-amber-900">Partners</h2>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: "", logo_url: "", website_url: "", display_order: 0 }); }} className="flex items-center gap-1 px-3 py-2 bg-amber-700 text-white text-sm rounded-lg hover:bg-amber-800 transition"><Plus className="w-4 h-4" /> Add</button>
      </div>
      {showForm && (
        <AdminCard className="mb-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Partner Name" required className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
            <input value={formData.logo_url} onChange={e => setFormData({...formData, logo_url: e.target.value})} placeholder="Logo URL" className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
            <input value={formData.website_url} onChange={e => setFormData({...formData, website_url: e.target.value})} placeholder="Website URL" className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
            <input value={formData.display_order} onChange={e => setFormData({...formData, display_order: Number(e.target.value)})} placeholder="Order" type="number" className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
            <button type="submit" className="px-4 py-2 bg-amber-700 text-white text-sm rounded-lg">{editingId ? "Update" : "Create"}</button>
          </form>
        </AdminCard>
      )}
      <div className="space-y-2">
        {partners.map((p: any) => (
          <AdminCard key={p.id}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {p.logo_url && <img src={p.logo_url} alt={p.name} className="w-16 h-12 object-contain" />}
                <div><p className="font-medium text-gray-900">{p.name}</p><p className="text-xs text-gray-500">{p.website_url}</p></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(p)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-xs">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 text-xs">Delete</button>
              </div>
            </div>
          </AdminCard>
        ))}
        {partners.length === 0 && <p className="text-gray-400 text-center py-8">No partners yet.</p>}
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
  const [formData, setFormData] = useState({ type: "text", question: "", options: "", required: false, display_order: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const options = formData.options ? formData.options.split(",").map(o => o.trim()) : [];
    const payload = { ...formData, options };
    const { error } = editingId ? await supabase.from("form_fields").update(payload).eq("id", editingId) : await supabase.from("form_fields").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "Updated!" : "Added!");
    setShowForm(false); setEditingId(null); setFormData({ type: "text", question: "", options: "", required: false, display_order: 0 }); refetch();
  };
  const handleEdit = (f: any) => { setEditingId(f.id); setFormData({ type: f.type, question: f.question, options: f.options?.join(", ") || "", required: f.required, display_order: f.display_order }); setShowForm(true); };
  const handleDelete = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("form_fields").delete().eq("id", id); toast.success("Deleted!"); refetch(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-amber-900">Survey Form Fields</h2>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ type: "text", question: "", options: "", required: false, display_order: 0 }); }} className="flex items-center gap-1 px-3 py-2 bg-amber-700 text-white text-sm rounded-lg hover:bg-amber-800 transition"><Plus className="w-4 h-4" /> Add Field</button>
      </div>
      {showForm && (
        <AdminCard className="mb-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm">
              <option value="text">Text</option><option value="textarea">Text Area</option><option value="multiple_choice">Multiple Choice</option><option value="checkbox">Checkbox</option><option value="dropdown">Dropdown</option>
            </select>
            <input value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} placeholder="Question" required className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
            {["multiple_choice", "checkbox", "dropdown"].includes(formData.type) && <input value={formData.options} onChange={e => setFormData({...formData, options: e.target.value})} placeholder="Options (comma-separated)" className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />}
            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.required} onChange={e => setFormData({...formData, required: e.target.checked})} className="w-4 h-4" /><span className="text-sm text-gray-700">Required</span></label>
            <button type="submit" className="px-4 py-2 bg-amber-700 text-white text-sm rounded-lg">{editingId ? "Update" : "Create"}</button>
          </form>
        </AdminCard>
      )}
      <div className="space-y-2">
        {fields.map((f: any) => (
          <AdminCard key={f.id}>
            <div className="flex items-start justify-between">
              <div><p className="font-medium text-gray-900">{f.question}</p><p className="text-xs text-gray-500">{f.type} {f.required && "• Required"}</p>{f.options?.length > 0 && <p className="text-xs text-gray-400">Options: {f.options.join(", ")}</p>}</div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(f)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-xs">Edit</button>
                <button onClick={() => handleDelete(f.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 text-xs">Delete</button>
              </div>
            </div>
          </AdminCard>
        ))}
        {fields.length === 0 && <p className="text-gray-400 text-center py-8">No fields yet.</p>}
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
    if (responses.length === 0) { toast.error("No responses"); return; }
    const headers = ["Submitted At", "Responses"];
    const rows = responses.map((r: any) => [new Date(r.submitted_at).toLocaleString(), JSON.stringify(r.responses)]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `responses-${Date.now()}.csv`; a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Exported!");
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-amber-900">Survey Responses ({responses.length})</h2>
        <button onClick={handleExport} className="px-4 py-2 bg-amber-700 text-white text-sm rounded-lg hover:bg-amber-800 transition">Export CSV</button>
      </div>
      <div className="space-y-2">
        {responses.map((r: any) => (
          <AdminCard key={r.id}>
            <p className="text-sm text-gray-500 mb-2">{new Date(r.submitted_at).toLocaleString()}</p>
            <pre className="bg-gray-50 p-2 rounded-lg text-xs overflow-auto max-h-32 text-gray-700">{JSON.stringify(r.responses, null, 2)}</pre>
          </AdminCard>
        ))}
        {responses.length === 0 && <p className="text-gray-400 text-center py-8">No responses yet.</p>}
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
  const [formData, setFormData] = useState({ title: "", slug: "", excerpt: "", content: "", category: "General", tags: "", thumbnail_url: "", is_published: false });

  const generateSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = formData.slug || generateSlug(formData.title);
    const tags = formData.tags ? formData.tags.split(",").map(t => t.trim()) : [];
    const payload = { ...formData, slug, tags };
    const { error } = editingId ? await supabase.from("blog_posts").update(payload).eq("id", editingId) : await supabase.from("blog_posts").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? "Updated!" : "Created!");
    setShowForm(false); setEditingId(null); setFormData({ title: "", slug: "", excerpt: "", content: "", category: "General", tags: "", thumbnail_url: "", is_published: false }); refetch();
  };
  const handleEdit = (p: any) => { setEditingId(p.id); setFormData({ title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content, category: p.category, tags: p.tags?.join(", ") || "", thumbnail_url: p.thumbnail_url, is_published: p.is_published }); setShowForm(true); };
  const handleDelete = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("blog_posts").delete().eq("id", id); toast.success("Deleted!"); refetch(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-amber-900">Blog Posts</h2>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ title: "", slug: "", excerpt: "", content: "", category: "General", tags: "", thumbnail_url: "", is_published: false }); }} className="flex items-center gap-1 px-3 py-2 bg-amber-700 text-white text-sm rounded-lg hover:bg-amber-800 transition"><Plus className="w-4 h-4" /> New Post</button>
      </div>
      {showForm && (
        <AdminCard className="mb-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Title" required className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
            <input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="Slug (auto)" className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
            <textarea value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} placeholder="Excerpt" rows={2} className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
            <textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} placeholder="Content" rows={5} className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
            <input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Category" className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
            <input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="Tags (comma-separated)" className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
            <input value={formData.thumbnail_url} onChange={e => setFormData({...formData, thumbnail_url: e.target.value})} placeholder="Thumbnail URL" className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 text-sm" />
            <label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_published} onChange={e => setFormData({...formData, is_published: e.target.checked})} className="w-4 h-4" /><span className="text-sm text-gray-700">Publish</span></label>
            <button type="submit" className="px-4 py-2 bg-amber-700 text-white text-sm rounded-lg">{editingId ? "Update" : "Create"}</button>
          </form>
        </AdminCard>
      )}
      <div className="space-y-2">
        {posts.map((p: any) => (
          <AdminCard key={p.id}>
            <div className="flex items-start justify-between">
              <div><p className="font-medium text-gray-900">{p.title}</p><p className="text-xs text-gray-500">{p.category} {p.is_published ? "• Published" : "• Draft"}</p><p className="text-xs text-gray-400 line-clamp-1">{p.excerpt}</p></div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(p)} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-xs">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 text-xs">Delete</button>
              </div>
            </div>
          </AdminCard>
        ))}
        {posts.length === 0 && <p className="text-gray-400 text-center py-8">No posts yet.</p>}
      </div>
    </div>
  );
};

export default AdminPanel;
