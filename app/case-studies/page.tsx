import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, ArrowRight, CheckCircle2, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import { Metadata } from "next";
import { FLAGSHIP_CASE_STUDIES } from "@/lib/flagship-data";

export const metadata: Metadata = {
  title: "Client Case Studies & Stories | NextVentures",
  description: "Discover how NextVentures helps startups and enterprises build, scale, and transform.",
};

async function getCaseStudies() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      return FLAGSHIP_CASE_STUDIES;
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/blog_posts?select=id,title,slug,excerpt,cover_image,case_studies(client_name,industry,results)&type=eq.case_study&status=eq.published&deleted_at=is.null&order=published_at.desc`,
      {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) return FLAGSHIP_CASE_STUDIES;
    const data = await res.json();
    return data && data.length > 0 ? data : FLAGSHIP_CASE_STUDIES;
  } catch (error) {
    return FLAGSHIP_CASE_STUDIES;
  }
}

export default async function CaseStudiesListingPage() {
  const caseStudies = await getCaseStudies();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Client Case Studies</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Real impact, measurable growth, and transformative technology solutions.
          </p>
        </div>

        {caseStudies.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No case studies found. Check back soon!
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2">
            {caseStudies.map((cs: any) => {
              const details = cs.case_studies?.[0] || {};
              return (
                <Card key={cs.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-all border-ocean-light/20">
                  {cs.cover_image && (
                    <div className="aspect-video w-full overflow-hidden bg-muted">
                      <img
                        src={cs.cover_image}
                        alt={cs.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                      />
                    </div>
                  )}
                  <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        {details.industry && (
                          <Badge variant="secondary" className="text-xs">
                            {details.industry}
                          </Badge>
                        )}
                        {details.client_name && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                            <Building2 className="w-3.5 h-3.5" /> {details.client_name}
                          </span>
                        )}
                      </div>

                      <Link href={`/case-studies/${cs.slug}`}>
                        <h2 className="text-2xl font-bold hover:text-primary transition-colors">
                          {cs.title}
                        </h2>
                      </Link>

                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {cs.excerpt}
                      </p>

                      {details.results && (
                        <div className="p-3 rounded-lg bg-ocean-pale/30 border border-ocean-lightest/40 flex items-center gap-2 text-xs font-semibold text-ocean-dark">
                          <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                          <span>{details.results}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t flex items-center justify-between text-sm">
                      <Link href={`/case-studies/${cs.slug}`} className="text-primary font-semibold flex items-center gap-1.5 hover:underline">
                        Read Case Study <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Lead Capture Consultancy CTA */}
        <div className="mt-16 p-8 md:p-12 rounded-3xl bg-gradient-to-r from-ocean-dark via-primary to-ocean-medium text-white shadow-xl text-center space-y-6">
          <Badge className="bg-accent text-accent-foreground px-4 py-1 text-sm font-bold uppercase tracking-wider">
            Proven Execution Velocity
          </Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Ready to Build Your Next Success Story?
          </h2>
          <p className="max-w-2xl mx-auto text-primary-foreground/80 text-base md:text-lg">
            Partner with NextVentures for comprehensive business consultancy, cloud architecture, HR, and digital scale.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button size="lg" className="bg-accent hover:bg-accent-hover text-accent-foreground font-bold rounded-full px-8 shadow-gold" asChild>
              <a href="https://nextventures.in/#contact">Schedule Strategy Call <ArrowRight className="w-4 h-4 ml-2" /></a>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
