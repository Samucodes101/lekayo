import { prisma } from "@/lib/db"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Role } from "@prisma/client"

export default async function RolesPage() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
    orderBy: { role: "asc" },
  })

  const roleColors: Record<Role, string> = {
    SUPER_ADMIN: "text-red-600",
    ADMIN: "text-blue-600",
    CUSTOMER_SERVICE: "text-green-600",
    INVENTORY_MANAGER: "text-purple-600",
    MARKETING_MANAGER: "text-pink-600",
    CUSTOMER: "text-gray-600",
    DEVELOPER: "text-orange-600",
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-serif">Users & Roles</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name || "N/A"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className={`font-medium ${roleColors[user.role as Role] || ""}`}>
                    {user.role}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}