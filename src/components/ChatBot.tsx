import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatBot = () => {
  const { user, isCeo, isAdmin, roles, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isStaff = roles.some(r => ["staff", "admin", "ceo"].includes(r));

  const { data: stats } = useQuery({
    queryKey: ["chatbot-stats"],
    enabled: (isCeo || isAdmin) && isOpen,
    queryFn: async () => {
      const [orders, customers, events, tasks, apps] = await Promise.all([
        supabase.from("orders").select("id, final_price, status", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("events").select("id", { count: "exact" }),
        supabase.from("tasks").select("id, status", { count: "exact" }),
        supabase.from("employee_applications").select("id", { count: "exact" }).eq("status", "pending"),
      ]);
      const allOrders = orders.data || [];
      return {
        totalOrders: orders.count || 0,
        totalRevenue: allOrders.filter(o => o.status === "completed").reduce((sum: number, o: any) => sum + (o.final_price || 0), 0),
        pendingOrders: allOrders.filter(o => o.status === "pending").length,
        totalCustomers: customers.count || 0,
        totalEvents: events.count || 0,
        totalTasks: tasks.count || 0,
        pendingApps: apps.count || 0,
      };
    },
  });

  const { data: myTasks } = useQuery({
    queryKey: ["chatbot-my-tasks", user?.id],
    enabled: isStaff && isOpen && !!user,
    queryFn: async () => {
      const { data } = await supabase.from("task_assignments").select("*, tasks(title, priority)").eq("assigned_to", user!.id);
      return data || [];
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getGreeting = () => {
    if (isCeo) return "Honourable Sir, what would you like to know?";
    if (isStaff) return "Welcome Sir/Madam, how may I assist you today?";
    return "Welcome Sir/Madam, how may I assist you?";
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: "assistant", content: getGreeting() }]);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulate brief thinking
    await new Promise(r => setTimeout(r, 500));
    const response = generateResponse(input.toLowerCase());
    setLoading(false);
    setMessages(prev => [...prev, { role: "assistant", content: response }]);
  };

  const generateResponse = (query: string): string => {
    const prefix = isCeo ? "Honourable Sir" : "Sir/Madam";

    if (isCeo || isAdmin) {
      if (query.includes("order") || query.includes("revenue") || query.includes("sales")) {
        return `${prefix}, here's your business summary:\n\n📦 Total Orders: ${stats?.totalOrders || 0}\n⏳ Pending Orders: ${stats?.pendingOrders || 0}\n💰 Total Revenue: ৳${stats?.totalRevenue || 0}\n\nWould you like more details?`;
      }
      if (query.includes("customer") || query.includes("user")) {
        return `${prefix}, you have ${stats?.totalCustomers || 0} registered customers. You can view detailed profiles in the Customers tab.`;
      }
      if (query.includes("event") || query.includes("service")) {
        return `${prefix}, you have ${stats?.totalEvents || 0} active events/services. Manage them from the Events tab.`;
      }
      if (query.includes("task") || query.includes("roster")) {
        return `${prefix}, there are ${stats?.totalTasks || 0} tasks in the system. Use the Task Roster tab to create and assign tasks.`;
      }
      if (query.includes("application") || query.includes("employee") || query.includes("staff")) {
        return `${prefix}, there are ${stats?.pendingApps || 0} pending employee applications. Review them in the Applications tab.`;
      }
      if (query.includes("team")) {
        return `${prefix}, you can manage team members from the Team tab. Add, edit, or remove members as needed.`;
      }
      if (query.includes("report") || query.includes("export") || query.includes("analytics")) {
        return `${prefix}, you can export survey responses as CSV from the Responses tab. Order and revenue analytics are on the Dashboard.`;
      }
      if (query.includes("blog") || query.includes("post") || query.includes("article")) {
        return `${prefix}, manage blog posts from the Blog Posts tab. Create, edit, publish or unpublish articles.`;
      }
      if (query.includes("holiday")) {
        return `${prefix}, manage company holidays from the Holidays tab. Employees will see holiday banners on their dashboard.`;
      }
      if (query.includes("help") || query.includes("what can you")) {
        return `${prefix}, I can help you with:\n\n📦 Order & revenue statistics\n👥 Customer information\n🎪 Event management\n📋 Task roster overview\n👷 Employee applications\n📊 Reports & analytics\n📝 Blog management\n📅 Holiday scheduling\n\nJust ask!`;
      }
    }

    if (isStaff) {
      if (query.includes("task") || query.includes("work") || query.includes("assignment")) {
        const pending = myTasks?.filter((t: any) => t.status === "pending").length || 0;
        const inProgress = myTasks?.filter((t: any) => t.status === "in_progress").length || 0;
        const completed = myTasks?.filter((t: any) => t.status === "completed").length || 0;
        return `${prefix}, here's your task summary:\n\n⏳ Pending: ${pending}\n🔄 In Progress: ${inProgress}\n✅ Completed: ${completed}\n\nView details on your dashboard.`;
      }
      if (query.includes("help") || query.includes("what can you")) {
        return `${prefix}, I can help you with:\n\n📋 Task status & summary\n📞 Contact CEO via WhatsApp\n🔔 Notification overview\n📅 Upcoming holidays\n\nJust ask!`;
      }
      if (query.includes("contact") || query.includes("whatsapp") || query.includes("ceo")) {
        return `${prefix}, you can contact the Honourable CEO via WhatsApp: +880-194-2485183. The button is available on each task card.`;
      }
    }

    // General user queries
    if (query.includes("order") || query.includes("status")) {
      return `${prefix}, you can view your order status in your Profile section under "My Orders".`;
    }
    if (query.includes("service") || query.includes("event")) {
      return `${prefix}, browse our Services section on the homepage to see available events and place orders.`;
    }
    if (query.includes("contact")) {
      return `${prefix}, reach us at:\n📧 sharpzone.official@gmail.com\n📱 WhatsApp: +880-194-2485183\n💬 Or use this chat!`;
    }
    if (query.includes("help") || query.includes("what can you")) {
      return `${prefix}, I can help with:\n📦 Order tracking\n🎪 Service information\n📞 Contact options\n👤 Account details\n\nWhat would you like to know?`;
    }

    return `${prefix}, I'm not sure about that. Try asking about ${isCeo ? "orders, revenue, customers, tasks, applications, holidays, or reports" : isStaff ? "your tasks, notifications, or contacting the CEO" : "orders, services, or contact information"}.`;
  };

  if (!user) return null;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform duration-300 flex items-center justify-center z-40"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-24 right-4 w-96 max-w-[calc(100vw-32px)] h-[28rem] bg-card border border-border rounded-2xl shadow-elevated flex flex-col z-40 animate-fade-in">
          <div className="flex items-center justify-between p-4 border-b border-border" style={isCeo ? { background: "linear-gradient(135deg, hsl(25 40% 20%), hsl(30 35% 30%))", borderRadius: "1rem 1rem 0 0" } : {}}>
            <div>
              <h3 className={`font-display text-sm font-bold ${isCeo ? "text-white" : "text-foreground"}`}>SharpZone Assistant</h3>
              <p className={`text-xs ${isCeo ? "text-white/70" : "text-muted-foreground"}`}>
                {isCeo ? "CEO Mode — Full Access" : isStaff ? "Employee Mode" : "Always here to help"}
              </p>
            </div>
            <button onClick={() => setIsOpen(false)} className={`p-1 rounded-lg transition ${isCeo ? "hover:bg-white/10 text-white" : "hover:bg-secondary text-foreground"}`}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs px-4 py-2 rounded-lg text-sm whitespace-pre-line ${
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-secondary text-foreground px-4 py-2 rounded-lg text-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <div className="w-2 h-2 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
