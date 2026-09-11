import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"
import CSNav from "./cs/CSNav"

export default async function CustomerServiceLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.CUSTOMER_SERVICE && session.user.role !== Role.ADMIN && session.user.role !== Role.SUPER_ADMIN)) {
    redirect("/")
  }
  return (
    <div className="cs-shell flex min-h-screen flex-col md:flex-row">
      <CSNav />
      <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
    </div>
  )
}