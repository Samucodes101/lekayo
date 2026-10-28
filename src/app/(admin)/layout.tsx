import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"
import AdminSidebar from "@/components/admin/AdminSidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  // Middleware limits MARKETING_MANAGER to /admin/marketing
  const allowed: string[] = [Role.SUPER_ADMIN, Role.ADMIN, Role.MARKETING_MANAGER]
  if (!session || !allowed.includes(session.user.role as string)) {
    redirect("/")
  }
  return (
    <div className="admin-shell flex min-h-screen flex-col md:flex-row">
      <AdminSidebar role={session.user.role as string} />
      <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
    </div>
  )
}