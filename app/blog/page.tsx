import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, User } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog & Insights | NextVentures",
  description: "Explore the latest insights, strategies, and industry news from NextVentures.",
};

async function getBlogs(tag?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  const res = await fetch(`${supabaseUrl}/rest/v1/blog_posts?select=id,title,slug,excerpt,cover_image,published_at,reading_time,staff_users(name)&type=eq.blog&status=eq.published&deleted_at=is.null&order=published_at.desc`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) return [];
  return res.json();
}

export default async function BlogListingPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const blogs = await getBlogs(tag);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Our Blog & Insights</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Practical advice, tech trends, and venture insights to accelerate your business.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No articles found. Check back soon!
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog: any) => (
              <Card key={blog.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                {blog.cover_image && (
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={blog.cover_image}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  </div>
                )}
                <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {blog.reading_time || 5} min read
                      </span>
                      {blog.published_at && (
                        <span>• {new Date(blog.published_at).toLocaleDateString()}</span>
                      )}
                    </div>
                    <Link href={`/blog/${blog.slug}`}>
                      <h2 className="text-xl font-bold hover:text-primary transition-colors line-clamp-2">
                        {blog.title}
                      </h2>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                      {blog.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                    {blog.staff_users?.name && (
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <User className="w-3.5 h-3.5" /> {blog.staff_users.name}
                      </span>
                    )}
                    <Link href={`/blog/${blog.slug}`} className="text-primary font-semibold hover:underline">
                      Read Article →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
