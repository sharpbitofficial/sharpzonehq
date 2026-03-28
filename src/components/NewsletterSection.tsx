import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Send } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("newsletter_subscriptions")
      .insert({ email });

    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        toast.error("You are already subscribed!");
      } else {
        toast.error("Subscription failed. Please try again.");
      }
      return;
    }

    toast.success("Successfully subscribed to our newsletter!");
    setEmail("");
  };

  return (
    <section className="py-24 px-4 bg-gradient-to-br from-primary to-accent">
      <div className="max-w-4xl mx-auto">
        <AnimatedSection className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary-foreground/10 flex items-center justify-center backdrop-blur-sm">
            <Mail className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
            Stay Updated
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and get the latest updates on design trends, exclusive offers, and SharpZone news.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-5 py-4 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/50 transition"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-primary-foreground text-primary font-semibold rounded-xl hover:scale-105 transition-transform duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Subscribing..." : "Subscribe"}
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-primary-foreground/60 text-xs mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default NewsletterSection;
