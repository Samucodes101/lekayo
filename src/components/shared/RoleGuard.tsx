"use client"

import { useSession } from "next-auth/react"
import { Role } from "@prisma/client"
import { ReactNode } from "react"
import { redirect } from "next/navigation"

interface RoleGuardProps {
  roles: Role[]
  children: ReactNode
  fallback?: ReactNode
}

export function RoleGuard({ roles, children, fallback }: RoleGuardProps) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    if (fallback) return fallback
    redirect("/login")
  }

  const userRole = session.user?.role as Role | undefined
  if (!userRole || !roles.includes(userRole)) {
    if (fallback) return fallback
    redirect("/")
  }

  return children
}