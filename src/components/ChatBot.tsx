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
  const { user, isCeo, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: stats } = useQuery({
    queryKey: ["chatbot-stats"],
    enabled: isCeo && isOpen,
    queryFn: async () => {
      const [orders, customers, events] = await Promise.all([
        supabase.from("orders").select("id, final_price", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("events").select("id", { count: "exact" }),
      ]);
      return {
        totalOrders: orders.count || 0,
        totalRevenue: (orders.data || []).reduce((sum: number, o: any) => sum + (o.final_price || 0), 0),
        totalCustomers: customers.count || 0,
        totalEvents: events.count || 0,
      };
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const greeting = isCeo
    ? `Honourable Sir, what would you like to know?`
    : `Welcome Sir/Madam, how may I assist you?`;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: greeting,
        },
      ]);
    }
  }, [isOpen, greeting, messages.length]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const assistantResponse = generateResponse(input.toLowerCase());
    setLoading(false);

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: assistantResponse },
    ]);
  };

  const generateResponse = (query: string): string => {
    if (isCeo) {
      if (query.includes("order") || query.includes("revenue")) {
        return `Honourable Sir, here's your order summary:\n\nTotal Orders: ${stats?.totalOrders || 0}\nTotal Revenue: ৳${stats?.totalRevenue || 0}\n\nWould you like more details about specific orders?`;
      }
      if (query.includes("customer")) {
        return `Honourable Sir, you have ${stats?.totalCustomers || 0} total customers. Would you like to view detailed customer analytics?`;
      }
      if (query.includes("event")) {
        return `Honourable Sir, you have ${stats?.totalEvents || 0} active events. Would you like event performance metrics?`;
      }
      if (query.includes("team")) {
        return `Honourable Sir, you have full access to manage your team. You can add, edit, or remove team members from the Team Management section.`;
      }
      if (query.includes("help")) {
        return `Honourable Sir, I can help you with:\n• Order statistics and revenue\n• Customer information\n• Event management\n• Team administration\n• Form responses\n• Partner management\n\nWhat would you like to know?`;
      }
    } else {
      if (query.includes("order") || query.includes("status")) {
        return `Sir/Madam, you can view your order status in your profile section. Look for "My Orders" to see all your pending, processing, and completed orders.`;
      }
      if (query.includes("service") || query.includes("event")) {
        return `Sir/Madam, we offer various services. Please visit our Services section to see all available events and place an order.`;
      }
      if (query.includes("contact")) {
        return `Sir/Madam, you can reach us through:\n• Email: sharpzone.official@gmail.com\n• WhatsApp: +880-194-2485183\n• Facebook Messenger\n• Live Chat (available during business hours)`;
      }
      if (query.includes("help")) {
        return `Sir/Madam, I can help you with:\n• Order tracking\n• Service information\n• Contact options\n• Account details\n\nWhat would you like to know?`;
      }
    }

    return isCeo
      ? `Honourable Sir, I'm not sure about that. Please ask about orders, customers, events, team management, or other admin features.`
      : `Sir/Madam, I'm here to help with your orders, services, and account. Please ask about these topics.`;
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform duration-300 flex items-center justify-center z-40"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 w-96 max-w-[calc(100vw-32px)] h-96 bg-card border border-border rounded-2xl shadow-elevated flex flex-col z-40 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <h3 className="font-display text-sm font-bold text-foreground">SharpZone Assistant</h3>
              <p className="text-xs text-muted-foreground">Always here to help</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-secondary rounded-lg transition"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
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

          {/* Input */}
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
