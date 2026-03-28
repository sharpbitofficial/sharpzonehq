import AnimatedSection from "./AnimatedSection";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TeamSection = () => {
  const { data: teamMembers = [] } = useQuery({
    queryKey: ["team-members-public"],
    queryFn: async () => {
      const { data } = await supabase
        .from("team_members")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      return data || [];
    },
  });

  if (teamMembers.length === 0) return null;

  return (
    <section id="team" className="py-24 px-4 bg-secondary/50">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <span className="text-primary font-semibold text-sm tracking-widest uppercase">Our People</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            Meet the Team
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            The talented individuals behind SharpZone who bring your projects to life.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <AnimatedSection key={member.id} delay={index * 120}>
              <div className="group text-center p-6 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all duration-500 hover:-translate-y-2 border border-border/50">
                <div className="w-24 h-24 mx-auto mb-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:animate-pulse-glow transition-all duration-300 overflow-hidden">
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-display font-bold text-primary-foreground">
                      {member.full_name.charAt(0)}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-lg font-semibold text-card-foreground mb-1">
                  {member.full_name}
                </h3>
                <p className="text-muted-foreground text-sm">{member.position}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
