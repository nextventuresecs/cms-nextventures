"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Plus, MailCheck } from "lucide-react";
import { toast } from "sonner";

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const [formData, setFormData] = useState({
    subject: "",
    content: "",
    type: "newsletter",
  });

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/campaigns", { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setCampaigns(json.data || []);
      }
    } catch (err) {
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateAndSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSending(true);
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Campaign sent to ${json.data.recipients_count} subscribers!`);
        setOpen(false);
        setFormData({ subject: "", content: "", type: "newsletter" });
        fetchCampaigns();
      } else {
        toast.error(json.error?.message || "Failed to send campaign");
      }
    } catch (err) {
      toast.error("Error sending campaign");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Campaigns</h1>
          <p className="text-muted-foreground text-sm">Send newsletter broadcasts to subscribers</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Broadcast Email Campaign</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAndSend} className="space-y-4 py-2">
              <div>
                <Label>Subject Line *</Label>
                <Input
                  required
                  placeholder="e.g. NextVentures Monthly Tech Round-up"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div>
                <Label>Email Content (HTML / Plain Text) *</Label>
                <Textarea
                  required
                  rows={8}
                  placeholder="<p>Dear subscriber...</p>"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={sending}>
                  <Send className="w-4 h-4 mr-2" />
                  {sending ? "Broadcasting..." : "Send Campaign"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Past Broadcasts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No email campaigns sent yet.</div>
          ) : (
            <div className="divide-y">
              {campaigns.map((camp) => (
                <div key={camp.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-base flex items-center gap-2">
                      {camp.subject}
                      <Badge variant="outline">{camp.type}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Sent on {new Date(camp.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full font-medium">
                    <MailCheck className="w-3.5 h-3.5 text-emerald-600" /> {camp.sent_to_count || 0} Sent
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
