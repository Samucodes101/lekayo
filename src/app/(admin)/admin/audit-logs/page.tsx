import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchableAuditLogs } from "@/components/admin/SearchableAdminTables"

export default async function AuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif">Audit Logs</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <SearchableAuditLogs logs={logs.map((log) => ({ ...log, createdAt: log.createdAt.toISOString(), user: log.user ? { email: log.user.email } : null }))} />
        </CardContent>
      </Card>
    </div>
  )
}