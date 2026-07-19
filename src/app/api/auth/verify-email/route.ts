import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminAuth } from "@/lib/firebase-admin"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { idToken } = await req.json()
  if (!idToken) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 })
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken)
    if (decoded.email !== session.user.email) {
      return NextResponse.json({ error: "Token email mismatch" }, { status: 403 })
    }

    // Update user's emailVerified
    await prisma.user.update({
      where: { email: session.user.email },
      data: { emailVerified: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Invalid token" }, { status: 400 })
  }
}