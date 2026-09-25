"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    status: "draft",
    tags: "",
    seo_description: "",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const data = new FormData();
      data.append("file", file);
      data.append("bucket", "blog-images");

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: data,
        credentials: "include",
      });
      const json = await res.json();
      if (json.success && json.data?.url) {
        setFormData((prev) => ({ ...prev, cover_image: json.data.url }));
        toast.success("Cover image uploaded!");
      } else {
        toast.error(json.error?.message || "Image upload failed");
      }
    } catch (err) {
      toast.error("Upload error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        title: formData.title,
        slug: formData.slug || undefined,
        excerpt: formData.excerpt,
        content: formData.content,
        cover_image: formData.cover_image,
        status: formData.status,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
        seo_meta: {
          description: formData.seo_description || formData.excerpt,
        },
      };

      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Blog post created!");
        router.push("/admin/blogs");
      } else {
        toast.error(json.error?.message || "Failed to create blog post");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin/blogs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Blog Post</h1>
          <p className="text-muted-foreground text-sm">Create and draft a new article for your platform</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Article Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                required
                placeholder="Enter post title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="slug">Custom Slug (Optional)</Label>
              <Input
                id="slug"
                placeholder="my-custom-post-slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                rows={2}
                placeholder="Short summary for previews and social cards"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="content">Content (MDX / Markdown) *</Label>
              <Textarea
                id="content"
                required
                rows={12}
                className="font-mono text-sm"
                placeholder="Write your article content here in Markdown or MDX..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Media & Taxonomy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Cover Image URL</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="https://..."
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                />
                <label className="cursor-pointer">
                  <Button type="button" variant="outline" disabled={uploading} asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? "Uploading..." : "Upload"}
                    </span>
                  </Button>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="tags">Tags (Comma-separated)</Label>
              <Input
                id="tags"
                placeholder="business, technology, news"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="status">Publishing Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/admin/blogs">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Post"}
          </Button>
        </div>
      </form>
    </div>
  );
}
