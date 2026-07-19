import { getServerSession } from "next-auth"
import { prisma } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import AddressList from "@/components/shared/AddressList"

export default async function AddressesPage() {
  const session = await getServerSession(authOptions)
  const addresses = await prisma.address.findMany({ where: { user: { email: session!.user.email! } } })

  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">My Addresses</h1>
      <AddressList addresses={addresses} />
    </div>
  )
}