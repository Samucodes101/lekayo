import { NextRequest, NextResponse } from "next/server"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const folder = formData.get("folder") as string || "general"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const result = (await uploadToCloudinary(file, folder)) as any
    return NextResponse.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    const message =
      error?.message || error?.error?.message || String(error)
    return NextResponse.json(
      { error: "Upload failed", details: message },
      { status: 500 },
    )
  }
}