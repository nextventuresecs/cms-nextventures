"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/subscribers", { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setSubscribers(json.data.subscribers || []);
      }
    } catch (err) {
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscribers</h1>
        <p className="text-muted-foreground text-sm">Newsletter audience and email marketing subscribers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscriber List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No subscribers yet.</div>
          ) : (
            <div className="divide-y">
              {subscribers.map((sub) => (
                <div key={sub.id} className="py-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{sub.email}</span>
                      {sub.name && <span className="text-xs text-muted-foreground">({sub.name})</span>}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Subscribed on {new Date(sub.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <Badge variant={sub.subscribed ? "default" : "secondary"}>
                    {sub.subscribed ? "Subscribed" : "Unsubscribed"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
