import { prisma } from "@/lib/db"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"

export default async function ActivityCenterPage() {
  const activities = await prisma.activityLog.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Activity Center</h1>
      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")}</TableCell>
                  <TableCell>{log.user?.email || "System"}</TableCell>
                  <TableCell>{log.userRole || "-"}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell className="text-sm text-gray-500">{log.ipAddress || "-"}</TableCell>
                </TableRow>
              ))}
              {activities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No activity recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}