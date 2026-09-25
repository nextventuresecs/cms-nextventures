"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Edit3, Trash2, Globe, Eye } from "lucide-react";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  views: number;
  published_at: string | null;
  created_at: string;
  staff_users?: { name: string; email: string };
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/blogs?search=${encodeURIComponent(search)}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setBlogs(json.data.blogs || []);
      }
    } catch (err) {
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [search]);

  const handlePublish = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/blogs/${id}/publish`, {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Blog post published!");
        fetchBlogs();
      } else {
        toast.error(json.error?.message || "Publish failed");
      }
    } catch (err) {
      toast.error("Error publishing blog post");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Blog post deleted");
        fetchBlogs();
      } else {
        toast.error(json.error?.message || "Delete failed");
      }
    } catch (err) {
      toast.error("Error deleting blog post");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground text-sm">Manage articles, news, and publishing workflows</p>
        </div>
        <Link href="/admin/blogs/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Blog Post
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-4">
            <CardTitle>All Posts</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No blog posts found.</div>
          ) : (
            <div className="divide-y">
              {blogs.map((blog) => (
                <div key={blog.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base">{blog.title}</span>
                      <Badge variant={blog.status === "published" ? "default" : "secondary"}>
                        {blog.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-4">
                      <span>Slug: /{blog.slug}</span>
                      {blog.staff_users?.name && <span>Author: {blog.staff_users.name}</span>}
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {blog.views || 0} views
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {blog.status === "draft" && (
                      <Button variant="outline" size="sm" onClick={() => handlePublish(blog.id)}>
                        <Globe className="w-3.5 h-3.5 mr-1" /> Publish
                      </Button>
                    )}
                    <Link href={`/admin/blogs/${blog.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(blog.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
