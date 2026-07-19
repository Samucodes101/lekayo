import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import ProfileForm from "@/components/forms/ProfileForm"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return null // redirect happens in layout
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  })

  if (!user) return null

  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">My Profile</h1>
      <ProfileForm user={user} />
    </div>
  )
}