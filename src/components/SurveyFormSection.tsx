import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

interface FormField {
  id: string;
  type: "text" | "textarea" | "multiple_choice" | "checkbox" | "dropdown";
  question: string;
  options?: string[];
  required: boolean;
  display_order: number;
}

const SurveyFormSection = () => {
  const { data: formFields = [] } = useQuery({
    queryKey: ["survey-form-fields"],
    queryFn: async () => {
      const { data } = await supabase
        .from("form_fields")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      return data || [];
    },
  });

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("form_responses").insert({
      responses: formData,
      submitted_at: new Date(),
    });

    setLoading(false);

    if (error) {
      toast.error("Failed to submit form. Please try again.");
      return;
    }

    toast.success("Thank you! Your response has been submitted.");
    setFormData({});
    queryClient.invalidateQueries({ queryKey: ["survey-form-fields"] });
  };

  if (formFields.length === 0) return null;

  return (
    <section className="py-12 px-4 bg-secondary/30">
      <div className="max-w-2xl mx-auto">
        <AnimatedSection>
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border shadow-card p-8 space-y-6">
            <div className="space-y-2 pb-6 border-b border-border">
              <h2 className="font-display text-2xl font-bold text-foreground">Quick Survey</h2>
              <p className="text-sm text-muted-foreground">
                Help us improve by answering a few quick questions.
              </p>
            </div>

            {formFields.map((field: FormField) => (
              <div key={field.id} className="space-y-2 animate-fade-in">
                <label className="text-sm font-medium text-foreground">
                  {field.question}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </label>

                {field.type === "text" && (
                  <input
                    type="text"
                    value={formData[field.id] || ""}
                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                    required={field.required}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                    placeholder="Your answer"
                  />
                )}

                {field.type === "textarea" && (
                  <textarea
                    value={formData[field.id] || ""}
                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                    required={field.required}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
                    placeholder="Your answer"
                  />
                )}

                {field.type === "multiple_choice" && field.options && (
                  <div className="space-y-2">
                    {field.options.map((option) => (
                      <label key={option} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition">
                        <input
                          type="radio"
                          name={field.id}
                          value={option}
                          checked={formData[field.id] === option}
                          onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                          required={field.required}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-foreground">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === "checkbox" && field.options && (
                  <div className="space-y-2">
                    {field.options.map((option) => (
                      <label key={option} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={(formData[field.id] || []).includes(option)}
                          onChange={(e) => {
                            const current = formData[field.id] || [];
                            setFormData({
                              ...formData,
                              [field.id]: e.target.checked
                                ? [...current, option]
                                : current.filter((v: string) => v !== option),
                            });
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-foreground">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {field.type === "dropdown" && field.options && (
                  <select
                    value={formData[field.id] || ""}
                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                    required={field.required}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
                  >
                    <option value="">Select an option</option>
                    {field.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit"}
              <Send className="w-4 h-4" />
            </button>
          </form>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default SurveyFormSection;
