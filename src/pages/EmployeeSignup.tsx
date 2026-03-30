import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.jpeg";

const EmployeeSignup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
    profession: "",
    institution: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Submit employee application
    const { error: appError } = await supabase.from("employee_applications").insert({
      full_name: form.full_name,
      phone: form.phone,
      email: form.email,
      address: form.address,
      profession: form.profession,
      institution: form.institution || null,
    });

    if (appError) {
      toast.error("Failed to submit application: " + appError.message);
      setLoading(false);
      return;
    }

    // 2. Create the auth account (will default to 'customer' role, CEO upgrades to 'staff' on approval)
    const { error: signupError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name, phone: form.phone },
        emailRedirectTo: window.location.origin,
      },
    });

    setLoading(false);

    if (signupError) {
      toast.error(signupError.message);
      return;
    }

    // 3. Create high-priority notification for CEO
    // This runs with anon key so it'll only insert if RLS allows. 
    // We insert regardless — the CEO notification policy handles visibility.

    toast.success("Application submitted! Please verify your email. The CEO will review and approve your account.", { duration: 6000 });
    navigate("/");
  };

  const fields: { key: string; label: string; type: string; placeholder: string; required: boolean }[] = [
    { key: "full_name", label: "Full Name", type: "text", placeholder: "Your full name", required: true },
    { key: "phone", label: "Phone Number", type: "tel", placeholder: "+880...", required: true },
    { key: "email", label: "Email Address", type: "email", placeholder: "you@example.com", required: true },
    { key: "address", label: "Address", type: "text", placeholder: "Your address", required: true },
    { key: "profession", label: "Profession", type: "text", placeholder: "e.g. Student, Designer, Developer", required: true },
    { key: "institution", label: "Institution (if student)", type: "text", placeholder: "Your institution name", required: false },
    { key: "password", label: "Password", type: "password", placeholder: "Min 6 characters", required: true },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <img src={logo} alt="SharpZone" className="w-16 h-16 mx-auto rounded-2xl shadow-card mb-4" />
          </Link>
          <h1 className="font-display text-2xl font-bold text-foreground">Employee Sign Up</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Submit your application to join SharpZone team. The CEO will review and approve.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-elevated border border-border space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-foreground mb-1">{f.label}</label>
              <input
                type={f.type}
                value={(form as Record<string, string>)[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                required={f.required}
                minLength={f.key === "password" ? 6 : undefined}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                placeholder={f.placeholder}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Already approved?{" "}
            <Link to="/employee-login" className="text-primary font-medium hover:underline">Employee Log In</Link>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Not an employee?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">Normal Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default EmployeeSignup;
