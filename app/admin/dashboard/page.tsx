"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users,
  Mail,
  FileText,
  TrendingUp,
} from "lucide-react"

type DashboardData = {
  stats: {
    contacts: number
    subscribers: number
    blogViews: number
    conversionRate: number
  }
  recentContacts: {
    id: string
    name: string
    email: string
    service_interest: string
    status: string
    created_at: string
  }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/admin/dashboard/stats", {
          credentials: "include",
        })
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error("Failed to load dashboard", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your platform activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Contacts"
          value={data?.stats.contacts}
          icon={<Users />}
          loading={loading}
        />
        <StatCard
          title="Subscribers"
          value={data?.stats.subscribers}
          icon={<Mail />}
          loading={loading}
        />
        <StatCard
          title="Blog Views"
          value={data?.stats.blogViews}
          icon={<FileText />}
          loading={loading}
        />
        <StatCard
          title="Conversion Rate"
          value={`${data?.stats.conversionRate ?? 0}%`}
          icon={<TrendingUp />}
          loading={loading}
        />
      </div>

      {/* Recent Contacts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Contacts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}

          {!loading &&
            data?.recentContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {contact.email}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant(contact.status)}>
                    {contact.status}
                  </Badge>
                </div>
              </div>
            ))}

          {!loading && data?.recentContacts.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No recent contacts
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* -------------------- helpers -------------------- */

function StatCard({
  title,
  value,
  icon,
  loading,
}: {
  title: string
  value?: string | number
  icon: React.ReactNode
  loading: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  )
}

function statusVariant(status: string) {
  switch (status) {
    case "new":
      return "default"
    case "contacted":
      return "secondary"
    case "qualified":
      return "outline"
    case "lost":
      return "destructive"
    default:
      return "secondary"
  }
}
