"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Building2, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    client_name: "",
    industry: "",
    challenge: "",
    solution: "",
    testimonial: "",
    testimonial_author: "",
    project_duration: "",
    status: "published",
  });

  const fetchCaseStudies = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/case-studies", { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setCaseStudies(json.data.caseStudies || []);
      }
    } catch (err) {
      toast.error("Failed to fetch case studies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseStudies();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/case-studies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Case study created!");
        setOpen(false);
        fetchCaseStudies();
      } else {
        toast.error(json.error?.message || "Failed to create case study");
      }
    } catch (err) {
      toast.error("Error creating case study");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Case Studies</h1>
          <p className="text-muted-foreground text-sm">Manage client success stories and impact metrics</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Case Study
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Case Study</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-2">
              <div>
                <Label>Title *</Label>
                <Input
                  required
                  placeholder="e.g. Scaling Fintech Infrastructure by 300%"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client / Company Name</Label>
                  <Input
                    placeholder="Acme Corp"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Industry</Label>
                  <Input
                    placeholder="Fintech, SaaS, Healthcare"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Challenge</Label>
                <Textarea
                  rows={3}
                  placeholder="Describe the initial problem..."
                  value={formData.challenge}
                  onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                />
              </div>

              <div>
                <Label>Solution</Label>
                <Textarea
                  rows={3}
                  placeholder="Describe the solution provided..."
                  value={formData.solution}
                  onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Testimonial Quote</Label>
                  <Input
                    placeholder="NextVentures transformed our technology stack..."
                    value={formData.testimonial}
                    onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Testimonial Author</Label>
                  <Input
                    placeholder="John Doe, CTO"
                    value={formData.testimonial_author}
                    onChange={(e) => setFormData({ ...formData, testimonial_author: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit">Create Case Study</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Case Studies</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : caseStudies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No case studies found.</div>
          ) : (
            <div className="divide-y">
              {caseStudies.map((cs) => (
                <div key={cs.id} className="py-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base">{cs.title}</span>
                      <Badge variant="outline">{cs.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                      {cs.case_studies?.[0]?.client_name && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> Client: {cs.case_studies[0].client_name}
                        </span>
                      )}
                      {cs.case_studies?.[0]?.industry && (
                        <span>Industry: {cs.case_studies[0].industry}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
