import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DynamicIsland from "@/components/DynamicIsland";
import HamburgerMenu from "@/components/HamburgerMenu";
import { CheckCircle, Clock, AlertTriangle, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const EmployeeDashboard = () => {
  const { user, roles, isLoading, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) navigate("/employee-login");
  }, [user, isLoading, navigate]);

  const isEmployee = roles.some((r) => ["staff", "admin", "ceo"].includes(r));

  // Fetch assigned tasks
  const { data: assignments = [], refetch: refetchAssignments } = useQuery({
    queryKey: ["employee-assignments", user?.id],
    enabled: !!user && isEmployee,
    queryFn: async () => {
      const { data } = await supabase
        .from("task_assignments")
        .select("*, tasks(*)")
        .eq("assigned_to", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  // Fetch notifications
  const { data: notifications = [], refetch: refetchNotifs } = useQuery({
    queryKey: ["employee-notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  // Fetch holidays
  const { data: holidays = [] } = useQuery({
    queryKey: ["employee-holidays"],
    enabled: !!user && isEmployee,
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("company_holidays")
        .select("id, title, holiday_date, message, created_by, created_at")
        .gte("holiday_date", today)
        .order("holiday_date", { ascending: true })
        .limit(5);
      return data || [];
    },
  });

  // Check if today is a holiday
  const todayStr = new Date().toISOString().split("T")[0];
  const todayHoliday = holidays.find((h: any) => h.holiday_date === todayStr);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("employee-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "task_assignments", filter: `assigned_to=eq.${user.id}` }, () => {
        refetchAssignments();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => {
        refetchNotifs();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const completeTask = async (assignmentId: string) => {
    const report = prompt("Please describe your work (required):");
    if (!report?.trim()) { toast.error("Report text is required"); return; }

    await supabase.from("task_assignments").update({
      status: "completed",
      report_text: report,
      completed_at: new Date().toISOString(),
      score: 10,
    }).eq("id", assignmentId);

    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    toast.success("🎉 Congratulations! Task completed successfully!");
    refetchAssignments();
  };

  const startTask = async (assignmentId: string) => {
    await supabase.from("task_assignments").update({ status: "in_progress" }).eq("id", assignmentId);
    toast.success("Task started!");
    refetchAssignments();
  };

  const openWhatsApp = () => {
    window.open("https://wa.me/8801942485183?text=Honourable%20Sir%2C%20I%20need%20help%20with%20a%20task.", "_blank");
  };

  const markNotifRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    refetchNotifs();
  };

  // Performance stats
  const completedCount = assignments.filter((a: any) => a.status === "completed").length;
  const pendingCount = assignments.filter((a: any) => a.status === "pending").length;
  const totalScore = assignments.reduce((s: number, a: any) => s + (a.score || 0), 0);

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
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, hsl(0 0% 97%), hsl(0 0% 93%))" }}>
      <HamburgerMenu />

      {/* Confetti overlay */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-6xl"
            >
              🎉✨🏆
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Holiday Banner */}
      {todayHoliday && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 text-center">
          <p className="font-display font-bold text-lg">🎉 Today is {todayHoliday.title}!</p>
          {todayHoliday.message && <p className="text-sm mt-1">{todayHoliday.message}</p>}
          
        </div>
      )}

      {/* Silver header */}
      <div className="border-b" style={{ background: "linear-gradient(135deg, hsl(0 0% 85%), hsl(0 0% 75%))" }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Welcome, {profile?.full_name || "Sir/Madam"}!
          </h1>
          <p className="text-gray-600 text-sm mt-1">Employee Dashboard — SharpZone</p>
        </div>
      </div>

      {/* Emergency notifications */}
      {notifications.filter((n: any) => !n.is_read && n.title.includes("EMERGENCY")).map((n: any) => (
        <div key={n.id} className="bg-red-500 text-white p-4 border-b border-red-600">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <p className="font-bold text-sm">{n.title}</p>
                <p className="text-xs">{n.message}</p>
              </div>
            </div>
            <button onClick={() => markNotifRead(n.id)} className="text-xs bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30">Dismiss</button>
          </div>
        </div>
      ))}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm text-center">
            <p className="text-2xl font-bold text-green-600">{completedCount}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm text-center">
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm text-center">
            <p className="text-2xl font-bold text-blue-600">{totalScore}</p>
            <p className="text-xs text-gray-500">Score</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-display text-lg font-bold text-gray-800 mb-3">📋 My Tasks</h2>
            {assignments.length === 0 && <p className="text-gray-400 text-center py-8">No tasks assigned yet.</p>}
            {assignments.map((a: any) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl p-4 border shadow-sm ${a.tasks?.is_emergency ? "border-red-300 bg-red-50" : "border-gray-200"}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {a.tasks?.is_emergency && <span className="text-red-500 text-xs font-bold">🚨 EMERGENCY</span>}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        a.tasks?.priority === "high" ? "bg-red-100 text-red-700" : a.tasks?.priority === "medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                      }`}>{a.tasks?.priority}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        a.status === "completed" ? "bg-green-100 text-green-700" : a.status === "in_progress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                      }`}>{a.status}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">{a.tasks?.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{a.tasks?.description}</p>
                    {a.tasks?.deadline && <p className="text-xs text-amber-700 mt-1">⏰ Deadline: {new Date(a.tasks.deadline).toLocaleString()}</p>}
                    {a.report_text && <p className="text-xs text-green-600 mt-2">📝 Report: {a.report_text}</p>}
                    {a.score > 0 && <p className="text-xs text-blue-600 mt-1">🏆 Score: {a.score} pts</p>}
                  </div>
                  <div className="flex flex-col gap-2 ml-3">
                    {a.status === "pending" && (
                      <button onClick={() => startTask(a.id)} className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600">
                        Start
                      </button>
                    )}
                    {(a.status === "pending" || a.status === "in_progress") && (
                      <>
                        <button onClick={() => completeTask(a.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600">
                          <CheckCircle className="w-3 h-3" /> Done
                        </button>
                        <button onClick={openWhatsApp} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">
                          <MessageCircle className="w-3 h-3" /> WhatsApp
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Notifications sidebar */}
          <div>
            <h2 className="font-display text-lg font-bold text-gray-800 mb-3">🔔 Notifications</h2>
            <div className="space-y-2">
              {notifications.map((n: any) => (
                <div key={n.id} className={`bg-white rounded-xl p-3 border shadow-sm ${n.is_read ? "border-gray-200 opacity-60" : "border-blue-200"}`}>
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-500">{n.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</span>
                    {!n.is_read && <button onClick={() => markNotifRead(n.id)} className="text-xs text-blue-500 hover:underline">Mark read</button>}
                  </div>
                </div>
              ))}
              {notifications.length === 0 && <p className="text-gray-400 text-center py-4 text-sm">No notifications.</p>}
            </div>

            {/* Upcoming Holidays */}
            {holidays.length > 0 && (
              <div className="mt-6">
                <h2 className="font-display text-lg font-bold text-gray-800 mb-3">📅 Upcoming Holidays</h2>
                <div className="space-y-2">
                  {holidays.map((h: any) => (
                    <div key={h.id} className="bg-white rounded-xl p-3 border border-green-200 shadow-sm">
                      <p className="text-sm font-medium text-gray-900">{h.title}</p>
                      <p className="text-xs text-green-600">{new Date(h.holiday_date).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DynamicIsland />
    </div>
  );
};

export default EmployeeDashboard;
