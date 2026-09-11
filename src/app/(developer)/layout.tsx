import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Role } from "@prisma/client"
import DevNav from "@/components/dev/DevNav"

export default async function DeveloperLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== Role.DEVELOPER && session.user.role !== Role.SUPER_ADMIN)) {
    redirect("/")
  }
  return (
    <div className="dev-shell flex min-h-screen flex-col md:flex-row">
      <DevNav />
      <main className="min-w-0 flex-1 bg-gray-50 p-4 md:p-6">{children}</main>
    </div>
  )
}