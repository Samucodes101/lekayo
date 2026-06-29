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
    <div className="flex min-h-screen">
      <DevNav />
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  )
}