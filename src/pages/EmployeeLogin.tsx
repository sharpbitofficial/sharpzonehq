import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.jpeg";

const EmployeeLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // Check if user has staff or higher role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);

    const userRoles = roles?.map((r) => r.role) || [];
    const isEmployee = userRoles.some((r) => ["staff", "admin", "ceo"].includes(r));

    if (!isEmployee) {
      // Check if they have a pending application
      await supabase.auth.signOut();
      toast.error("Your application is still under review. Please wait for CEO approval.", { duration: 5000 });
      setLoading(false);
      return;
    }

    setLoading(false);
    
    if (userRoles.includes("ceo")) {
      toast.success("You Are Welcome Honourable CEO Mahdin Hossain Mahin Sir!", { duration: 5000 });
      navigate("/admin");
    } else {
      toast.success("Welcome Sir/Madam! You are logged in as Employee.", { duration: 4000 });
      navigate("/employee-dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <img src={logo} alt="SharpZone" className="w-16 h-16 mx-auto rounded-2xl shadow-card mb-4" />
          </Link>
          <h1 className="font-display text-2xl font-bold text-foreground">Employee Login</h1>
          <p className="text-muted-foreground mt-1">Sign in with your approved employee credentials</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-2xl p-6 shadow-elevated border border-border space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              placeholder="your.email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Employee Sign In"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Want to join the team?{" "}
            <Link to="/employee-signup" className="text-primary font-medium hover:underline">Apply Now</Link>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Not an employee?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Normal Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default EmployeeLogin;
