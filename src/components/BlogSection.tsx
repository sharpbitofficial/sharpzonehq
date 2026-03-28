import { ArrowRight, Calendar } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const posts = [
  {
    title: "The Power of Minimalist Logo Design",
    excerpt: "Why less is more when it comes to creating memorable brand identities that stand the test of time.",
    date: "Mar 25, 2026",
    category: "Design Tips",
  },
  {
    title: "Color Psychology in Branding",
    excerpt: "How the right color palette can influence customer perception and drive brand loyalty.",
    date: "Mar 20, 2026",
    category: "Branding",
  },
  {
    title: "SharpZone's Journey: From Idea to Impact",
    excerpt: "A behind-the-scenes look at how we built SharpZone and our vision for the future.",
    date: "Mar 15, 2026",
    category: "Company",
  },
];

const BlogSection = () => {
  return (
    <section id="blog" className="py-24 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <span className="text-primary font-semibold text-sm tracking-widest uppercase">
            Blog
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            Latest News & Insights
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stay updated with design trends, tips, and SharpZone stories.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <AnimatedSection key={post.title} delay={i * 100}>
              <div className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-500 hover:-translate-y-1 border border-border group cursor-pointer">
                <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read More <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
