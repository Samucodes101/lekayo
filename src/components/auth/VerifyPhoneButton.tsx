"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { sendPhoneOTP, confirmPhoneOTP } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"

export default function VerifyPhoneButton() {
  const { data: session } = useSession()
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const recaptchaRef = useRef<HTMLDivElement>(null)
  const [confirmationResult, setConfirmationResult] = useState<any>(null)

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      toast({ title: "Invalid phone number", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const result = await sendPhoneOTP(phone, recaptchaRef.current!)
      setConfirmationResult(result)
      setStep("otp")
      toast({ title: "OTP sent", description: "Check your phone." })
    } catch (error) {
      toast({
        title: "Failed to send OTP",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      toast({ title: "Please enter valid OTP", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const idToken = await confirmPhoneOTP(confirmationResult, otp)
      // Send token to server to verify
      const res = await fetch("/api/auth/verify-phone", {
        method: "POST",
        body: JSON.stringify({ idToken }),
        headers: { "Content-Type": "application/json" },
      })
      if (res.ok) {
        toast({ title: "Phone verified!" })
        setStep("phone")
        setPhone("")
        setOtp("")
      } else {
        toast({ title: "Verification failed", variant: "destructive" })
      }
    } catch (error) {
      toast({
        title: "Verification failed",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div ref={recaptchaRef} className="mb-4" />
      {step === "phone" ? (
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Label>Phone Number</Label>
            <Input
              placeholder="+234 800 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Button onClick={handleSendOTP} disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </Button>
        </div>
      ) : (
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Label>Enter OTP</Label>
            <Input
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          <Button onClick={handleVerifyOTP} disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </div>
      )}
    </div>
  )
}