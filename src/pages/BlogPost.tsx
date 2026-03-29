import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AnimatedSection from "@/components/AnimatedSection";
import { Calendar, User, Tag } from "lucide-react";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      return data;
    },
  });

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!post) {
    return <Navigate to="/blog" />;
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <article className="max-w-4xl mx-auto">
        <AnimatedSection className="mb-12">
          {post.thumbnail_url && (
            <img
              src={post.thumbnail_url}
              alt={post.title}
              className="w-full h-96 object-cover rounded-2xl mb-8"
            />
          )}

          <div className="mb-6">
            <span className="text-sm font-semibold text-primary bg-primary/10 px-4 py-2 rounded-full">
              {post.category}
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pb-6 border-b border-border">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(post.published_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            {post.author_id && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                SharpZone Team
              </div>
            )}
            {post.tags?.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                {post.tags.length} tags
              </div>
            )}
          </div>
        </AnimatedSection>

        <AnimatedSection className="prose prose-invert max-w-none mb-12">
          <div
            className="text-foreground text-lg leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: post.content.replace(/\n/g, "<br />"),
            }}
          />
        </AnimatedSection>

        {post.tags && post.tags.length > 0 && (
          <AnimatedSection className="pt-8 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-secondary text-foreground rounded-full text-sm font-medium hover:bg-primary hover:text-primary-foreground transition"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </AnimatedSection>
        )}
      </article>
    </div>
  );
};

export default BlogPost;
