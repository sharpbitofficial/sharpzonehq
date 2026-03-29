import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";
import { Search } from "lucide-react";

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: posts = [] } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      return data || [];
    },
  });

  const categories = Array.from(new Set(posts.map((p: any) => p.category)));

  const filteredPosts = posts.filter((p: any) => {
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-foreground mb-4">Blog & Articles</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Latest insights, tips, and stories from the SharpZone team.
          </p>
        </AnimatedSection>

        {/* Search and Filter */}
        <div className="space-y-6 mb-12">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition"
            />
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedCategory === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:opacity-80"
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground hover:opacity-80"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post: any, index) => (
              <AnimatedSection key={post.id} delay={index * 100}>
                <Link to={`/blog/${post.slug}`}>
                  <div className="h-full bg-card rounded-2xl border border-border overflow-hidden shadow-card hover:shadow-elevated transition-all duration-500 hover:-translate-y-2 cursor-pointer group">
                    {post.thumbnail_url && (
                      <div className="w-full h-40 overflow-hidden bg-secondary">
                        <img
                          src={post.thumbnail_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                          {post.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.published_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-foreground mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {post.tags?.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="text-xs bg-secondary text-foreground px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No articles found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
