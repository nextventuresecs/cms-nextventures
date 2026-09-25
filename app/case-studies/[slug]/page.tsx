import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, ArrowLeft, CheckCircle2, Quote } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

async function getCaseStudy(slug: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  const res = await fetch(
    `${supabaseUrl}/rest/v1/blog_posts?select=*,case_studies(*)&slug=eq.${slug}&type=eq.case_study&status=eq.published&deleted_at=is.null`,
    {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data[0] || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cs = await getCaseStudy(slug);
  if (!cs) return { title: "Case Study Not Found | NextVentures" };

  return {
    title: `${cs.title} | Case Study`,
    description: cs.excerpt,
    openGraph: {
      title: cs.title,
      description: cs.excerpt,
      images: cs.cover_image ? [cs.cover_image] : [],
      type: "article",
    },
  };
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cs = await getCaseStudy(slug);

  if (!cs) {
    notFound();
  }

  const details = cs.case_studies?.[0] || {};

  // Schema.org Article / Case Study JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: cs.title,
    description: cs.excerpt,
    image: cs.cover_image ? [cs.cover_image] : [],
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
        <Link href="/case-studies" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Case Studies
        </Link>

        <article className="space-y-10">
          <header className="space-y-4">
            <div className="flex items-center gap-3">
              {details.industry && <Badge>{details.industry}</Badge>}
              {details.client_name && (
                <span className="text-sm font-semibold flex items-center gap-1.5 text-muted-foreground">
                  <Building2 className="w-4 h-4" /> {details.client_name}
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              {cs.title}
            </h1>
            <p className="text-xl text-muted-foreground">{cs.excerpt}</p>
          </header>

          {cs.cover_image && (
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted shadow-md">
              <img src={cs.cover_image} alt={cs.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Key Metrics / Highlights Grid */}
          {details.results && Object.keys(details.results).length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-8">
              {Object.entries(details.results).map(([metric, val]: [string, any]) => (
                <Card key={metric} className="bg-primary/5 border-primary/20 text-center p-4">
                  <div className="text-3xl font-extrabold text-primary">{String(val)}</div>
                  <div className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">{metric}</div>
                </Card>
              ))}
            </div>
          )}

          {/* Challenge & Solution Sections */}
          <div className="grid gap-8 sm:grid-cols-2 my-8">
            {details.challenge && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-destructive">
                  The Challenge
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{details.challenge}</p>
              </Card>
            )}

            {details.solution && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" /> The Solution
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">{details.solution}</p>
              </Card>
            )}
          </div>

          {/* Testimonial Quote */}
          {details.testimonial && (
            <div className="p-8 rounded-2xl bg-ocean-dark/5 dark:bg-ocean-light/10 border-l-4 border-primary space-y-4 my-8">
              <Quote className="w-8 h-8 text-primary/40" />
              <p className="text-lg italic font-medium">"{details.testimonial}"</p>
              {details.testimonial_author && (
                <p className="text-sm font-semibold text-primary">— {details.testimonial_author}</p>
              )}
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
