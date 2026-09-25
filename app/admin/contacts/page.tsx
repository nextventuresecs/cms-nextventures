"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Phone, Building } from "lucide-react";
import { toast } from "sonner";

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/contacts", { credentials: "include" });
      const json = await res.json();
      if (json.success) {
        setContacts(json.data.contacts || []);
      }
    } catch (err) {
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Status updated");
        fetchContacts();
      } else {
        toast.error(json.error?.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contacts & Inquiries</h1>
        <p className="text-muted-foreground text-sm">Lead form submissions from website visitors</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Inquiries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No inquiries received yet.</div>
          ) : (
            <div className="divide-y">
              {contacts.map((contact) => (
                <div key={contact.id} className="py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-base">{contact.name}</span>
                      <span className="text-xs text-muted-foreground ml-3">
                        {new Date(contact.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="w-36">
                      <Select
                        value={contact.status}
                        onValueChange={(val) => handleStatusChange(contact.id, val)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground flex flex-wrap gap-4">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {contact.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {contact.phone}</span>
                    {contact.organization && (
                      <span className="flex items-center gap-1"><Building className="w-3 h-3" /> {contact.organization}</span>
                    )}
                    <Badge variant="outline">{contact.service_interest}</Badge>
                  </div>

                  {contact.message && (
                    <p className="text-sm bg-muted/40 p-3 rounded-md text-foreground">
                      "{contact.message}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
