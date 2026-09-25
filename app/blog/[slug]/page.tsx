import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, User, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { FLAGSHIP_BLOGS } from "@/lib/flagship-data";

async function getBlogPost(slug: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      return FLAGSHIP_BLOGS.find(b => b.slug === slug) || null;
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/blog_posts?select=*,staff_users(name,avatar_url,bio)&slug=eq.${slug}&type=eq.blog&status=eq.published&deleted_at=is.null`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) return FLAGSHIP_BLOGS.find(b => b.slug === slug) || null;
    const data = await res.json();
    return data[0] || FLAGSHIP_BLOGS.find(b => b.slug === slug) || null;
  } catch (error) {
    return FLAGSHIP_BLOGS.find(b => b.slug === slug) || null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Article Not Found | NextVentures" };

  return {
    title: `${post.title} | NextVentures Blog`,
    description: post.seo_meta?.description || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover_image ? [post.cover_image] : [],
      type: "article",
      publishedTime: post.published_at,
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  // Schema.org BlogPosting structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image ? [post.cover_image] : [],
    datePublished: post.published_at,
    author: {
      "@type": "Person",
      name: post.staff_users?.name || "NextVentures Team",
    },
    publisher: {
      "@type": "Organization",
      name: "NextVentures",
      url: "https://nextventures.in",
    },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
        </Link>

        <article className="space-y-8">
          <header className="space-y-4">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b pb-6">
              {post.staff_users?.name && (
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <User className="w-4 h-4 text-primary" /> {post.staff_users.name}
                </span>
              )}
              {post.published_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> {new Date(post.published_at).toLocaleDateString()}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {post.reading_time || 5} min read
              </span>
            </div>
          </header>

          {post.cover_image && (
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted shadow-md">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="prose prose-lg dark:prose-invert max-w-none leading-relaxed whitespace-pre-line font-sans">
            {post.content}
          </div>

          {post.staff_users?.bio && (
            <div className="mt-12 p-6 rounded-xl bg-card border flex items-start gap-4">
              {post.staff_users.avatar_url && (
                <img
                  src={post.staff_users.avatar_url}
                  alt={post.staff_users.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <h3 className="font-semibold text-lg">{post.staff_users.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{post.staff_users.bio}</p>
              </div>
            </div>
          )}

          {/* Lead Capture CTA */}
          <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-ocean-dark via-primary to-ocean-medium text-white space-y-4 text-center">
            <h3 className="text-2xl font-bold">Accelerate Your Venture Growth</h3>
            <p className="text-primary-foreground/80 max-w-xl mx-auto text-sm">
              Schedule a 1-on-1 strategy consultancy session with NextVentures advisors.
            </p>
            <div className="pt-2">
              <Button size="lg" className="bg-accent hover:bg-accent-hover text-accent-foreground font-bold rounded-full px-8 shadow-gold" asChild>
                <a href="https://nextventures.in/#contact">Schedule Strategy Call <ArrowRight className="w-4 h-4 ml-2" /></a>
              </Button>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
