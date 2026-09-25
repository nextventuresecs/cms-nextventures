"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState("NextVentures CMS");
  const [contactEmail, setContactEmail] = useState("info@nextventures.in");
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved successfully!");
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground text-sm">System preferences and general configurations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Configuration</CardTitle>
          <CardDescription>Primary site identity and notifications email</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>Platform Name</Label>
              <Input
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
              />
            </div>

            <div>
              <Label>System Notification Email</Label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
