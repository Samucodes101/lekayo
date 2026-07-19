"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { sendVerificationEmail } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

export default function VerifyEmailButton() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)

  const handleSendVerification = async () => {
    if (!session?.user?.email) return

    setLoading(true)
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/account/profile`,
        handleCodeInApp: true,
      }
      await sendVerificationEmail(session.user.email, actionCodeSettings)
      toast({
        title: "Verification email sent",
        description: "Check your inbox and click the link.",
      })
    } catch (error) {
      toast({
        title: "Failed to send",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleSendVerification} disabled={loading}>
      {loading ? "Sending..." : "Verify Email"}
    </Button>
  )
}